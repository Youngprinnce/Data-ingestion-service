import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IngestionService } from '../ingestion/ingestion.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataIngestionJob {
  private readonly logger = new Logger(DataIngestionJob.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleIngestionCron() {
    this.logger.log('Starting DataIngestionJob...');

    const sources = this.configService.get<{ sourceId: string; url: string; strategy: string; fieldMapping: Record<string, string> }[]>('ingestion.sources') || [];

    for (const source of sources) {
      try {
        this.logger.log(`Ingesting ${source.url} using ${source.strategy} strategy...`);
        await this.ingestionService.ingestData(source);
        this.logger.log(`Finished ingesting from ${source.url}`);
      } catch (err) {
        this.logger.error(`Failed to ingest ${source.url}: ${err.message}`);
      }
    }

    this.logger.log('DataIngestionJob completed.');
  }
}
