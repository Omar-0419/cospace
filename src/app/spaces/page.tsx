import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { SpaceCard } from "@/components/SpaceCard";

export const instant = false;

export default async function SpacesPage() {
  await connection();
  const spaces = (await prisma.space.findMany({ orderBy: { createdAt: "desc" } })).map((s) => ({
    ...s,
    pricePerHour: Number(s.pricePerHour),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de espacios</h1>
        <p className="mt-1 text-gray-600">Explora los espacios de trabajo disponibles para reservar.</p>
      </div>
      {spaces.length === 0 ? (
        <p className="rounded-lg border border-muted-border bg-muted p-6 text-gray-600">
          No hay espacios registrados todavía.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      )}
    </div>
  );
}
