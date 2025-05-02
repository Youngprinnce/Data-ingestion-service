import { IngestionResponseDto } from '../dto/ingestion-response.dto';

export interface IngestionStrategy {
  ingest(
    sourceUrl: string,
    fieldMapping: Record<string, string>,
    onBatch: (batch: IngestionResponseDto[]) => Promise<void>
  ): Promise<void>;
}
