import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessModule } from './process/process.module';
import { ConfigModule } from '@nestjs/config';
import app from './config/app.config';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [ 
    ProcessModule,
    PrismaModule,
    ConfigModule.forRoot({
      load: [
        app,
      ],
    }),
    IngestionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
