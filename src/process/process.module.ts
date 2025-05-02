import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestDataJob } from './jobs/ingest-data.job';
import { IngestionModule } from 'src/ingestion/ingestion.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    IngestionModule,
  ],
  providers: [IngestDataJob],
  exports: [],
})
export class ProcessModule {}
