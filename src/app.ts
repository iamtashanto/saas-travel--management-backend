import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './common/utils/logger';
import { errorHandler } from './common/middleware/errorHandler';
import { notFoundHandler } from './common/middleware/notFoundHandler';
import routes from './routes';
import { setupSwagger } from './docs/swagger';

const app: Express = express();

// Security Middlewares
app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === `${env.API_PREFIX}/health`,
    },
  }),
);

// Swagger Docs
setupSwagger(app);

// API Routes
app.use(env.API_PREFIX, routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
