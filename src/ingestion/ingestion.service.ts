import { Injectable, Logger } from '@nestjs/common';
import { IngestionStrategyFactory } from './ingestion.strategy';
import { IngestionResponseDto, IngestionStrategyType } from './dto/ingestion-response.dto';
import { PrismaService } from '@src/prisma/prisma.service';

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

    await ingestionStrategy.ingest(url, fieldMapping, async (batch: IngestionResponseDto[]) => {
      this.logger.log(`Received batch of size ${batch.length}`);
      await this.saveBatch(batch);
    });

    this.logger.log(`Ingestion process completed for ${url}`);
  }

  private async saveBatch(batch: IngestionResponseDto[]): Promise<void> {
    if (!batch || batch.length === 0) return;

    try {
      // Process batch with upsert to handle deduplication
      const upsertPromises = batch.map((item) =>
        this.prisma.listing.upsert({
          where: { sourceId: item.sourceId },
          update: {
            name: item.name,
            city: item.city,
            country: item.country,
            isAvailable: item.isAvailable,
            pricePerNight: item.pricePerNight,
            priceSegment: item.priceSegment,
          },
          create: item,
        })
      );

      await Promise.all(upsertPromises);
      this.logger.log(`Saved batch of ${batch.length} listings with deduplication`);
    } catch (error) {
      this.logger.error(`Failed to save batch: ${error.message}`);
    }
  }
}
