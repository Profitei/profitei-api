import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './guards/security/firebase-auth.guard';
// Define the bootstrap function
async function bootstrap() {
  // Create a NestJS application instance by passing the AppModule to the NestFactory
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Use DocumentBuilder to create a new Swagger document configuration
  const config = new DocumentBuilder()
    .setTitle('Profitei API') // Set the title of the API
    .setDescription('Profitei API description') // Set the description of the API
    .setVersion('1.0') // Set the version of the API
    .addBearerAuth() // Add bearer token authentication
    .build(); // Build the document

  // Create a Swagger document using the application instance and the document configuration
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module with the application instance and the Swagger document
  SwaggerModule.setup('api', app, document);

  // Apply Global Guard to use API-KEY
  app.useGlobalGuards(new FirebaseAuthGuard());

  // Start the application and listen for requests on port 3000
  await app.listen(3000);
}

// Call the bootstrap function to start the application
bootstrap();
