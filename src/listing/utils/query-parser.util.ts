import { QueryListingsDto } from '../dto/query-listings.dto';

export function buildMongoFilters(query: QueryListingsDto): Record<string, any> {
  const filter: Record<string, any> = {};

  // Handle text search
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Handle dynamic filters
  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (key.startsWith('metadata.')) {
        // Handle metadata subfields (e.g., metadata.rating)
        filter[key] = value;
      } else if (key === 'isAvailable') {
        // Handle boolean fields
        filter[key] = value === 'true' || value === true;
      } else if (key === 'priceSegment') {
        // Handle enum fields
        filter[key] = value.toUpperCase();
      } else if (key.endsWith('Min')) {
        // Handle range minimum (e.g., pricePerNightMin)
        const field = key.replace('Min', '');
        filter[field] = filter[field] || {};
        filter[field].$gte = +value;
      } else if (key.endsWith('Max')) {
        // Handle range maximum (e.g., pricePerNightMax)
        const field = key.replace('Max', '');
        filter[field] = filter[field] || {};
        filter[field].$lte = +value;
      } else {
        // Handle direct equality (e.g., city, country)
        filter[key] = value;
      }
    }
  }

  return filter;
}
