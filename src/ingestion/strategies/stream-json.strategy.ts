import { Injectable, Logger } from '@nestjs/common';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { IngestionStrategy } from '../interfaces/ingestion-strategy.interface';
import { IngestionResponseDto } from '../dto/ingestion-response.dto';
import { HttpServiceWrapper } from '../../common/http-wrapper';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { FieldMapper } from '../utils/field-mapper.utils';

@Injectable()
export class StreamJsonStrategy implements IngestionStrategy {
  private readonly logger = new Logger(StreamJsonStrategy.name);
  private readonly batchSize: number;

  constructor(
    private readonly http: HttpServiceWrapper,
    private readonly fieldMapper: FieldMapper,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('app.ingestion.batchSize', 1000);
  }

  async ingest(
    url: string,
    fieldMapping: Record<string, string>,
    onBatch: (batch: IngestionResponseDto[]) => Promise<void>,
  ): Promise<void> {
    const stream = await this.http.callApi(url, 'GET', undefined, true) as Readable;
    const parser = stream.pipe(StreamArray.withParser());

    let batch: IngestionResponseDto[] = [];
    let count = 0;
    let processing = false;
    let ended = false;

    const processBatch = async () => {
      if (batch.length === 0) return;

      processing = true;
      const currentBatch = [...batch];
      batch = [];

      this.logger.log(`Processing batch of ${currentBatch.length} items...`);

      try {
        await onBatch(currentBatch);
      } catch (err) {
        this.logger.error(`Batch processing failed: ${err.message}`, err.stack);
      } finally {
        processing = false;
        if (!ended) {
          parser.resume();
        }
      }
    };

    this.logger.log(`Starting stream ingestion from ${url}`);

    await new Promise<void>((resolve, reject) => {
      parser.on('data', ({ value }) => {
        try {
          const item = this.fieldMapper.mapFields(value, fieldMapping);
          batch.push(item);
          count++;

          if (batch.length >= this.batchSize && !processing) {
            parser.pause();
            void processBatch(); // fire-and-forget internally, safe due to flag
          }
        } catch (err) {
          this.logger.warn(`Skipping invalid record: ${err.message}`);
          // Don’t reject the entire stream for one bad record
        }
      });

      parser.on('end', async () => {
        this.logger.log(`Stream ended after ${count} items`);
        ended = true;
        if (batch.length > 0) {
          await processBatch();
        }
        resolve();
      });

      parser.on('error', (err) => {
        this.logger.error(`Stream error: ${err.message}`, err.stack);
        reject(err);
      });
    });

    this.logger.log(`Completed ingestion from ${url}`);
  }
}
