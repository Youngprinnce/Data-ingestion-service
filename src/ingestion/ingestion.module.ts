import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { IngestionService } from './ingestion.service';
import { SimpleFetchStrategy } from './strategies/simple-fetch.strategy';
import { StreamJsonStrategy } from './strategies/stream-json.strategy';
import { IngestionStrategyFactory } from './ingestion.strategy';
import { HttpServiceWrapper } from './utils/http-wrapper';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    IngestionService,
    IngestionStrategyFactory,
    SimpleFetchStrategy,
    StreamJsonStrategy,
    HttpServiceWrapper,
  ],
  exports: [IngestionService, IngestionStrategyFactory],
})
export class IngestionModule {}
