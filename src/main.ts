import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('It-Incubator-Nest_js example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('It-Incubator-Nest_js')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const confiService = app.get(ConfigService);
  const port = confiService.get('port');
  await app.listen(port, () => console.log(`Server started on port ${port}`));
}
bootstrap();
