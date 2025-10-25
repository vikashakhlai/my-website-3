import { Request, Response } from 'express';
import { createReadStream, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

export function subtitlesMiddleware(req: Request, res: Response) {
  const { dialect, filename } = req.params;
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

  try {
    const ext = extname(subtitlesPath).toLowerCase();

    // Проверяем, что файл существует
    const stat = statSync(subtitlesPath);
    const fileSize = stat.size;

    // Если .vtt → просто отдаем как есть
    if (ext === '.vtt') {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'text/vtt; charset=utf-8',
      });
      return createReadStream(subtitlesPath).pipe(res);
    }

    // Если .srt → конвертируем в WebVTT "на лету"
    if (ext === '.srt') {
      const srt = readFileSync(subtitlesPath, 'utf-8');

      // Простейшая конвертация в WebVTT
      const vtt =
        'WEBVTT\n\n' +
        srt
          .replace(/\r+/g, '')
          .replace(
            /(\d+)\n(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g,
            '$1\n$2.$3 --> $4.$5',
          ) // заменяем запятые на точки
          .trim();

      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      return res.send(vtt);
    }

    // Если что-то другое — ошибка
    res.status(400).send('Неподдерживаемый формат субтитров');
  } catch (err) {
    console.error('Ошибка при отдаче субтитров:', err);
    res.status(404).send('Субтитры не найдены');
  }
}
