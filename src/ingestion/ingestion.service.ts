import { Injectable, Logger } from '@nestjs/common';
import { IngestionStrategyFactory } from './ingestion.strategy';
import { PrismaService } from '@src/prisma/prisma.service';
import { IngestionResponseDto, IngestionStrategyType } from './dto/ingestion-response.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly factory: IngestionStrategyFactory,
    private readonly prisma: PrismaService,
  ) {}

  async ingestData(sourceConfig: { url: string; strategy: string; fieldMapping: Record<string, string> }): Promise<void> {
    const { url, strategy, fieldMapping } = sourceConfig;
    this.logger.log(`Ingesting data from ${url} using strategy: ${strategy}`);
    const ingestionStrategy = this.factory.getStrategy(strategy as IngestionStrategyType);

    if (strategy === IngestionStrategyType.STREAM) {
      await ingestionStrategy.ingest(url, fieldMapping, async (batch: IngestionResponseDto[]) => {
        this.logger.log(`Received batch of size ${batch.length}`);
        await this.saveBatch(batch);
      });
    } else {
      const data = await ingestionStrategy.ingest(url, fieldMapping);
      if (data && data.length > 0) {
        this.logger.log(`Fetched ${data.length} records using simple strategy`);
        await this.saveBatch(data);
      }
    }

    this.logger.log(`Ingestion process completed for ${url}`);
  }

  private async saveBatch(batch: IngestionResponseDto[]) {
    if (!batch || batch.length === 0) return;

    const sourceIds = batch.map((item) => item.sourceId);
    const existing = await this.prisma.listing.findMany({
      where: { sourceId: { in: sourceIds } },
      select: { sourceId: true },
    });

    const existingIds = new Set(existing.map((e) => e.sourceId));
    const uniqueBatch = batch.filter((item) => !existingIds.has(item.sourceId));

    if (uniqueBatch.length === 0) {
      this.logger.log('All records in batch already exist. Skipping save.');
      return;
    }

    try {
      await this.prisma.listing.createMany({
        data: uniqueBatch,
      });
      this.logger.log(`Saved batch of ${uniqueBatch.length} deduplicated listings`);
    } catch (error) {
      this.logger.error(`Failed to save batch: ${error.message}`);
    }
  }
}
