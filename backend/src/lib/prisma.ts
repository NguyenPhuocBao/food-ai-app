import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Kiểm tra DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env file');
}

// Singleton pattern cho PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Tạo Pool kết nối trực tiếp với PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Bọc Pool đó qua Adapter của Prisma
const adapter = new PrismaPg(pool);

// 3. 🔥 SỬA TẠI ĐÂY: Chỉ cần truyền adapter vào là xong!
export const prisma = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;