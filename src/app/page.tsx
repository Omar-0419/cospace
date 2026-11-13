import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { SpaceCard } from "@/components/SpaceCard";

export const instant = false;

export default async function HomePage() {
  await connection();
  const featuredSpaces = await prisma.space.findMany({
    where: { available: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const spaces = featuredSpaces.map((s) => ({ ...s, pricePerHour: Number(s.pricePerHour) }));

  return (
    <div className="space-y-10">
      <section className="rounded-xl bg-muted px-6 py-12 text-center sm:px-10">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
          Bienvenido a <span className="text-primary">CoSpace Basic</span>
        </h1>
        <p className="mx-auto max-w-2xl text-gray-700">
          Encuentra y reserva espacios de trabajo de forma sencilla: escritorios, salas de reuniones y
          oficinas privadas para tu equipo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/spaces"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Ver espacios
          </Link>
          <Link
            href="/admin/spaces"
            className="rounded-md border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-red-50"
          >
            Administrar espacios
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Espacios destacados</h2>
          <Link href="/spaces" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {spaces.length === 0 ? (
          <p className="rounded-lg border border-muted-border bg-muted p-6 text-gray-600">
            Aún no hay espacios disponibles. Puedes crear uno desde la sección de administración.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
