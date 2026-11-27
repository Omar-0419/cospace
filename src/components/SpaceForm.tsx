
"use client";

import { useEffect, useState } from "react";

export type SpaceFormValues = {
  name: string;
  description: string;
  type: "DESK" | "MEETING_ROOM" | "PRIVATE_OFFICE";
  capacity: number;
  pricePerHour: number;
  available: boolean;
};

const emptyValues: SpaceFormValues = {
  name: "",
  description: "",
  type: "DESK",
  capacity: 1,
  pricePerHour: 0,
  available: true,
};

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function SpaceForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  imageRequired = true,
}: {
  initialValues?: Partial<SpaceFormValues>;
  submitLabel: string;
  onSubmit: (values: SpaceFormValues, image: File | null) => Promise<void>;
  onCancel?: () => void;
  imageRequired?: boolean;
}) {
  const [values, setValues] = useState<SpaceFormValues>({
    ...emptyValues,
    ...initialValues,
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    setImageError(null);

    if (!file) {
      setImage(null);
      setPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Formato no permitido. Usa JPG, PNG o WEBP.");
      setImage(null);
      setPreview(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setImageError("La imagen no puede superar los 5 MB.");
      setImage(null);
      setPreview(null);
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (imageRequired && !image) {
      setImageError("Debes seleccionar una imagen.");
      return;
    }

    if (imageError) return;

    setLoading(true);

    try {
      await onSubmit(values, image);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-muted-border bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700">Nombre</span>
          <input
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            required
            className="w-full rounded-md border border-muted-border px-3 py-2"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700">Descripción</span>
          <textarea
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            required
            rows={3}
            className="w-full rounded-md border border-muted-border px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">Tipo</span>
          <select
            value={values.type}
            onChange={(e) =>
              setValues({
                ...values,
                type: e.target.value as SpaceFormValues["type"],
              })
            }
            className="w-full rounded-md border border-muted-border px-3 py-2"
          >
            <option value="DESK">Escritorio</option>
            <option value="MEETING_ROOM">Sala de reuniones</option>
            <option value="PRIVATE_OFFICE">Oficina privada</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Capacidad (personas)
          </span>
          <input
            type="number"
            min={1}
            value={values.capacity}
            onChange={(e) =>
              setValues({ ...values, capacity: Number(e.target.value) })
            }
            required
            className="w-full rounded-md border border-muted-border px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Precio por hora
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={values.pricePerHour}
            onChange={(e) =>
              setValues({ ...values, pricePerHour: Number(e.target.value) })
            }
            required
            className="w-full rounded-md border border-muted-border px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm sm:pt-7">
          <input
            type="checkbox"
            checked={values.available}
            onChange={(e) =>
              setValues({ ...values, available: e.target.checked })
            }
            className="h-4 w-4"
          />
          <span className="font-medium text-gray-700">Disponible</span>
        </label>

        <div className="space-y-2 sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Imagen del espacio {imageRequired ? "(obligatoria)" : "(opcional)"}
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={imageRequired}
            onChange={handleImageChange}
            className="w-full rounded-md border border-muted-border px-3 py-2 text-sm cursor-pointer"
          />

          <p className="text-xs text-gray-500">
            Formatos permitidos: JPG, PNG y WEBP. Tamaño máximo: 5 MB.
          </p>

          {imageError && (
            <p className="text-sm text-red-600">{imageError}</p>
          )}

          {preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Vista previa:
              </p>
              <img
                src={preview}
                alt="Vista previa del espacio"
                className="h-48 w-full rounded-lg border object-cover"
              />
              <p className="text-xs text-gray-500">{image?.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Guardando..." : submitLabel}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-muted-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-muted"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
