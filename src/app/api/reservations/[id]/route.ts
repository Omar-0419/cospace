import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ReservationWithSpace = {
  id: string;
  customerName: string;
  customerEmail: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  totalPrice: unknown;
  spaceId: string;
  createdAt: Date;
  space?: {
    id: string;
    name: string;
    description: string;
    type: string;
    capacity: number;
    pricePerHour: unknown;
    available: boolean;
    createdAt: Date;
  };
};

function serializeReservation(reservation: ReservationWithSpace) {
  return {
    ...reservation,
    totalPrice: Number(reservation.totalPrice),
    date:
      reservation.date instanceof Date
        ? reservation.date.toISOString().slice(0, 10)
        : reservation.date,
    space: reservation.space
      ? { ...reservation.space, pricePerHour: Number(reservation.space.pricePerHour) }
      : undefined,
  };
}

// GET /api/reservations/[id] - Consulta una reserva por id.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    return NextResponse.json(serializeReservation(reservation));
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    return NextResponse.json(
      { error: "Error interno al obtener la reserva." },
      { status: 500 },
    );
  }
}

// DELETE /api/reservations/[id] - Cancela (elimina) una reserva.
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ message: "Reserva cancelada correctamente." });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    return NextResponse.json(
      { error: "Error interno al cancelar la reserva." },
      { status: 500 },
    );
  }
}
