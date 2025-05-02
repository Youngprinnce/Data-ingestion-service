import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProcessModule } from './process/process.module';
import { ConfigModule } from '@nestjs/config';
import app from './config/app.config';
import { IngestionModule } from './ingestion/ingestion.module';
import { ListingsModule } from './listing/listings.module';
import { SwaggerModule } from '@nestjs/swagger';

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
    if (shouldRunProcess) modules.push(ProcessModule);
    console.log({ shouldRunProcess });
    return modules;
  }
}
