import { PrismaService } from "src/prisma/prisma.service";
import { IngestionStrategyFactory } from "./ingestion.strategy";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly factory: IngestionStrategyFactory,
    private readonly prisma: PrismaService
  ) {}

  async ingestData(url: string, strategyType: string): Promise<void> {
    this.logger.log(`Ingesting data using strategy: ${strategyType}`);
    const strategy = this.factory.getStrategy(strategyType);

    if (strategyType === "stream") {
      await strategy.ingest(url, async (batch: IngestionResponseDto[]) => {
        this.logger.log(`Received batch of size ${batch.length}`);
        await this.saveBatch(batch);
      });
    } else {
      const data = await strategy.ingest(url);
      if (data && data.length > 0) {
        this.logger.log(`Fetched ${data.length} records using simple strategy`);
        await this.saveBatch(data);
      }
    }

    this.logger.log(`Ingestion process completed for ${url}`);
  }

  private async saveBatch(batch: IngestionResponseDto[]) {
    if (!batch || batch.length === 0) return;

    // Step 1: Get unique sourceIds from incoming batch
    const sourceIds = batch.map((item) => item.sourceId);

    // Step 2: Find which sourceIds already exist
    const existing = await this.prisma.listing.findMany({
      where: { sourceId: { in: sourceIds } },
      select: { sourceId: true },
    });

    const existingIds = new Set(existing.map((e) => e.sourceId));

    // Step 3: Filter out duplicates from the batch
    const uniqueBatch = batch.filter((item) => !existingIds.has(item.sourceId));

    if (uniqueBatch.length === 0) {
      this.logger.log("All records in batch already exist. Skipping save.");
      return;
    }

    try {
      await this.prisma.listing.createMany({
        data: uniqueBatch,
      });
      this.logger.log(
        `Saved batch of ${uniqueBatch.length} deduplicated listings`
      );
    } catch (error) {
      this.logger.error(`Failed to save batch: ${error.message}`);
    }
  }
}
