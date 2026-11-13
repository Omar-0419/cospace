export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function spaceTypeLabel(type: string): string {
  switch (type) {
    case "DESK":
      return "Escritorio";
    case "MEETING_ROOM":
      return "Sala de reuniones";
    case "PRIVATE_OFFICE":
      return "Oficina privada";
    default:
      return type;
  }
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
