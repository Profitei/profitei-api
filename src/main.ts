import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SecurityGuard } from './guards/security/security.guard';
import { FirebaseAuthGuard } from './guards/security/firebase-auth.guard';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  const logLevel: LogLevel[] =
    process.env.ENV === 'dev'
      ? ['error', 'warn', 'log', 'debug', 'verbose']
      : ['error', 'warn', 'fatal'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevel,
  });

  // Use DocumentBuilder to create a new Swagger document configuration
  const config = new DocumentBuilder()
    .setTitle('Profitei API') // Set the title of the API
    .setDescription('Profitei API description') // Set the description of the API
    .setVersion('1.0') // Set the version of the API
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build(); // Build the document

  // Create a Swagger document using the application instance and the document configuration
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module with the application instance and the Swagger document
  SwaggerModule.setup('api', app, document);

  // Apply Global Guard to use API-KEY and FirebaseAuthGuard
  const firebaseAuthGuard = app.get(FirebaseAuthGuard);
  app.useGlobalGuards(new SecurityGuard(), firebaseAuthGuard);

  // Start the application and listen for requests on port 3000
  await app.listen(3000);
}

// Call the bootstrap function to start the application
bootstrap();
