import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { appSettings } from './app.settings';
import { getSwaggerJsonFile, swaggerSettings } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);

  swaggerSettings(app);

  const confiService = app.get(ConfigService);
  const port = confiService.get('port');
  await app.listen(port, () => console.log(`Server started on port ${port}`));

  getSwaggerJsonFile(app);
}
bootstrap();
