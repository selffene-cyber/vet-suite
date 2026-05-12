import { NextRequest, NextResponse } from "next/server";
import { getR2 } from "@/lib/db";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");

  const bucket = getR2();

  if (!bucket) {
    return NextResponse.json({ error: "Storage no disponible" }, { status: 500 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const headers = new Headers();
  if (object.httpMetadata?.contentType) headers.set("Content-Type", object.httpMetadata.contentType);
  if (object.httpMetadata?.contentLanguage) headers.set("Content-Language", object.httpMetadata.contentLanguage);
  if (object.httpMetadata?.contentDisposition) headers.set("Content-Disposition", object.httpMetadata.contentDisposition);
  if (object.httpMetadata?.contentEncoding) headers.set("Content-Encoding", object.httpMetadata.contentEncoding);
  if (object.httpMetadata?.cacheControl) headers.set("Cache-Control", object.httpMetadata.cacheControl);
  else headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (object.etag) headers.set("ETag", object.etag);

  return new Response(object.body as unknown as BodyInit, { headers });
}

export async function POST(request: NextRequest) {
  const bucket = getR2();

  if (!bucket) {
    return NextResponse.json({ error: "Storage no disponible" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prefix = (formData.get("prefix") as string) || "uploads";
    const companyId = formData.get("companyId") as string;

    if (!file || !companyId) {
      return NextResponse.json({ error: "Archivo y companyId requeridos" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const key = `${prefix}/${companyId}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return NextResponse.json({ key, url: `/api/storage/${key}` });
  } catch {
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const bucket = getR2();

  if (!bucket) {
    return NextResponse.json({ error: "Storage no disponible" }, { status: 500 });
  }

  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: "Key requerida" }, { status: 400 });
    }
    await bucket.delete(key);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar archivo" }, { status: 500 });
  }
}