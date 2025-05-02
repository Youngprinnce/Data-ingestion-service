export function buildMongoFilters(query: any): any {
  const filter: any = {};

  if (query.name) filter.name = { $regex: query.name, $options: "i" };
  if (query.city) filter.city = { $regex: query.city, $options: "i" };
  if (query.country) filter.country = { $regex: query.country, $options: "i" };
  if (query.isAvailable !== undefined)
    filter.isAvailable = query.isAvailable === "true";

  if (query.priceMin || query.priceMax) {
    filter.priceForNight = {};
    if (query.priceMin) filter.priceForNight.$gte = Number(query.priceMin);
    if (query.priceMax) filter.priceForNight.$lte = Number(query.priceMax);
  }

  return filter;
}
