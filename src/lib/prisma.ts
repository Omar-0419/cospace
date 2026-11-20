
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no está definida.");
  }

  // Quitamos sslmode de la URL para evitar que pg reemplace
  // la configuración SSL que definimos explícitamente.
  const databaseUrl = new URL(connectionString);
  databaseUrl.searchParams.delete("sslmode");

  // Certificados oficiales de Amazon RDS.
  const ca = readFileSync(
    join(process.cwd(), "certs", "global-bundle.pem"),
    "utf8"
  );

  const adapter = new PrismaPg({
    connectionString: databaseUrl.toString(),
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  });

  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
