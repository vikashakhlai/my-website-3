export function normalizeArabic(str?: string): string {
  if (!str) return '';

  let normalized = str.replace(/[\u064B-\u065F]|\u0670/g, '');

  normalized = normalized.replace(/[\u0623\u0625\u0622]/g, '\u0627');

  normalized = normalized.replace(/\u0649/g, '\u064A');

  normalized = normalized.replace(/[\u200C\u200D\uFEFF]/g, '');

  return normalized.trim().toLowerCase();
}
