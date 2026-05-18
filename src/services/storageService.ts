import { getDownloadURL, deleteObject, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

function getProfilePhotoRef(userId: string) {
  return ref(storage, `users/${userId}/profile.jpg`);
}

function inferContentType(uri: string): string {
  const normalized = uri.toLowerCase();

  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".heic")) return "image/heic";

  return "image/jpeg";
}

async function blobFromUri(localUri: string): Promise<Blob> {
  const response = await fetch(localUri);

  if (!response.ok) {
    throw new Error("Unable to read the selected image.");
  }

  return response.blob();
}

export async function uploadProfilePhoto(
  userId: string,
  localUri: string,
): Promise<string> {
  const imageBlob = await blobFromUri(localUri);
  const profilePhotoRef = getProfilePhotoRef(userId);

  await uploadBytes(profilePhotoRef, imageBlob, {
    contentType: inferContentType(localUri),
  });

  return getDownloadURL(profilePhotoRef);
}

export async function deleteProfilePhoto(userId: string): Promise<void> {
  const profilePhotoRef = getProfilePhotoRef(userId);

  try {
    await deleteObject(profilePhotoRef);
  } catch (error: any) {
    if (error?.code !== "storage/object-not-found") {
      throw error;
    }
  }
}
