import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { CustomWsAdapter } from './core/adapter/ws-adapter';
import { ConfigService } from './core/config/config.service';

const configService = new ConfigService();
const config = configService.getSystemConfig();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
	app.use(morgan('common', { immediate: false }));
	
  const corsOpt = {
    origin: [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  if (config.debug) {
    corsOpt.origin.push('http://localhost:4200');
  }
  
  app.enableCors(corsOpt);
  rateLimit({
    windowMs: 100,
    max: 1,
    keyGenerator: (req) => req.ip + req.path + req.method,
  });

	// app.use(bodyParser.urlencoded({ extended: true }));
	// app.use(bodyParser.json());
	// app.use(bodyParser.text({ type: 'text/html' }));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter(new ConfigService()));
	app.useWebSocketAdapter(new CustomWsAdapter(app));

  const configSwagger = new DocumentBuilder()
    .setTitle("NestJS API")
    .setVersion("1.0")
		.addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/api/v1', app, document);

  await app.listen(config.port);
}
bootstrap();