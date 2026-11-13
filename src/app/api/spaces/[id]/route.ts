import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSpaceSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function serializeSpace(space: {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  pricePerHour: unknown;
  available: boolean;
  createdAt: Date;
}) {
  return {
    ...space,
    pricePerHour: Number(space.pricePerHour),
  };
}

// GET /api/spaces/[id] - Consulta un espacio por id.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const space = await prisma.space.findUnique({ where: { id } });

    if (!space) {
      return NextResponse.json({ error: "Espacio no encontrado." }, { status: 404 });
    }

    return NextResponse.json(serializeSpace(space));
  } catch (error) {
    console.error("Error al obtener espacio:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el espacio." },
      { status: 500 },
    );
  }
}

// PATCH /api/spaces/[id] - Actualiza un espacio existente.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSpaceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.space.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Espacio no encontrado." }, { status: 404 });
    }

    const updated = await prisma.space.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(serializeSpace(updated));
  } catch (error) {
    console.error("Error al actualizar espacio:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el espacio." },
      { status: 500 },
    );
  }
}

// DELETE /api/spaces/[id] - Elimina un espacio.
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.space.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Espacio no encontrado." }, { status: 404 });
    }

    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ message: "Espacio eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar espacio:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar el espacio." },
      { status: 500 },
    );
  }
}
