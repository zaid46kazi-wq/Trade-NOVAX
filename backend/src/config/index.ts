import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  BINANCE_API_KEY: process.env.BINANCE_API_KEY || '',
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || '',
  TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
};
