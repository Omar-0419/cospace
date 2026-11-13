import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReservationSchema } from "@/lib/validations";
import {
  calculateTotalPrice,
  doIntervalsOverlap,
  isPastDate,
  parseReservationDate,
} from "@/lib/reservation-utils";

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

// GET /api/reservations - Lista todas las reservas.
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { space: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reservations.map(serializeReservation));
  } catch (error) {
    console.error("Error al listar reservas:", error);
    return NextResponse.json(
      { error: "Error interno al obtener las reservas." },
      { status: 500 },
    );
  }
}

// POST /api/reservations - Crea una nueva reserva.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Regla: no permitir reservas para fechas anteriores.
    if (isPastDate(data.date)) {
      return NextResponse.json(
        { error: "No se permiten reservas para fechas anteriores." },
        { status: 400 },
      );
    }

    // Regla: no permitir reservas para espacios inexistentes.
    const space = await prisma.space.findUnique({ where: { id: data.spaceId } });
    if (!space) {
      return NextResponse.json(
        { error: "El espacio indicado no existe." },
        { status: 404 },
      );
    }

    // Regla: no permitir reservas que se crucen con otras del mismo espacio en la misma fecha.
    const reservationDate = parseReservationDate(data.date);
    const sameDayReservations = await prisma.reservation.findMany({
      where: { spaceId: data.spaceId, date: reservationDate },
      select: { startTime: true, endTime: true },
    });

    const hasOverlap = sameDayReservations.some((r) =>
      doIntervalsOverlap(data.startTime, data.endTime, r.startTime, r.endTime),
    );
    if (hasOverlap) {
      return NextResponse.json(
        { error: "El horario seleccionado se cruza con otra reserva del mismo espacio." },
        { status: 409 },
      );
    }

    // Cálculo automático del precio total según las horas reservadas.
    const totalPrice = calculateTotalPrice(
      Number(space.pricePerHour),
      data.startTime,
      data.endTime,
    );

    const reservation = await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        date: reservationDate,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice,
        spaceId: data.spaceId,
      },
      include: { space: true },
    });

    return NextResponse.json(serializeReservation(reservation), { status: 201 });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json(
      { error: "Error interno al crear la reserva." },
      { status: 500 },
    );
  }
}
