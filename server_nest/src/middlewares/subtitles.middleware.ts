import { Request, Response } from 'express';
import { createReadStream, statSync, readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

export function subtitlesMiddleware(req: Request, res: Response) {
  console.log("🎬 subtitlesMiddleware вызван для:", req.originalUrl);
  try {
    const { dialect, filename } = req.params;

    if (!dialect || !filename) {
      return res
        .status(400)
        .send('Некорректный запрос: отсутствует dialect или filename');
    }

    const subtitlesPath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      'dialect',
      dialect,
      'subtitles',
      filename,
    );

    // 🔍 Проверяем существование файла
    if (!existsSync(subtitlesPath)) {
      console.warn('❌ Файл субтитров не найден:', subtitlesPath);
      return res.status(404).send('Субтитры не найдены');
    }

    const ext = extname(subtitlesPath).toLowerCase();

    // 🟢 Если формат WebVTT — просто отдаём
    if (ext === '.vtt') {
      const stat = statSync(subtitlesPath);
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'text/vtt; charset=utf-8',
      });
      return createReadStream(subtitlesPath).pipe(res);
    }

    // 🟡 Если формат SRT — конвертируем в WebVTT "на лету"
    if (ext === '.srt') {
      const srtContent = readFileSync(subtitlesPath, 'utf-8');

      // ✨ Простая, но корректная конвертация
      const vttContent =
        'WEBVTT\n\n' +
        srtContent
          .replace(/\r+/g, '')
          .replace(
            /(\d+)\n(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g,
            '$1\n$2.$3 --> $4.$5',
          ) // заменяем запятые на точки
          .trim();

      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      return res.status(200).send(vttContent);
    }

    // 🔴 Иначе — неподдерживаемый формат
    console.warn('⚠️ Неподдерживаемый формат субтитров:', ext);
    return res.status(400).send('Неподдерживаемый формат субтитров');
  } catch (err) {
    console.error('🔥 Ошибка при отдаче субтитров:', err);
    return res.status(500).send('Ошибка сервера при загрузке субтитров');
  }
}
