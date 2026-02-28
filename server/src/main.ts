import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 설정 (프론트엔드 연동)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://next-exit.me'],
    credentials: true,
  });

  // 정적 파일 서빙 (업로드된 이미지)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 OTBOOK Server is running on: http://localhost:${port}`);
}

bootstrap();
