import { VerbForm } from "../types";

// Проверка на наличие арабских символов
export const hasArabicChars = (str: string): boolean => {
  return /[\u0600-\u06FF]/.test(str);
};

// Нормализация арабского текста (удаление огласовок и унификация букв)
export const normalizeArabic = (str: string): string => {
  if (!str) return "";
  let normalized = str.replace(/[\u064B-\u0652\u0654-\u065F\u0670]/g, "");
  normalized = normalized.replace(/[\u0623\u0625\u0622]/g, "\u0627");
  normalized = normalized.replace(/\u0649/g, "\u064A");
  return normalized.trim();
};

// Преобразование числа в римское (для форм глаголов)
export const toRoman = (num: number): string => {
  if (num < 1 || num > 15) return String(num);
  const map: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
    13: "XIII",
    14: "XIV",
    15: "XV",
  };
  return map[num] || String(num);
};

// Обогащает формы глаголов римскими цифрами
export const enrichVerbForms = (forms: VerbForm[]): VerbForm[] => {
  if (!forms || forms.length === 0) return [];
  return forms.map((form) => ({
    ...form,
    form_roman: toRoman(form.form_number),
  }));
};
