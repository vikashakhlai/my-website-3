import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

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
    const stat = statSync(subtitlesPath);
    const fileSize = stat.size;

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'text/plain; charset=utf-8',
    });

    createReadStream(subtitlesPath).pipe(res);
  } catch (err) {
    console.error('Ошибка при отдаче субтитров:', err);
    res.status(404).send('Субтитры не найдены');
  }
}
