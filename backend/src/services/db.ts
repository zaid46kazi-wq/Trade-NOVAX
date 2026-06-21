import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from '../config';

const connectionString = config.DATABASE_URL || 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
export * from '@prisma/client';
