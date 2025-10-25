// универсальная версия, принимает string | null | undefined
export function makeAbsoluteUrl<T extends string | null | undefined>(
  path: T,
): T extends string ? string : T {
  if (!path) return path as any;

  const base =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;

  if (path.startsWith('http')) return path as any;

  return `${base}${path.startsWith('/') ? '' : '/'}${path}` as any;
}
