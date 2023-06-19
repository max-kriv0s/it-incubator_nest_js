import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { settings } from './settings';

async function bootstrap() {
  const PORT = settings.PORT;

  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
