import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { ListingsService } from "./listings.service";
import { QueryListingsDto } from "./dto/query-listings.dto";

@ApiTags("Listings")
@Controller("listings")
export class ListingsController {
  constructor(private readonly listingService: ListingsService) {}

  @Get()
  @ApiResponse({ status: 200, description: "List of listings" })
  @ApiResponse({ status: 400, description: "Invalid query parameters" })
  findAll(@Query() query: QueryListingsDto) {
    return this.listingService.findAll(query);
  }
}
