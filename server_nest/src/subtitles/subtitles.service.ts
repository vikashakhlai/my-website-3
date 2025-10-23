import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SubtitlesService {
  async generateSubtitles(videoFile: string): Promise<string> {
    const videoPath = path.join(__dirname, '..', '..', 'uploads', videoFile);
    const outputDir = path.join(__dirname, '..', '..', 'uploads', 'subtitles');

    console.log('🎧 Путь к видео:', videoPath); // ✅ Добавим лог для проверки

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Файл не найден: ${videoPath}`);
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const srtFile = path.join(outputDir, `${path.parse(videoFile).name}.srt`);

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(
        __dirname,
        '..',
        '..',
        'subtitles_pipeline',
        'generate_srt.py',
      );

      console.log('🐍 Скрипт Python:', scriptPath);

      const python = spawn(
        'C:\\Users\\tula1\\AppData\\Local\\Programs\\Python\\Python311\\python.exe',
        [scriptPath, videoPath, srtFile],
        { stdio: 'inherit' },
      );

      python.on('close', (code) => {
        if (code === 0 && fs.existsSync(srtFile)) {
          resolve(srtFile);
        } else {
          reject(new Error(`Python exited with code ${code}`));
        }
      });
    });
  }
}
