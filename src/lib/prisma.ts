import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida en las variables de entorno.");
  }

  // Adapter de PostgreSQL requerido por Prisma 7 para conectarse mediante el driver pg.
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

// Singleton para reutilizar la conexión en desarrollo (evita crear múltiples clientes con hot-reload).
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
