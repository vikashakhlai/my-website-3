// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return '✅ NestJS is running!';
  }

  @Get('env-test')
  getEnvTest() {
    return {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      NODE_ENV: process.env.NODE_ENV,
    };
  }
}
