"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelReservationButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onCancel() {
    if (!confirm("¿Deseas cancelar esta reserva?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo cancelar la reserva.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onCancel}
      disabled={loading}
      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Cancelando..." : "Cancelar"}
    </button>
  );
}
