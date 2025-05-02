import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import app from './config/app.config';
import { IngestionModule } from './ingestion/ingestion.module';
import { ListingsModule } from './listing/listings.module';
import { SwaggerModule } from '@nestjs/swagger';
import { JobModule } from './jobs/jobs.module';

@Module({
  imports: [ 
    PrismaModule,
    ConfigModule.forRoot({
      load: [
        app,
      ],
    }),
    IngestionModule,
    ListingsModule,
    SwaggerModule,
    ...AppModule.getConditionalModules(),
  ]
})
export class AppModule {
  static getConditionalModules() {
    const modules = [];
    const shouldRunProcess = process.env.PROCESS_ENABLED === 'true';
    if (shouldRunProcess) modules.push(JobModule);
    console.log({ shouldRunProcess });
    return modules;
  }
}
