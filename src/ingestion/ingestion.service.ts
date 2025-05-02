import { PrismaService } from "src/prisma/prisma.service";
import { IngestionStrategyFactory } from "./ingestion.strategy";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly factory: IngestionStrategyFactory,
    private readonly prisma: PrismaService,
  ) {}

  async ingestData(url: string, strategyType: string): Promise<void> {
    this.logger.log(`Ingesting data using strategy: ${strategyType}`);
    const strategy = this.factory.getStrategy(strategyType);

    if (strategyType === 'stream') {
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

    try {
      await this.prisma.accommodation.createMany({ data: batch });
      this.logger.log(`Saved batch of ${batch.length} accommodations`);
    } catch (error) {
      this.logger.error(`Failed to save batch: ${error.message}`);
    }
  }
}

