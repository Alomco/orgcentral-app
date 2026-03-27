import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalScope = globalThis as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

function createPrismaClient(): PrismaClient {
    return new PrismaClient({ adapter });
}

export const prisma = globalScope.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalScope.prisma = prisma;
}
