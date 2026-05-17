import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory, EventStatus } from '@eventrea/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026', description: 'Event title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A conference about the latest in tech.', description: 'Event description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: EventCategory, example: EventCategory.CONFERENCE, description: 'Event category' })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.DRAFT, description: 'Event status (USER role is restricted to DRAFT)' })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiProperty({ example: '2026-07-01T09:00:00.000Z', description: 'Event start date (ISO 8601)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-01T17:00:00.000Z', description: 'Event end date (ISO 8601)' })
  @IsDateString()
  endDate: string;

  // Location
  @ApiPropertyOptional({ example: 'Convention Center', description: 'Venue name' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Street address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Lagos', description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Nigeria', description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the event is online' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOnline?: boolean;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc', description: 'Online event URL' })
  @IsOptional()
  @IsString()
  onlineUrl?: string;

  // Capacity & pricing
  @ApiPropertyOptional({ example: 500, description: 'Maximum number of attendees', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @ApiPropertyOptional({ example: 29.99, description: 'Ticket price', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Price currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the event is free' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFree?: boolean;

  // Media
  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg', description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  coverImage?: string;
}
