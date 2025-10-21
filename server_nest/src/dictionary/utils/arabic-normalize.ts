/**
 * JS-версия нормализатора (используется в сервисе
 * для проверки/подготовки параметров перед SQL).
 * В БД у вас есть normalize_arabic(text) — SQL-функция;
 * при выполнении SQL мы оставляем вызовы DB-функции,
 * но в JS этот normalize помогает сформировать параметры.
 */
export function normalizeArabic(str?: string): string {
  if (!str) return '';

  // 1. Удаляем огласовки (U+064B–U+065F) и алиф с хамзой (U+0670)
  let normalized = str.replace(/[\u064B-\u065F]|\u0670/g, '');

  // 2. Заменяем хамзы: أ, إ, آ → ا
  normalized = normalized.replace(/[\u0623\u0625\u0622]/g, '\u0627');

  // 3. Заменяем алиф-максуру (ى) на йа (ي)
  normalized = normalized.replace(/\u0649/g, '\u064A');

  // 4. Удаляем zero-width символы (ZWJ, ZWNJ, BOM)
  normalized = normalized.replace(/[\u200C\u200D\uFEFF]/g, '');

  return normalized.trim().toLowerCase();
}
