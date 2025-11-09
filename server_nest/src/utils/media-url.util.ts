export function makeAbsoluteUrl<T extends string | null | undefined>(
  path: T,
): T extends string ? string : T {
  if (!path) {
    return path as T extends string ? string : T;
  }

  const isAbsolute =
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//');

  if (isAbsolute) {
    return path as T extends string ? string : T;
  }

  let base = process.env.BACKEND_URL;

  if (!base) {
    const port = process.env.PORT || 3001;
    base = `http://localhost:${port}`;
  }

  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `http://${base}`;
  }

  const result = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  return result as T extends string ? string : T;
}
