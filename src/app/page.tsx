
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

  const spaces = featuredSpaces.map((s) => ({
    ...s,
    pricePerHour: Number(s.pricePerHour),
  }));

  return (
    <div className="space-y-10">
      {/* Hero principal con imagen alojada en AWS S3 */}
      <section
        className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl bg-cover bg-center px-6 py-16 text-center sm:px-10"
        style={{
          backgroundImage:
            "url('/api/fotos/originals/landing-background.webp')",
        }}
      >
        {/* Capa oscura para mejorar la legibilidad */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Contenido del hero */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="mb-5 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Tu espacio ideal para{" "}
            <span className="text-purple-300">crear y crecer</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-100 sm:text-lg">
            Encuentra y reserva espacios de trabajo de forma sencilla:
            escritorios, salas de reuniones y oficinas privadas para tu equipo.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/spaces"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Ver espacios
            </Link>

            <Link
              href="/admin/spaces"
              className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              Administrar espacios
            </Link>
          </div>
        </div>
      </section>

      {/* Espacios destacados */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Espacios destacados
          </h2>

          <Link
            href="/spaces"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {spaces.length === 0 ? (
          <p className="rounded-lg border border-muted-border bg-muted p-6 text-gray-600">
            Aún no hay espacios disponibles. Puedes crear uno desde la sección
            de administración.
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
