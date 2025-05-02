import { IsOptional, IsBooleanString, IsInt, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class QueryListingsDto {
  @ApiProperty({ description: 'Filter by name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by city', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Filter by country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Filter by availability (true/false)', required: false })
  @IsOptional()
  @IsBooleanString()
  isAvailable?: string;

  @ApiProperty({ description: 'Minimum price', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceMin?: number;

  @ApiProperty({ description: 'Maximum price', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priceMax?: number;

  @ApiProperty({ description: 'Field to sort by', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc/desc)', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

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
