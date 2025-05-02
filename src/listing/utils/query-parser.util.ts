import { QueryListingsDto } from '../dto/query-listings.dto';

export function buildMongoFilters(query: QueryListingsDto): Record<string, any> {
  const filter: Record<string, any> = {};

  // Text search using Prisma-compatible `contains`
  if (query.search) {
    const searchTerm = query.search.trim();
    filter.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { city: { contains: searchTerm, mode: 'insensitive' } },
      { country: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Dynamic filters
  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (key.startsWith('metadata.')) {
        const [, subKey] = key.split('.');
        filter.metadata = filter.metadata || {};
        filter.metadata[subKey] = value;
      } else if (key === 'isAvailable') {
        filter.isAvailable = value === 'true' || value === true;
      } else if (key === 'priceSegment') {
        filter.priceSegment = String(value).toUpperCase();
      } else if (key.endsWith('Min')) {
        const field = key.replace('Min', '');
        filter[field] = { ...filter[field], gte: Number(value) };
      } else if (key.endsWith('Max')) {
        const field = key.replace('Max', '');
        filter[field] = { ...filter[field], lte: Number(value) };
      } else {
        filter[key] = value;
      }
    }
  }

  return filter;
}

