import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { Era } from '../personality.entity';

export class CreatePersonalityDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() years!: string;
  @ApiProperty() @IsString() position!: string;
  @ApiProperty() @IsString() biography!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  facts!: string[];

  @ApiProperty({ enum: Era })
  @IsEnum(Era)
  era!: Era;

  @ApiProperty({
    example: '/uploads/personalities_photoes/default.webp',
  })
  @IsString()
  imageUrl!: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  bookIds!: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  articleIds!: number[];
}

export class UpdatePersonalityDto extends CreatePersonalityDto {}
