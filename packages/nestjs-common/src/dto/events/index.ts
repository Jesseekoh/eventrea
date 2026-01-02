import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class FindEventDto {
  @IsString()
  slug: string;
}

export class QueryEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // For searching across title and description
}

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsMongoId()
  id?: string;
}
