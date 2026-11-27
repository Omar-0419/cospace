
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSpaceSchema } from "@/lib/validations";

// Convierte el espacio de Prisma a un objeto JSON serializable.
function serializeSpace(space: {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerHour: unknown;
  available: boolean;
  imageKey: string | null;
  createdAt: Date;
}) {
  return {
    ...space,
    pricePerHour: Number(space.pricePerHour),
  };
}

// GET /api/spaces - Lista todos los espacios.
export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(spaces.map(serializeSpace));
  } catch (error) {
    console.error("Error al listar espacios:", error);

    return NextResponse.json(
      { error: "Error interno al obtener los espacios." },
      { status: 500 },
    );
  }
}

// POST /api/spaces - Crea un nuevo espacio.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const space = await prisma.space.create({
      data: parsed.data,
    });

    return NextResponse.json(serializeSpace(space), { status: 201 });
  } catch (error) {
    console.error("Error al crear espacio:", error);

    return NextResponse.json(
      { error: "Error interno al crear el espacio." },
      { status: 500 },
    );
  }
}
