import { Update } from "@/app/types/tg";
import dotenv from "dotenv";
import { NextResponse } from "next/server";

dotenv.config(); // Load environment variables

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID || "", 10);

async function fetchTelegramUpdates(): Promise<Update[]> {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
  );

  const data = await response.json();

  return data.result;
}

async function fetchImagesFromTelegram(): Promise<string[]> {
  const updates = await fetchTelegramUpdates();

  const seenFileIds = new Set<string>();

  const images = updates
    .filter(
      (update) =>
        update?.message?.chat?.id === TELEGRAM_CHAT_ID &&
        update?.message?.photo?.length > 0
    )
    .flatMap((update) => {
      if (!update.message) return []; // Ensure message is defined

      const lastPhoto = update.message.photo.slice(-1)[0]; // Get the last photo
      if (lastPhoto && !seenFileIds.has(lastPhoto.file_id)) {
        seenFileIds.add(lastPhoto.file_id); // Add to seen set
        return [lastPhoto.file_id]; // Return an array with the last photo's file_id
      }
      return []; // Return an empty array if conditions are not met
    })
    .reverse();

  return images;
}

async function getFileUrl(fileId: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const data = await response.json();

  const filePath = data.result.file_path;
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
}

// Remove the export from fetchImageUrls
async function fetchImageUrls() {
  const images = await fetchImagesFromTelegram();

  const imageUrls = await Promise.all(
    images.map(async (image) => {
      const url = await getFileUrl(image);
      return url;
    })
  );

  return imageUrls;
}

// Ensure GET is the default export
export const GET = async (): Promise<NextResponse> => {
  try {
    const images = await fetchImageUrls();

    return NextResponse.json(images, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ msg, error }, { status: 401 });
  }
};
