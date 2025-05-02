import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryListingsDto } from './dto/query-listings.dto';

// Sample mock data
const mockListings = [
  {
    id: '1',
    name: 'Paris Loft',
    city: 'Paris',
    country: 'France',
    pricePerNight: 150,
    priceSegment: 'MEDIUM',
    isAvailable: true,
    metadata: { rating: 4.5 },
  },
  {
    id: '2',
    name: 'Tokyo Suite',
    city: 'Tokyo',
    country: 'Japan',
    pricePerNight: 200,
    priceSegment: 'HIGH',
    isAvailable: false,
    metadata: { rating: 5 },
  },
];

// Mock PrismaService
const mockPrismaService = {
  listing: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    prisma = module.get(PrismaService);

    // Reset mocks
    vi.resetAllMocks();

    // Default mock behavior
    prisma.listing.findMany.mockResolvedValue(mockListings);
    prisma.listing.count.mockResolvedValue(mockListings.length);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should handle empty query with default pagination and sorting', async () => {
      const query: QueryListingsDto = {};
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { pricePerNight: 'asc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(prisma.listing.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        meta: { total: 2, page: 1, limit: 50, pages: 1 },
        data: mockListings,
      });
    });

    it('should handle text search', async () => {
      const query: QueryListingsDto = { search: 'Paris' };
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'Paris', mode: 'insensitive' } },
            { city: { contains: 'Paris', mode: 'insensitive' } },
            { country: { contains: 'Paris', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 50,
        orderBy: { pricePerNight: 'asc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(result.data).toEqual(mockListings);
    });

    it('should handle dynamic filters', async () => {
      const query: QueryListingsDto = {
        filters: { priceSegment: 'high', isAvailable: 'true' },
      };
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { priceSegment: 'HIGH', isAvailable: true },
        skip: 0,
        take: 50,
        orderBy: { pricePerNight: 'asc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(result.data).toEqual(mockListings);
    });

    it('should handle pagination', async () => {
      const query: QueryListingsDto = { page: 2, limit: 10 };
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 10,
        orderBy: { pricePerNight: 'asc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });

    it('should handle invalid page and limit values', async () => {
      const query: QueryListingsDto = { page: -1, limit: 200 };
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50, // Enforced max limit
        orderBy: { pricePerNight: 'asc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(50);
    });

    it('should handle sorting', async () => {
      const query: QueryListingsDto = { sortBy: 'name', sortOrder: 'desc' };
      const result = await service.findAll(query);

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { name: 'desc' },
        select: {
          name: true,
          city: true,
          country: true,
          pricePerNight: true,
          priceSegment: true,
          isAvailable: true,
          metadata: true,
        },
      });
      expect(result.data).toEqual(mockListings);
    });
  });
});
