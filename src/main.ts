import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';
import { getSwaggerJsonFile, swaggerSettings } from './swagger';
import { AppConfig } from './configuration/app.configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);

  swaggerSettings(app);

  const appConfig = app.get(AppConfig);
  const port = appConfig.getPort();
  await app.listen(port, () => console.log(`Server started on port ${port}`));

  getSwaggerJsonFile(app);
}
bootstrap();
