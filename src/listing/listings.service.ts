import { Injectable } from '@nestjs/common';
import { buildMongoFilters } from './utils/query-parser.util';
import { PrismaService } from '../prisma/prisma.service';
import { QueryListingsDto } from './dto/query-listings.dto';

const MAX_PAGE_SIZE = 50;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryListingsDto) {
    const filter = buildMongoFilters(query);

    // Sanitize and enforce pagination limits
    const page = query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit || 50, MAX_PAGE_SIZE);
    const skip = (page - 1) * limit;

    // Whitelist sort fields
    const allowedSortFields = [
      'name', 'city', 'country', 'pricePerNight', 'priceSegment', 'isAvailable',
    ];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'pricePerNight';
    const sortDirection = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      }),
      this.prisma.listing.count({ where: filter }),
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data,
    };
  }
}
