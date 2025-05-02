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
    this.batchSize = this.configService.get<number>('ingestion.batchSize', 1000);
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

    this.logger.log(`Starting to stream and parse data from ${url}`);

    await new Promise<void>((resolve, reject) => {
      parser.on('data', async ({ value }) => {
        try {
          const item = this.fieldMapper.mapFields(value, fieldMapping);
          batch.push(item);
          count++;

          if (batch.length >= this.batchSize) {
            parser.pause();
            this.logger.log(`Sending batch of ${batch.length} records`);
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
}
