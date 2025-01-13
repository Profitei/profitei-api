import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ProtectedRoutesGuard } from './guards/security/protected-routes-guard';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const logLevel: LogLevel[] =
    process.env.ENV === 'dev'
      ? ['error', 'warn', 'log', 'fatal', 'debug', 'verbose']
      : ['error', 'warn', 'log', 'fatal'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevel,
  });

  const config = new DocumentBuilder()
    .setTitle('Profitei API')
    .setDescription('Profitei API description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const protectedRoutesGuard = app.get(ProtectedRoutesGuard);


  app.useGlobalGuards(protectedRoutesGuard);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();
