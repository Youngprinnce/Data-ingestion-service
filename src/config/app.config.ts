import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  swaggerApiRoot: process.env.SWAGGER_API_ROOT || 'docs',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
}));
