import Link from "next/link";
import { formatPrice, spaceTypeLabel } from "@/lib/utils";

type Space = {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerHour: number | string;
  available: boolean;
};

export function SpaceCard({ space, showReserve = true }: { space: Space; showReserve?: boolean }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-muted-border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">{space.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${space.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
        >
          {space.available ? "Disponible" : "No disponible"}
        </span>
      </div>
      <p className="mb-1 text-sm font-medium text-primary">{spaceTypeLabel(space.type)}</p>
      <p className="mb-3 text-sm text-gray-600">{space.description}</p>
      <div className="mt-auto space-y-1 text-sm text-gray-700">
        <p>Capacidad: {space.capacity} personas</p>
        <p className="font-semibold text-gray-900">{formatPrice(space.pricePerHour)} / hora</p>
      </div>
      {showReserve && (
        <Link
          href={`/spaces/${space.id}`}
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ver detalle / Reservar
        </Link>
      )}
    </div>
  );
}
