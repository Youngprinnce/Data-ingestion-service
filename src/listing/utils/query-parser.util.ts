export function buildMongoFilters(query: any): Record<string, any> {
  const filter: any = {};

  const textSearchFields = ['name', 'city', 'country'];
  for (const field of textSearchFields) {
    if (query[field]) {
      filter[field] = { $regex: query[field], $options: 'i' };
    }
  }

  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable === 'true';
  }

  if (query.priceMin != null || query.priceMax != null) {
    filter.priceForNight = {};
    if (query.priceMin != null) filter.priceForNight.$gte = +query.priceMin;
    if (query.priceMax != null) filter.priceForNight.$lte = +query.priceMax;
  }

  return filter;
}
