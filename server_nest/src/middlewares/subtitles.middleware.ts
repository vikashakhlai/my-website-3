import { Request, Response } from 'express';
import { createReadStream, statSync, readFileSync, existsSync } from 'fs';
import { join, extname, normalize } from 'path';

export function subtitlesMiddleware(req: Request, res: Response) {
  try {
    const { dialect, filename } = req.params;

    if (!dialect || !filename) {
      return res
        .status(400)
        .send('Некорректный запрос: отсутствует dialect или filename');
    }

    const baseDir = join(__dirname, '..', '..', 'uploads', 'dialect');
    const subtitlesPath = normalize(
      join(baseDir, dialect, 'subtitles', filename),
    );

    // 🔐 Защита от path traversal
    if (!subtitlesPath.startsWith(baseDir)) {
      return res.status(400).send('Недопустимый путь к файлу');
    }

    // 🔍 Проверяем существование файла
    if (!existsSync(subtitlesPath)) {
      return res.status(404).send('Субтитры не найдены');
    }

    const ext = extname(subtitlesPath).toLowerCase();
    const allowedExt = ['.vtt', '.srt'];

    if (!allowedExt.includes(ext)) {
      return res.status(400).send('Неподдерживаемый формат субтитров');
    }

    // ✅ Если WebVTT — отдаём как есть
    if (ext === '.vtt') {
      const stat = statSync(subtitlesPath);
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': 'text/vtt; charset=utf-8',
      });
      return createReadStream(subtitlesPath).pipe(res);
    }

    // 🔄 Если SRT — конвертируем в VTT
    if (ext === '.srt') {
      const srtContent = readFileSync(subtitlesPath, 'utf-8');

      const vttContent =
        'WEBVTT\n\n' +
        srtContent
          .replace(/\r+/g, '')
          .replace(
            /(\d+)\n(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g,
            '$1\n$2.$3 --> $4.$5',
          )
          .trim();

      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      return res.status(200).send(vttContent);
    }
  } catch (err) {
    console.error('🔥 Ошибка при отдаче субтитров:', err);
    return res.status(500).send('Ошибка сервера при загрузке субтитров');
  }
}
