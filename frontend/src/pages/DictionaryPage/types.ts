// types.ts

export interface VerbForm {
  form_number: number;
  form_roman: string;
  form_ar: string;
  meaning_ru: string;
}

export interface UsageExample {
  type: "example" | "expression";
  text_ar: string;
  text_ru: string;
  context: string | null;
}

export interface DictionaryWord {
  id: number;
  word_ar: string;
  word_ar_normalized: string;
  word_ru: string;
  root_ar: string;
  part_of_speech: string;
  verb_forms: VerbForm[];
  examples: UsageExample[];
}

export interface SearchResult {
  results: DictionaryWord[];
  total: number;
}

export interface RootGroupedResult {
  root: string | null;
  grouped: {
    [key: string]: DictionaryWord[];
  };
}

export interface Suggestion {
  word_ar: string;
  word_ru: string;
  root_ar: string;
  label: string;
}

export interface SearchedForm {
  form_ar: string;
  form_number: number;
  meaning_ru: string;
  form_roman: string;
}

export interface RootGroupedResultWithSearchedForm extends RootGroupedResult {
  searched_form?: SearchedForm;
}
