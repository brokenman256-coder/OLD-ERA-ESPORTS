import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "payments");

export class UploadError extends Error {}

/**
 * Saves an uploaded payment-screenshot image to disk and returns the
 * public-facing path to store on the record (e.g. "/uploads/payments/xyz.png").
 */
export async function savePaymentScreenshot(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Only PNG, JPG, and WEBP images are accepted for payment screenshots.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Payment screenshot must be smaller than 5MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/payments/${filename}`;
}
