import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export enum PriceSegment {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryListingsDto {
  @ApiPropertyOptional({
    description: 'Search term for partial, case-insensitive matches on name, city, or country',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by price segment (low, medium, high)',
    enum: PriceSegment,
  })
  @IsOptional()
  @IsEnum(PriceSegment)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  priceSegment?: PriceSegment;

  @ApiPropertyOptional({
    description: 'Filter by availability (true/false)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum price per night (integer)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (isNaN(Number(value)) ? undefined : Math.floor(Number(value))))
  pricePerNightMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price per night (integer)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (isNaN(Number(value)) ? undefined : Math.floor(Number(value))))
  pricePerNightMax?: number;

  @ApiPropertyOptional({
    description: 'Page number (positive integer, default: 1)',
    type: Number,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (isNaN(Number(value)) ? 1 : Math.max(1, Math.floor(Number(value)))))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (positive integer, max: 50, default: 20)',
    type: Number,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (isNaN(Number(value)) ? 20 : Math.max(1, Math.floor(Number(value)))))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort order (asc/desc, default: asc)',
    enum: SortOrder,
    default: 'asc',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    description: 'Field to sort by (name, city, country, pricePerNight, priceSegment, isAvailable, default: pricePerNight)',
    default: 'pricePerNight',
  })
  @IsOptional()
  @IsIn(['name', 'city', 'country', 'pricePerNight', 'priceSegment', 'isAvailable'])
  sortBy?: string = 'pricePerNight';
}
