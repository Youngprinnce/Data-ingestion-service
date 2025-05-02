import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Always default to production, so the strictest settings are used by default
  env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  swaggerApiRoot: process.env.SWAGGER_API_ROOT || 'docs',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
}));
