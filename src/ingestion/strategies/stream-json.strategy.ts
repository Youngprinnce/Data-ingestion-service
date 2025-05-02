import { Injectable, Logger } from '@nestjs/common';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { IngestionStrategy } from '../interfaces/ingestion-strategy.interface';
import { HttpServiceWrapper } from '../utils/http-wrapper';
import { Readable } from 'stream';

@Injectable()
export class StreamJsonStrategy implements IngestionStrategy {
  private readonly logger = new Logger(StreamJsonStrategy.name);
  private readonly BATCH_SIZE = 1000;

  constructor(private readonly http: HttpServiceWrapper) {}

  async ingest(
    url: string,
    onBatch: (batch: IngestionResponseDto[]) => Promise<void>,
  ): Promise<void> {
    const stream = await this.http.callApi(url, 'GET', undefined, true) as Readable;

    const parser = stream.pipe(StreamArray.withParser());
    let batch: IngestionResponseDto[] = [];
    let count = 0;

    this.logger.log(`Starting to stream and parse data from ${url}`);

    await new Promise<void>((resolve, reject) => {
      parser.on('data', async ({ value }) => {
        try {
          const item = this.transform(value);
          batch.push(item);
          count++;

          if (batch.length >= this.BATCH_SIZE) {
            parser.pause();
            this.logger.log(`Sending batch of ${batch.length} to handler`);
            await onBatch(batch);
            batch = [];
            parser.resume();
          }
        } catch (e) {
          this.logger.error(`Error transforming or handling record: ${e.message}`);
          reject(e);
        }
      });

      parser.on('end', async () => {
        this.logger.log(`Stream ended. Total records processed: ${count}`);
        if (batch.length > 0) {
          await onBatch(batch);
        }
        resolve();
      });

      parser.on('error', (err) => {
        this.logger.error(`Parser stream error: ${err.message}`, err.stack);
        reject(err);
      });
    });

    this.logger.log(`Finished streaming ingestion from ${url}`);
  }

  private transform(item: any): IngestionResponseDto {
    return {
      sourceId: String(item.id),
      city: item.city,
      isAvailable: item.availability,
      pricePerNight: item.priceForNight,
      priceSegment: item.priceSegment,
    };
  }
}
