import { z } from "zod";
import { isValidTime, timeToMinutes } from "@/lib/reservation-utils";

// Tipos de espacio permitidos (deben coincidir con el enum de Prisma).
export const spaceTypeSchema = z.enum(["DESK", "MEETING_ROOM", "PRIVATE_OFFICE"]);

// Esquema para crear un espacio.
export const createSpaceSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().min(1, "La descripción es obligatoria."),
  type: spaceTypeSchema,
  capacity: z.coerce.number().int("La capacidad debe ser un entero.").positive("La capacidad debe ser mayor a 0."),
  imageKey: z.string().trim().min(1, "La imagen es obligatoria."),
  pricePerHour: z.coerce
    .number()
    .positive("El precio por hora debe ser mayor a 0."),
  available: z.boolean().optional().default(true),
});

// Esquema para actualizar un espacio (todos los campos opcionales, pero al menos uno).
export const updateSpaceSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre no puede estar vacío.").optional(),
    description: z.string().trim().min(1, "La descripción no puede estar vacía.").optional(),
    type: spaceTypeSchema.optional(),
    capacity: z.coerce.number().int("La capacidad debe ser un entero.").positive("La capacidad debe ser mayor a 0.").optional(),
    imageKey: z.string().trim().min(1, "La imagen no puede estar vacía.").optional(),
    pricePerHour: z.coerce.number().positive("El precio por hora debe ser mayor a 0.").optional(),
    available: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar.",
  });

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Esquema para crear una reserva.
export const createReservationSchema = z
  .object({
    customerName: z.string().trim().min(1, "El nombre del cliente es obligatorio."),
    customerEmail: z.string().trim().email("El correo electrónico no es válido."),
    date: z.string().regex(DATE_REGEX, "La fecha debe tener el formato YYYY-MM-DD."),
    startTime: z.string().refine(isValidTime, "La hora de inicio debe tener el formato HH:mm."),
    endTime: z.string().refine(isValidTime, "La hora de finalización debe tener el formato HH:mm."),
    spaceId: z.string().trim().min(1, "El identificador del espacio es obligatorio."),
  })
  .refine((data) => timeToMinutes(data.endTime) > timeToMinutes(data.startTime), {
    message: "La hora de finalización debe ser posterior a la hora de inicio.",
    path: ["endTime"],
  });

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
