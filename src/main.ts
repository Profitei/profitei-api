import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SecurityGuard } from './guards/security/security.guard';
import { FirebaseAuthGuard } from './guards/security/firebase-auth.guard';
import { LogLevel } from '@nestjs/common';

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

  const firebaseAuthGuard = app.get(FirebaseAuthGuard);
  const securityGuard = app.get(SecurityGuard);

  app.useGlobalGuards(securityGuard, firebaseAuthGuard);

  await app.listen(3000);
}

bootstrap();
