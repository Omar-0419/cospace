import { AdminSpacesClient } from "@/components/AdminSpacesClient";

export default function AdminSpacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administración de espacios</h1>
        <p className="mt-1 text-gray-600">Crea, edita y elimina los espacios de trabajo disponibles.</p>
      </div>
      <AdminSpacesClient />
    </div>
  );
}
