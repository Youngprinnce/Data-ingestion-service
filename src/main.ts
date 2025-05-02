import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';

import * as bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { ResponseInterceptor } from './common/interceptors/response.interceptor';
// import { SwaggerModule } from './swagger/swagger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const { port } = configService.get('app');
  //const { swaggerApiRoot } = configService.get('swagger');

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(helmet());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      forbidNonWhitelisted: true, // Throw error if unknown properties exist
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),
  );
  // app.useGlobalFilters(new HttpExceptionFilter());
  // app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // cors options
  const options = {
    methods: 'GET,HEAD,POST,',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'X-Forwarded-Host',
      'X-Forwarded-For',
      'X-Business-Id',
      'X-Platform',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    credentials: true,
  };
  app.enableCors(options);

  // Setup Swagger as a module
  // SwaggerModule.setup(app, swaggerApiRoot);
  // SentryModule.setup(app);
  await app.listen(3000);

  Logger.log(
    `Server running on ${port}: Docs http://localhost:${3000}/`,
    'Duplo',
  );
}
bootstrap();
