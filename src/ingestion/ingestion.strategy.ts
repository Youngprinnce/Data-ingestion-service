import { Injectable } from '@nestjs/common';
import { SimpleFetchStrategy } from './strategies/simple-fetch.strategy';
import { StreamJsonStrategy } from './strategies/stream-json.strategy';
import { IngestionStrategy } from './interfaces/ingestion-strategy.interface';
import { IngestionStrategyType } from './dto/ingestion-response.dto';

@Injectable()
export class IngestionStrategyFactory {
  constructor(
    private readonly simple: SimpleFetchStrategy,
    private readonly stream: StreamJsonStrategy,
  ) {}

  getStrategy(type: IngestionStrategyType): IngestionStrategy {
    switch (type) {
      case IngestionStrategyType.SIMPLE:
        return this.simple;
      case IngestionStrategyType.STREAM:
        return this.stream;
      default:
        throw new Error(`Unknown ingestion strategy: ${type}`);
    }
  }
}
