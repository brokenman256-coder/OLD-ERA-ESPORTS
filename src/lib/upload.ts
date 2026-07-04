import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadError extends Error {}

/**
 * Uploads a payment-screenshot image to Vercel Blob storage and returns its
 * public URL to store on the record.
 */
export async function savePaymentScreenshot(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Only PNG, JPG, and WEBP images are accepted for payment screenshots.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Payment screenshot must be smaller than 5MB.");
  }

  const filename = `payments/${randomUUID()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return blob.url;
}
