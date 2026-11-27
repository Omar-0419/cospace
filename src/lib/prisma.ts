
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

  const databaseUrl = new URL(connectionString);

  // Evitamos que los parámetros SSL de la URL
  // sobrescriban nuestra configuración del adapter.
  databaseUrl.searchParams.delete("sslmode");
  databaseUrl.searchParams.delete("sslrootcert");

  const hostname = databaseUrl.hostname;

  let certificatePath: string;

  if (hostname.endsWith(".rds.amazonaws.com")) {
    // Producción: certificado oficial de AWS RDS.
    certificatePath = join(
      process.cwd(),
      "certs",
      "global-bundle.pem"
    );
  } else if (hostname.endsWith(".pooler.supabase.com")) {
    // Desarrollo: certificado raíz de Supabase.
    certificatePath = join(
      process.cwd(),
      "certs",
      "supabase-ca.crt"
    );
  } else {
    throw new Error(
      `Proveedor de base de datos no reconocido: ${hostname}`
    );
  }

  const ca = readFileSync(certificatePath, "utf8");

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
