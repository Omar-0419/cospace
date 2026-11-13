import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, spaceTypeLabel } from "@/lib/utils";
import { CancelReservationButton } from "@/components/CancelReservationButton";

export const instant = false;

export default async function ReservationsPage() {
  await connection();
  const reservations = await prisma.reservation.findMany({
    include: { space: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
        <p className="mt-1 text-gray-600">Listado de reservas realizadas en CoSpace Basic.</p>
      </div>
      {reservations.length === 0 ? (
        <p className="rounded-lg border border-muted-border bg-muted p-6 text-gray-600">
          No hay reservas registradas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted text-gray-700">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Espacio</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-muted-border">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.customerName}</td>
                  <td className="px-4 py-3 text-gray-700">{r.customerEmail}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{r.space.name}</div>
                    <div className="text-xs text-gray-500">{spaceTypeLabel(r.space.type)}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 text-gray-700">{r.startTime} - {r.endTime}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(Number(r.totalPrice))}</td>
                  <td className="px-4 py-3"><CancelReservationButton id={r.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
