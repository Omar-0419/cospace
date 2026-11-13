import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, spaceTypeLabel } from "@/lib/utils";
import { ReservationForm } from "@/components/ReservationForm";

type PageProps = { params: Promise<{ id: string }> };

export const instant = false;

export default async function SpaceDetailPage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const space = await prisma.space.findUnique({ where: { id } });
  if (!space) notFound();

  return (
    <div className="space-y-6">
      <Link href="/spaces" className="text-sm text-primary hover:underline">&larr; Volver al catálogo</Link>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-muted-border bg-white p-6">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${space.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
            >
              {space.available ? "Disponible" : "No disponible"}
            </span>
          </div>
          <p className="mb-2 font-medium text-primary">{spaceTypeLabel(space.type)}</p>
          <p className="mb-4 text-gray-700">{space.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <dt className="text-gray-500">Capacidad</dt>
              <dd className="font-semibold text-gray-900">{space.capacity} personas</dd>
            </div>
            <div className="rounded-md bg-muted p-3">
              <dt className="text-gray-500">Precio por hora</dt>
              <dd className="font-semibold text-gray-900">{formatPrice(Number(space.pricePerHour))}</dd>
            </div>
          </dl>
        </section>
        <section>
          <ReservationForm spaceId={space.id} available={space.available} />
        </section>
      </div>
    </div>
  );
}
