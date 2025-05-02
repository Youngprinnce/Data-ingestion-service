import { Injectable, Logger } from '@nestjs/common';
import { HttpServiceWrapper } from '../utils/http-wrapper';
import { IngestionStrategy } from '../interfaces/ingestion-strategy.interface';

interface ApiAccommodation {
  id: number;
  name: string;
  address: {
    country: string;
    city: string;
  };
  isAvailable: boolean;
  priceForNight: number;
}

@Injectable()
export class SimpleFetchStrategy implements IngestionStrategy {
  private readonly logger = new Logger(SimpleFetchStrategy.name);

  constructor(private readonly http: HttpServiceWrapper) {}

  async ingest(url: string): Promise<IngestionResponseDto[]> {
    this.logger.log(`Starting ingestion using SimpleFetchStrategy from: ${url}`);

    try {
      // Fetch the data from the external API
      const data = await this.http.callApi<ApiAccommodation[]>(url, 'GET') as ApiAccommodation[];

      // Transform the data into IngestionResponseDto format
      const transformed = this.transform(data);

      this.logger.log(`Successfully ingested ${transformed.length} records from: ${url}`);
      return transformed;
    } catch (error) {
      this.logger.error(`Failed to ingest from ${url}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private transform(data: ApiAccommodation[]): IngestionResponseDto[] {
    return data.map(item => ({
      sourceId: String(item.id),
      name: item.name,
      city: item.address.city,
      country: item.address.country,
      isAvailable: item.isAvailable,
      priceForNight: item.priceForNight,
    }));
  }
}
