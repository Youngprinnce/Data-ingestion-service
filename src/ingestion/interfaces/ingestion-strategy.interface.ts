export interface IngestionStrategy {
  ingest(
    sourceUrl: string,
    onBatch?: (batch: IngestionResponseDto[]) => Promise<void>
  ): Promise<IngestionResponseDto[] | void>;
}
