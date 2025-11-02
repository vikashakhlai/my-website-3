export function makeAbsoluteUrl<T extends string | null | undefined>(
  path: T,
): T extends string ? string : T {
  if (!path) return path as any;

  const isAbsolute =
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//');

  if (isAbsolute) return path as any;

  let base = process.env.BACKEND_URL;

  if (!base) {
    const port = process.env.PORT || 3001;
    base = `http://localhost:${port}`;
  }

  // гарантируем наличие протокола
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `http://${base}`;
  }

  return `${base}${path.startsWith('/') ? '' : '/'}${path}` as any;
}
