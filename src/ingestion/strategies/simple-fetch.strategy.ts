import { Injectable, Logger } from '@nestjs/common';
import { HttpServiceWrapper } from '../../common/http-wrapper';
import { IngestionStrategy } from '../interfaces/ingestion-strategy.interface';
import { IngestionResponseDto } from '../dto/ingestion-response.dto';
import { ConfigService } from '@nestjs/config';
import { FieldMapper } from '../utils/field-mapper.utils';

@Injectable()
export class SimpleFetchStrategy implements IngestionStrategy {
  private readonly logger = new Logger(SimpleFetchStrategy.name);
  private readonly batchSize: number;

  constructor(
    private readonly http: HttpServiceWrapper,
    private readonly fieldMapper: FieldMapper,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('ingestion.batchSize', 1000);
  }

  async ingest(
    url: string,
    fieldMapping: Record<string, string>,
    onBatch: (batch: IngestionResponseDto[]) => Promise<void>,
  ): Promise<void> {
    this.logger.log(`Starting ingestion using SimpleFetchStrategy from: ${url}`);

    try {
      const data = await this.http.callApi<any[]>(url, 'GET');
      const transformed: IngestionResponseDto[] = data.map((item: Record<string, any>) => 
        this.fieldMapper.mapFields(item, fieldMapping)
      ) as IngestionResponseDto[];

      // Process data in batches
      for (let i = 0; i < transformed.length; i += this.batchSize) {
        const batch = transformed.slice(i, i + this.batchSize);
        this.logger.log(`Sending batch of ${batch.length} records`);
        await onBatch(batch);
      }

      this.logger.log(`Successfully ingested ${transformed.length} records from: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to ingest from ${url}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
