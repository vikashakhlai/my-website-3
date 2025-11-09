import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import sanitize from 'sanitize-filename';

@Injectable()
export class SubtitlesService {
  async generateSubtitles(videoFile: string): Promise<string> {
    if (
      !videoFile ||
      typeof videoFile !== 'string' ||
      videoFile.trim() === ''
    ) {
      throw new BadRequestException('Имя видеофайла обязательно');
    }

    const sanitizedVideoFile = sanitize(videoFile);
    if (videoFile !== sanitizedVideoFile) {
      throw new BadRequestException('Недопустимое имя файла');
    }

    const allowedExtensions = [
      '.mp4',
      '.avi',
      '.mov',
      '.mkv',
      '.webm',
      '.flv',
      '.wmv',
      '.mpg',
      '.mpeg',
      '.3gp',
      '.3g2',
      '.m4v',
      '.f4v',
      '.f4p',
      '.f4a',
      '.f4b',
      '.ts',
      '.mts',
      '.vob',
      '.ogv',
      '.ogm',
      '.drc',
      '.gif',
      '.gifv',
      '.mng',
    ];
    const ext = path.extname(sanitizedVideoFile).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException('Недопустимый формат видеофайла');
    }

    const videoPath = path.join(__dirname, '..', '..', 'uploads', videoFile);
    const outputDir = path.join(__dirname, '..', '..', 'uploads', 'subtitles');

    if (!fs.existsSync(videoPath)) {
      throw new BadRequestException(`Файл не найден: ${videoPath}`);
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      const srtFile = path.join(
        outputDir,
        `${path.parse(sanitizedVideoFile).name}.srt`,
      );

      return new Promise((resolve, reject) => {
        const scriptPath = path.join(
          __dirname,
          '..',
          '..',
          'subtitles_pipeline',
          'generate_srt.py',
        );

        const pythonPath = process.env.PYTHON_PATH || 'python';

        const python = spawn(pythonPath, [scriptPath, videoPath, srtFile], {
          stdio: 'pipe',
          env: process.env,
        });

        let stderr = '';
        python.stderr?.on('data', (data: Buffer) => {
          stderr += data.toString();
        });

        python.on('close', (code) => {
          if (code === 0 && fs.existsSync(srtFile)) {
            console.log('Субтитры созданы:', srtFile);
            resolve(srtFile);
          } else {
            console.error('Ошибка Python:', stderr);
            reject(
              new InternalServerErrorException(
                `Python script failed with code ${code}. Error: ${stderr}`,
              ),
            );
          }
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Ошибка при генерации субтитров');
    }
  }
}
