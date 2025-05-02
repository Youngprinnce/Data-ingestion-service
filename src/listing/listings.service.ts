import { Injectable } from '@nestjs/common';
import { buildMongoFilters } from './utils/query-parser';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryListingsDto } from './dto/query-listings.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryListingsDto) {
    const filter = buildMongoFilters(query);

    const skip = (query.page - 1) * query.limit;
    const sort: any = {};

    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? 'desc' : 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: filter,
        skip,
        take: query.limit,
        orderBy: sort,
        select: {
          name: true,
          city: true,
          country: true,
          priceForNight: true,
          priceSegment: true,
          pricePerNight: true,
        },
      }),
      this.prisma.listing.count({ where: filter }),
    ]);

    return {
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
      data,
    };
  }
}
