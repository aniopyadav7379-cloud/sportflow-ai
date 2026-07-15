import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function isS3Configured() {
  return Boolean(process.env.S3_BUCKET && process.env.S3_REGION && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}

let s3Client: S3Client | null = null;
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION!,
      // S3_ENDPOINT lets this work with S3-compatible providers too
      // (Cloudflare R2, Backblaze B2, MinIO, etc.) — omit for real AWS S3.
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

/**
 * Uploads a file to S3 (or an S3-compatible provider) if configured via env
 * vars, otherwise falls back to local disk under public/uploads — handy for
 * zero-setup local dev, but not durable across redeploys/multiple instances.
 */
export async function storeUpload(file: File): Promise<{ url: string; backend: "s3" | "local" }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;

  if (isS3Configured()) {
    const bucket = process.env.S3_BUCKET!;
    const key = `uploads/${filename}`;
    await getS3Client().send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: file.type })
    );
    const publicBase = process.env.S3_PUBLIC_URL_BASE; // e.g. a CloudFront/R2 public domain
    const url = publicBase
      ? `${publicBase.replace(/\/$/, "")}/${key}`
      : `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
    return { url, backend: "s3" };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
  return { url: `/uploads/${filename}`, backend: "local" };
}
