import { Injectable } from '@nestjs/common';
import { SimpleFetchStrategy } from './strategies/simple-fetch.strategy';
import { StreamJsonStrategy } from './strategies/stream-json.strategy';
import { IngestionStrategy } from './interfaces/ingestion-strategy.interface';

@Injectable()
export class IngestionStrategyFactory {
  constructor(
    private readonly simple: SimpleFetchStrategy,
    private readonly stream: StreamJsonStrategy,
  ) {}

  getStrategy(type: string): IngestionStrategy {
    switch (type) {
      case 'simple':
        return this.simple;
      case 'stream':
        return this.stream;
      default:
        throw new Error(`Unknown ingestion strategy: ${type}`);
    }
  }
}
