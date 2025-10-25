import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

export function videoStreamMiddleware(req: Request, res: Response) {
  const { dialect, filename } = req.params;
  const videoPath = join(
    __dirname,
    '..',
    '..',
    'uploads',
    'dialect',
    dialect,
    'videos',
    filename,
  );

  try {
    const stat = statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      createReadStream(videoPath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = createReadStream(videoPath, { start, end });

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } catch (err) {
    console.error('Ошибка при отдаче видео:', err);
    res.status(404).send('Видео не найдено');
  }
}
