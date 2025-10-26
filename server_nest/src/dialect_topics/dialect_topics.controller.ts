import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { DialectTopicsService } from './dialect_topics.service';

@Controller('dialect-topics')
export class DialectTopicsController {
  constructor(private readonly topicsService: DialectTopicsService) {}

  @Get()
  findAll() {
    return this.topicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.topicsService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.topicsService.create(body.name);
  }
}
