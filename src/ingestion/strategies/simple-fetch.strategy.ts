import { Injectable, Logger } from '@nestjs/common';
import { IngestionStrategy } from '../interfaces/ingestion-strategy.interface';
import { FieldMapper } from '../utils/field-mapper.utils';
import { IngestionResponseDto } from '../dto/ingestion-response.dto';
import { HttpServiceWrapper } from '@src/common/http-wrapper';

@Injectable()
export class SimpleFetchStrategy implements IngestionStrategy {
  private readonly logger = new Logger(SimpleFetchStrategy.name);

  constructor(
    private readonly http: HttpServiceWrapper,
    private readonly fieldMapper: FieldMapper,
  ) {}

  async ingest(
    url: string,
    fieldMapping: Record<string, string>,
  ): Promise<IngestionResponseDto[]> {
    this.logger.log(`Starting ingestion using SimpleFetchStrategy from: ${url}`);

    try {
      const data = await this.http.callApi<any[]>(url, 'GET');
      const transformed: IngestionResponseDto[] = data.map((item: Record<string, any>) => 
        this.fieldMapper.mapFields(item, fieldMapping)
      ) as IngestionResponseDto[];
      this.logger.log(`Successfully ingested ${transformed.length} records from: ${url}`);
      return transformed;
    } catch (error) {
      this.logger.error(`Failed to ingest from ${url}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
