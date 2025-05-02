import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IngestionService } from 'src/ingestion/ingestion.service';

@Injectable()
export class IngestDataJob {
  private readonly logger = new Logger(IngestDataJob.name);

  constructor(private readonly ingestionService: IngestionService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleIngestionCron() {
    this.logger.log('Starting IngestDataJob...');

    const sources = [
      {
        url: 'structured_generated_data.json',
        strategy: 'simple' as const,
      },
      {
        url: 'large_generated_data.json',
        strategy: 'stream' as const,
      },
    ];

    for (const { url, strategy } of sources) {
      try {
        this.logger.log(`Ingesting ${url} using ${strategy} strategy...`);
        await this.ingestionService.ingestData(url, strategy);
        this.logger.log(`Finished ingesting from ${url}`);
      } catch (err) {
        this.logger.error(`Failed to ingest ${url}: ${err.message}`);
      }
    }

    this.logger.log('IngestDataJob completed.');
  }
}
