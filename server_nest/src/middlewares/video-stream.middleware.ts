import { Request, Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

export function videoStreamMiddleware(req: Request, res: Response) {
  // ✅ Явные CORS заголовки
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Range, Content-Type, Origin, Accept',
  );
  res.header(
    'Access-Control-Expose-Headers',
    'Content-Range, Accept-Ranges, Content-Length',
  );
  res.header('Accept-Ranges', 'bytes');

  // ✅ Разрешаем preflight
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.sendStatus(200);
    return;
  }

  console.log(
    '🎬 videoStreamMiddleware triggered:',
    req.method,
    req.originalUrl,
  );

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

    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
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
    console.error('❌ Ошибка при отдаче видео:', err);
    res.status(404).send('Видео не найдено');
  }
}
