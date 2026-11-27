import { NextResponse } from "next/server";
import { subirFoto } from "@/lib/s3/upload";

const TIPOS_PERMITIDOS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const foto = formData.get("foto")

        if (!(foto instanceof File)){
            return NextResponse.json(
                { error: "Debes seleccionar una imagen." },
                { status: 400 }
            );
        }

        console.log("Tipo MIME recibido:", foto.type);
        const extension = TIPOS_PERMITIDOS[foto.type]

        if (!extension){
            return NextResponse.json(
                { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
                { status: 400 }
            );
        }

        if (foto.size > MAX_SIZE){
            return NextResponse.json(
                { error: "La imagen no puede superar los 5 MB." },
                { status: 400 }
            );
        }

        const body = Buffer.from(await foto.arrayBuffer());

        const key = await subirFoto({
            body,
            contentType: foto.type,
            extension
        });

        return NextResponse.json({ key }, { status: 201 })

    } catch (error) {
        console.error("Error al subir imagen:", error);

        return NextResponse.json(
            { error: "No se pudo subir la imagen." },
            { status: 500 }
        );

    }

}