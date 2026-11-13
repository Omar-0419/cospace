// Utilidades para validar horarios y calcular el precio total de una reserva.

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return TIME_REGEX.test(value);
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateHours(startTime: string, endTime: string): number {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime);
  return diff / 60;
}

export function calculateTotalPrice(pricePerHour: number, startTime: string, endTime: string): number {
  const hours = calculateHours(startTime, endTime);
  // Redondeo a 2 decimales para evitar problemas de precisión en montos.
  return Math.round(hours * pricePerHour * 100) / 100;
}

export function isPastDate(dateString: string): boolean {
  // dateString esperado en formato YYYY-MM-DD.
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = dateString.split("-").map(Number);
  const reservationDate = new Date(y, m - 1, d);
  return reservationDate < todayStart;
}

export function parseReservationDate(dateString: string): Date {
  // Se guarda como fecha (sin hora) en UTC para el campo @db.Date.
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function doIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  // Solapamiento si los intervalos [inicio, fin) se cruzan.
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}
