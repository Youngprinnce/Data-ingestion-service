export class IngestionResponseDto {
  sourceId: string;
  name?: string;
  city?: string;
  country?: string;
  isAvailable?: boolean;
  pricePerNight?: number;
  priceSegment?: PriceSegment;
}

export enum PriceSegment {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum IngestionStrategyType {
  SIMPLE = 'simple',
  STREAM = 'stream',
}
