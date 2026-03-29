import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import { Pool } from 'pg';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf'; 



dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =========================
  // SECURITY HEADERS
  // =========================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      xssFilter: true,
      noSniff: true,
    }),
  );

  // =========================
  // COOKIE PARSER
  // =========================
  app.use(cookieParser());

  // =========================
  // CORS
  // =========================
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // =========================
  // GLOBAL PREFIX
  // =========================
  app.setGlobalPrefix('api');

  // =========================
  // VALIDATION
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // =========================
  // EXCEPTION FILTER
  // =========================
  app.useGlobalFilters(new HttpExceptionFilter());

  // =========================
  // SESSION STORE (PostgreSQL)
  // =========================
  const PgSession = connectPgSimple(session);
  const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'cruise_user',
    password: process.env.DB_PASSWORD || 'Str0ng_DB_Pass!2026',
    database: process.env.DB_NAME || 'cruise_booking',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  app.use(
    session({
      store: new PgSession({
        pool: pgPool,
        tableName: 'user_sessions',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION',
      resave: false,
      saveUninitialized: false,
      name: 'cruise.sid',
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: parseInt(process.env.SESSION_MAX_AGE_MS || '86400000'),
      },
    }),
  );

  // =========================
  // CSRF PROTECTION (MANDATORY)
  // =========================
  app.use((req, res, next) => {
  // ❗ Skip CSRF for AI endpoint
  if (req.path.startsWith('/api/ai')) {
    return next();
  }
  return csurf({ cookie: false })(req, res, next);
});

  // =========================
  // SWAGGER
  // =========================
  const config = new DocumentBuilder()
    .setTitle('Cruise Booking API')
    .setDescription('REST API for the Cruise Line Booking Platform')
    .setVersion('1.0')
    .addCookieAuth('cruise.sid', {
      type: 'apiKey',
      in: 'cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }

  // =========================
  // START SERVER
  // =========================
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚢 Cruise Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger docs:   http://localhost:${port}/api/docs`);
}

bootstrap();