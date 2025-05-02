import { IsOptional, IsInt, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryListingsDto {
  @ApiProperty({ description: 'Search term for name, city, or country', required: false, type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Dynamic filters (e.g., { "priceSegment": "high", "metadata.rating": 5 })', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Field to sort by', required: false, type: String })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc/desc)', required: false, enum: ['asc', 'desc'], type: String })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Number of items per page', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit? = 20;

  @ApiProperty({ description: 'Page number', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page? = 1;
}
