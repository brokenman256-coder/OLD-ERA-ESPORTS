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
 * Uploads an image to Vercel Blob storage under the given folder and returns
 * its public URL to store on the record.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Only PNG, JPG, and WEBP images are accepted.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Image must be smaller than 5MB.");
  }

  const filename = `${folder}/${randomUUID()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return blob.url;
}

export function savePaymentScreenshot(file: File): Promise<string> {
  return uploadImage(file, "payments");
}

export function saveTournamentBanner(file: File): Promise<string> {
  return uploadImage(file, "banners");
}

export function saveAvatar(file: File): Promise<string> {
  return uploadImage(file, "avatars");
}

export function saveQrCode(file: File): Promise<string> {
  return uploadImage(file, "settings");
}

export function savePromoBanner(file: File): Promise<string> {
  return uploadImage(file, "promos");
}

export function saveResultScreenshot(file: File): Promise<string> {
  return uploadImage(file, "results");
}

export function saveWalletTopUpProof(file: File): Promise<string> {
  return uploadImage(file, "wallet-topups");
}
