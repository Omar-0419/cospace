"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayString } from "@/lib/utils";

export function ReservationForm({ spaceId, available }: { spaceId: string; available: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      date: String(form.get("date") || ""),
      startTime: String(form.get("startTime") || ""),
      endTime: String(form.get("endTime") || ""),
      spaceId,
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const details = data.details ? Object.values(data.details).flat().join(" ") : "";
        setError(data.error ? `${data.error} ${details}`.trim() : "No se pudo crear la reserva.");
        return;
      }
      setSuccess(`Reserva creada correctamente. Total: $${data.totalPrice}`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch {
      setError("Error de conexión al crear la reserva.");
    } finally {
      setLoading(false);
    }
  }

  if (!available) {
    return (
      <div className="rounded-lg border border-muted-border bg-muted p-4 text-sm text-gray-700">
        Este espacio no está disponible actualmente para reservas.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-muted-border bg-white p-5">
      <h2 className="text-lg font-semibold text-gray-900">Reservar este espacio</h2>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Nombre del cliente</span>
          <input name="customerName" required className="w-full rounded-md border border-muted-border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Correo electrónico</span>
          <input name="customerEmail" type="email" required className="w-full rounded-md border border-muted-border px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Fecha</span>
          <input name="date" type="date" min={todayString()} required className="w-full rounded-md border border-muted-border px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Hora inicio</span>
            <input name="startTime" type="time" required className="w-full rounded-md border border-muted-border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Hora fin</span>
            <input name="endTime" type="time" required className="w-full rounded-md border border-muted-border px-3 py-2" />
          </label>
        </div>
      </div>
      <p className="text-xs text-gray-500">El precio total se calcula automáticamente según las horas reservadas (validado en el servidor).</p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </button>
    </form>
  );
}
