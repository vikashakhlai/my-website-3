import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { normalizeArabic as normalizeArabicJS } from './utils/arabic-normalize';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(private readonly dataSource: DataSource) {}

  private toRoman(num: number | null | undefined): string {
    if (!num || typeof num !== 'number') return String(num ?? '');
    if (num < 1 || num > 15) return String(num);
    const map: Record<number, string> = {
      1: 'I',
      2: 'II',
      3: 'III',
      4: 'IV',
      5: 'V',
      6: 'VI',
      7: 'VII',
      8: 'VIII',
      9: 'IX',
      10: 'X',
      11: 'XI',
      12: 'XII',
      13: 'XIII',
      14: 'XIV',
      15: 'XV',
    };
    return map[num] || String(num);
  }

  private enrichVerbForms(forms: any[]): any[] {
    if (!forms || forms.length === 0) return [];
    return forms.map((f) => ({
      ...f,
      form_roman: this.toRoman(f.form_number),
    }));
  }

  async searchDictionary(query: string) {
    const searchQuery = (query ?? '').trim();
    if (!searchQuery) {
      throw new BadRequestException("Параметр 'query' обязателен");
    }

    const hasArabic = /[\u0600-\u06FF]/.test(searchQuery);
    const normalizedQuery = hasArabic
      ? normalizeArabicJS(searchQuery)
      : searchQuery;
    const normalizedArabicPattern = hasArabic ? normalizedQuery : '';

    try {
      const sql = `
      WITH matched_words AS (
        -- 1. Совпадения по основному слову (words)
        SELECT w.id, 'word' AS source
        FROM words w
        WHERE 
          ($1 != '' AND w.word_ar_normalized ILIKE $1 || '%')
          OR ($2 != '' AND w.word_ru ILIKE '%' || $2 || '%')

        UNION

        -- 2. Совпадения по формам глаголов (verb_forms)
        SELECT DISTINCT w.id, 'verb_form' AS source
        FROM words w
        JOIN verb_forms vf ON w.id = vf.word_id
        WHERE $1 != '' AND normalize_arabic(vf.form_ar) ILIKE $1 || '%'
      )
      SELECT 
        w.id,
        w.word_ar,
        w.word_ru,
        w.root_ar,
        w.part_of_speech,
        json_agg(
          json_build_object(
            'form_number', vf.form_number,
            'form_ar', vf.form_ar,
            'meaning_ru', vf.meaning_ru
          )
          ORDER BY vf.form_number
        ) FILTER (WHERE vf.id IS NOT NULL) AS verb_forms,
        json_agg(
          json_build_object(
            'type', ue.example_type,
            'text_ar', ue.text_ar,
            'text_ru', ue.text_ru,
            'context', ue.context
          )
        ) FILTER (WHERE ue.id IS NOT NULL) AS examples
      FROM matched_words mw
      JOIN words w ON w.id = mw.id
      LEFT JOIN verb_forms vf ON w.id = vf.word_id
      LEFT JOIN usage_examples ue ON w.id = ue.word_id
      GROUP BY w.id
      ORDER BY 
        -- Приоритет: точное совпадение по основному слову > префикс > форма глагола > русский
        CASE 
          WHEN $1 != '' AND w.word_ar_normalized = $1 THEN 0
          WHEN $1 != '' AND w.word_ar_normalized ILIKE $1 || '%' THEN 1
          WHEN $1 != '' THEN 2  -- найдено через verb_forms
          WHEN $2 != '' AND w.word_ru ILIKE '%' || $2 || '%' THEN 3
          ELSE 4
        END,
        w.id
      LIMIT 20;
    `;

      const params = [normalizedArabicPattern, hasArabic ? '' : searchQuery];

      const rows = await this.dataSource.query(sql, params);
      const data = rows.map((row: any) => ({
        ...row,
        verb_forms: this.enrichVerbForms(row.verb_forms),
        examples: row.examples && row.examples.length > 0 ? row.examples : [],
      }));

      return { results: data, total: data.length };
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при поиске в словаре');
    }
  }

  async searchByRoot(root: string) {
    const inputRoot = (root ?? '').trim();
    if (!inputRoot) {
      throw new BadRequestException("Параметр 'root' обязателен");
    }

    try {
      let actualRoot = inputRoot;

      const directCheck = await this.dataSource.query(
        'SELECT 1 FROM words WHERE root_ar = $1 LIMIT 1',
        [inputRoot],
      );

      if (directCheck.length === 0) {
        const formCheck = await this.dataSource.query(
          `
        SELECT DISTINCT w.root_ar
        FROM words w
        JOIN verb_forms vf ON w.id = vf.word_id
        WHERE normalize_arabic(vf.form_ar) = normalize_arabic($1)
          OR w.word_ar_normalized = normalize_arabic($1)
        LIMIT 1
        `,
          [inputRoot],
        );

        if (formCheck.length > 0) {
          actualRoot = formCheck[0].root_ar;
        } else {
          const normalizedFormCheck = await this.dataSource.query(
            `
          SELECT DISTINCT w.root_ar
          FROM words w
          JOIN verb_forms vf ON w.id = vf.word_id
          WHERE normalize_arabic(vf.form_ar) ILIKE normalize_arabic($1) || '%'
          LIMIT 1
          `,
            [inputRoot],
          );
          if (normalizedFormCheck.length > 0) {
            actualRoot = normalizedFormCheck[0].root_ar;
          }
        }
      }

      const sql = `
      SELECT 
        w.id,
        w.word_ar,
        w.word_ru,
        w.root_ar,
        w.part_of_speech,
        COALESCE(vf_data.verb_forms, '[]'::json) AS verb_forms,
        COALESCE(ue_data.examples, '[]'::json) AS examples
      FROM words w
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'form_number', vf.form_number,
            'form_ar', vf.form_ar,
            'meaning_ru', vf.meaning_ru
          )
          ORDER BY vf.form_number
        ) AS verb_forms
        FROM verb_forms vf
        WHERE vf.word_id = w.id
      ) vf_data ON true
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'type', ue.example_type,
            'text_ar', ue.text_ar,
            'text_ru', ue.text_ru,
            'context', ue.context
          )
        ) AS examples
        FROM usage_examples ue
        WHERE ue.word_id = w.id
      ) ue_data ON true
      WHERE w.root_ar = $1
      ORDER BY 
        CASE w.part_of_speech
          WHEN 'глагол' THEN 1
          WHEN 'существительное' THEN 2
          ELSE 3
        END,
        w.id;
    `;

      const result = await this.dataSource.query(sql, [actualRoot]);

      const words = result.map((row: any) => ({
        ...row,
        verb_forms: this.enrichVerbForms(row.verb_forms),
        examples: row.examples && row.examples.length > 0 ? row.examples : [],
      }));

      const grouped = words.reduce((acc: Record<string, any[]>, w: any) => {
        const pos = w.part_of_speech || 'другое';
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(w);
        return acc;
      }, {});

      return { root: actualRoot, original_input: inputRoot, grouped };
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при поиске по корню');
    }
  }

  async autocomplete(q: string) {
    const query = (q ?? '').trim();
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    const hasArabic = /[\u0600-\u06FF]/.test(query);
    const normalizedQuery = hasArabic ? normalizeArabicJS(query) : query;

    try {
      const sql = `
      WITH suggestions AS (
        -- 1. Основные слова (words)
        SELECT DISTINCT
          w.id,
          w.word_ar,
          w.word_ru,
          w.root_ar,
          w.word_ar_normalized
        FROM words w
        WHERE 
          ($1 != '' AND w.word_ar_normalized ILIKE $1 || '%')
          OR ($2 != '' AND w.word_ru ILIKE '%' || $2 || '%')

        UNION

        -- 2. Формы глаголов → возвращаем основное слово
        SELECT DISTINCT
          w.id,
          w.word_ar,
          w.word_ru,
          w.root_ar,
          w.word_ar_normalized
        FROM words w
        JOIN verb_forms vf ON w.id = vf.word_id
        WHERE $1 != '' AND normalize_arabic(vf.form_ar) ILIKE $1 || '%'
      )
      SELECT 
        word_ar,
        word_ru,
        root_ar,
        CASE 
          WHEN $1 != '' THEN word_ar || ' — ' || word_ru
          ELSE word_ru || ' — ' || word_ar
        END AS label
      FROM suggestions
      ORDER BY 
        CASE 
          WHEN $1 != '' AND word_ar_normalized = $1 THEN 0
          WHEN $1 != '' AND word_ar_normalized ILIKE $1 || '%' THEN 1
          ELSE 2
        END,
        word_ar_normalized
      LIMIT 2;
    `;

      const params = [hasArabic ? normalizedQuery : '', hasArabic ? '' : query];
      const rows = await this.dataSource.query(sql, params);

      const suggestions = rows.map((r: any) => ({
        word_ar: r.word_ar,
        word_ru: r.word_ru,
        root_ar: r.root_ar,
        label: r.label,
      }));

      return { suggestions };
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при автодополнении');
    }
  }
}
