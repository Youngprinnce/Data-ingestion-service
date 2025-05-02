class IngestionResponseDto {
    sourceId: string;
    name?: string;
    city?: string;
    country?: string;
    isAvailable?: boolean;
    priceForNight?: number;
    pricePerNight?: number;
    priceSegment?: PriceSegment;
}

enum PriceSegment {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
