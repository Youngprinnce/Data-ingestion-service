import { IsOptional, IsBooleanString, IsInt, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryListingsDto {
  @ApiProperty({ description: 'Search term for name, city, or country', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Dynamic filters (e.g., { "priceSegment": "high", "metadata.rating": 5 })', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Field to sort by', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc/desc)', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Number of items per page', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit = 20;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page = 1;
}
