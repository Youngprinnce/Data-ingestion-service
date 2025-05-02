import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestionService } from './ingestion.service';
import { SimpleFetchStrategy } from './strategies/simple-fetch.strategy';
import { StreamJsonStrategy } from './strategies/stream-json.strategy';
import { IngestionStrategyFactory } from './ingestion.strategy';
import { FieldMapper } from './utils/field-mapper.utils';
import { HttpServiceWrapper } from '@src/common/http-wrapper';

@Module({
  imports: [ConfigModule],
  providers: [
    IngestionService,
    IngestionStrategyFactory,
    SimpleFetchStrategy,
    StreamJsonStrategy,
    HttpServiceWrapper,
    FieldMapper,
  ],
  exports: [IngestionService, IngestionStrategyFactory],
})
export class IngestionModule {}
