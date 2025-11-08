import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Media } from 'src/media/media.entity';

@Injectable()
export class SubtitlesService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  /**
   * Генерирует субтитры для видео файла
   * @param filename - Имя файла (без пути, только имя файла)
   * @param userId - ID пользователя для проверки доступа
   * @returns Путь к созданному файлу субтитров
   */
  async generateSubtitles(filename: string, userId?: string): Promise<string> {
    // Защита от path traversal - проверяем, что filename не содержит путь
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      throw new BadRequestException(
        'Имя файла не может содержать пути. Используйте только имя файла.',
      );
    }

    // Нормализуем имя файла - убираем все опасные символы
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename) {
      throw new BadRequestException('Некорректное имя файла');
    }

    // Проверяем, что файл существует в базе данных (связан с медиа)
    // Проверяем различные форматы пути, которые могут быть в базе
    const media = await this.mediaRepo.findOne({
      where: [
        { mediaUrl: `uploads/media/${safeFilename}` },
        { mediaUrl: `/uploads/media/${safeFilename}` },
        { mediaUrl: `./uploads/media/${safeFilename}` },
        { mediaUrl: `media/${safeFilename}` },
        { mediaUrl: `/media/${safeFilename}` },
      ],
    });

    if (!media) {
      throw new NotFoundException(
        'Медиа-файл не найден в базе данных. Убедитесь, что файл загружен через систему медиа.',
      );
    }

    const videoPath = path.join(
      process.cwd(),
      'uploads',
      'media',
      safeFilename,
    );
    const outputDir = path.join(process.cwd(), 'uploads', 'subtitles');

    // Проверяем существование видео файла
    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException(`Видео файл не найден: ${safeFilename}`);
    }

    // Создаем директорию для субтитров, если её нет
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const srtFile = path.join(outputDir, `${path.parse(safeFilename).name}.srt`);

    // Получаем путь к Python из переменной окружения или используем дефолтный
    const pythonPath =
      process.env.PYTHON_PATH ||
      'C:\\Users\\tula1\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';

    const scriptPath = path.join(
      process.cwd(),
      'subtitles_pipeline',
      'generate_srt.py',
    );

    // Проверяем существование скрипта
    if (!fs.existsSync(scriptPath)) {
      throw new NotFoundException('Скрипт генерации субтитров не найден');
    }

    return new Promise((resolve, reject) => {
      const python = spawn(pythonPath, [scriptPath, videoPath, srtFile], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      python.on('error', (error) => {
        reject(
          new BadRequestException(
            `Ошибка запуска Python: ${error.message}. Убедитесь, что Python установлен и путь указан в PYTHON_PATH.`,
          ),
        );
      });

      python.on('close', (code) => {
        if (code === 0 && fs.existsSync(srtFile)) {
          // Обновляем ссылку на субтитры в базе данных
          const foundMedia = media;
          if (foundMedia) {
            foundMedia.subtitlesLink = `/uploads/subtitles/${path.basename(srtFile)}`;
            this.mediaRepo.save(foundMedia).catch((err) => {
              console.error('Ошибка обновления ссылки на субтитры:', err);
            });
          }
          resolve(srtFile);
        } else {
          reject(
            new BadRequestException(
              `Ошибка генерации субтитров. Python завершился с кодом ${code}`,
            ),
          );
        }
      });
    });
  }
}
