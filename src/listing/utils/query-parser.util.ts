import { QueryListingsDto } from '../dto/query-listings.dto';

export function buildMongoFilters(query: QueryListingsDto): Record<string, any> {
  const filter: Record<string, any> = {};

  // Handle text search with contains
  if (query.search?.trim()) {
    const term = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
    filter.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { city: { contains: term, mode: 'insensitive' } },
      { country: { contains: term, mode: 'insensitive' } },
    ];
  }

  // Handle standard filters
  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable;
  }

  if (query.priceSegment) {
    filter.priceSegment = query.priceSegment.toUpperCase(); // Match schema enum
  }

  if (query.pricePerNightMin !== undefined || query.pricePerNightMax !== undefined) {
    filter.pricePerNight = {};
    if (query.pricePerNightMin !== undefined) {
      filter.pricePerNight.gte = query.pricePerNightMin;
    }
    if (query.pricePerNightMax !== undefined) {
      filter.pricePerNight.lte = query.pricePerNightMax;
    }
  }

  return filter;
}
