"use client";

import { useEffect, useState } from "react";
import { SpaceForm, type SpaceFormValues } from "@/components/SpaceForm";
import { formatPrice, spaceTypeLabel } from "@/lib/utils";

type Space = {
  id: string;
  name: string;
  description: string;
  type: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
  capacity: number;
  pricePerHour: number;
  available: boolean;
};

export function AdminSpacesClient() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Space | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/spaces");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar espacios");
      setSpaces(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar espacios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carga inicial de espacios al montar el componente.
    void (async () => {
      await load();
    })();
  }, []);

  async function createSpace(values: SpaceFormValues) {
    setError(null);
    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      const details = data.details ? Object.values(data.details).flat().join(" ") : "";
      setError(`${data.error || "Error"} ${details}`.trim());
      return;
    }
    await load();
  }

  async function updateSpace(values: SpaceFormValues) {
    if (!editing) return;
    setError(null);
    const res = await fetch(`/api/spaces/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      const details = data.details ? Object.values(data.details).flat().join(" ") : "";
      setError(`${data.error || "Error"} ${details}`.trim());
      return;
    }
    setEditing(null);
    await load();
  }

  async function deleteSpace(id: string) {
    if (!confirm("¿Eliminar este espacio? Se eliminarán también sus reservas asociadas.")) return;
    setError(null);
    const res = await fetch(`/api/spaces/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "No se pudo eliminar el espacio."); return; }
    if (editing?.id === id) setEditing(null);
    await load();
  }

  return (
    <div className="space-y-8">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{editing ? "Editar espacio" : "Crear nuevo espacio"}</h2>
        <SpaceForm
          key={editing?.id || "new"}
          initialValues={editing ? { ...editing } : undefined}
          submitLabel={editing ? "Guardar cambios" : "Crear espacio"}
          onSubmit={editing ? updateSpace : createSpace}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Espacios registrados</h2>
        {loading ? (
          <p className="text-gray-600">Cargando espacios...</p>
        ) : spaces.length === 0 ? (
          <p className="rounded-lg border border-muted-border bg-muted p-6 text-gray-600">No hay espacios registrados.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-muted-border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-gray-700">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Capacidad</th>
                  <th className="px-4 py-3">Precio/hora</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {spaces.map((s) => (
                  <tr key={s.id} className="border-t border-muted-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{spaceTypeLabel(s.type)}</td>
                    <td className="px-4 py-3 text-gray-700">{s.capacity}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPrice(s.pricePerHour)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {s.available ? "Disponible" : "No disponible"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setEditing(s)} className="rounded-md border border-muted-border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-muted">Editar</button>
                        <button onClick={() => deleteSpace(s.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
