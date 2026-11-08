import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { uploadsDir } from './modules/admin/admin-upload.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
