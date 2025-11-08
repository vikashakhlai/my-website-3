import { ApiProperty } from '@nestjs/swagger';

class VerbFormDto {
  @ApiProperty({ example: 1 })
  form_number!: number;

  @ApiProperty({ example: 'I' })
  form_roman!: string;

  @ApiProperty({ example: 'يكتب' })
  form_ar!: string;

  @ApiProperty({ example: 'он пишет' })
  meaning_ru!: string;
}

class UsageExampleDto {
  @ApiProperty({ example: 'sentence' })
  type!: string;

  @ApiProperty({ example: 'هذا كتاب' })
  text_ar!: string;

  @ApiProperty({ example: 'Это книга' })
  text_ru!: string;

  @ApiProperty({ example: 'general' })
  context!: string;
}

export class DictionaryWordDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'كتب' })
  word_ar!: string;

  @ApiProperty({ example: 'писать' })
  word_ru!: string;

  @ApiProperty({ example: 'كتب' })
  root_ar!: string;

  @ApiProperty({ example: 'глагол' })
  part_of_speech!: string;

  @ApiProperty({ type: [VerbFormDto], nullable: true })
  verb_forms!: VerbFormDto[];

  @ApiProperty({ type: [UsageExampleDto], nullable: true })
  examples!: UsageExampleDto[];
}

export class SearchDictionaryResponseDto {
  @ApiProperty({ type: [DictionaryWordDto] })
  results!: DictionaryWordDto[];

  @ApiProperty({ example: 10 })
  total!: number;
}

export class SearchByRootResponseDto {
  @ApiProperty({ example: 'كتب' })
  root!: string;

  @ApiProperty({ example: 'كتب' })
  original_input!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/DictionaryWordDto',
      },
    },
  })
  grouped!: Record<string, DictionaryWordDto[]>;
}

export class AutocompleteResponseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        word_ar: { example: 'كتب' },
        word_ru: { example: 'писать' },
        root_ar: { example: 'كتب' },
        label: { example: 'كتب — писать' },
      },
    },
  })
  suggestions!: Array<{
    word_ar: string;
    word_ru: string;
    root_ar: string;
    label: string;
  }>;
}
