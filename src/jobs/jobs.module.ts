import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionModule } from 'src/ingestion/ingestion.module';
import { DataIngestionJob } from './data-ingestion-job';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    IngestionModule,
    ConfigModule
  ],
  providers: [DataIngestionJob],
  exports: [],
})
export class JobModule {}
