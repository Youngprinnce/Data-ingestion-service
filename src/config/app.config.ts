import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  swaggerApiRoot: process.env.SWAGGER_API_ROOT || 'docs',
  baseUrl: process.env.BASE_URL || 'https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com',
  ingestion: {
    sources: JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/ingestion/ingestion-config.json'), 'utf-8')),
    cronSchedule: process.env.INGESTION_CRON_SCHEDULE || '0 0 * * * *',
    batchSize: process.env.INGESTION_BATCH_SIZE || 1000,
  },
}));
