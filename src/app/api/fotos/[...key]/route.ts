import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { s3Client } from "@/lib/s3/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const imageKey = key.join("/");

    // Solo permitimos consultar imágenes de espacios.
    if (
      !imageKey.startsWith("fotos/") &&
      imageKey !== "originals/landing-background.webp" &&
      imageKey !== "landing-background.webp"
    ) {
      return NextResponse.json(
        { error: "Ruta de imagen no válida." },
        { status: 400 }
      );
    }

    const bucket = process.env.S3_BUCKET_NAME;

    if (!bucket) {
      throw new Error("Falta S3_BUCKET_NAME");
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: imageKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error al obtener imagen:", error);

    return NextResponse.json(
      { error: "No se pudo obtener la imagen." },
      { status: 500 }
    );
  }
}
