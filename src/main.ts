import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const confiService = app.get(ConfigService);
  const port = confiService.get('port');
  await app.listen(port, () => console.log(`Server started on port ${port}`));
}
bootstrap();
