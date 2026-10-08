import { NextResponse, type NextRequest } from "next/server";

import { segmentImage } from "@/lib/api";
import { getCurrentUser } from "@/lib/dal";
import { createGarments } from "@/lib/garments";

// Segmentation can wait on a cold Space start.
export const maxDuration = 60;

// Browsers resize photos before upload; this is a backstop under Vercel's 4.5 MB body limit.
const MAX_BYTES = 4 * 1024 * 1024;

/** Upload a photo: segment it, store each cutout, return the new garments. The photo itself is never stored. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to add clothes." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (!(photo instanceof Blob) || !photo.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large. Try one under 4 MB." }, { status: 413 });
  }

  const result = await segmentImage(photo);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.status });
  if (result.items.length === 0) {
    return NextResponse.json(
      { error: "No clothing found. Try a full-length photo in good light." },
      { status: 422 },
    );
  }

  try {
    const garments = await createGarments(
      user.id,
      result.items.map((item) => ({
        label: item.label,
        confidence: item.confidence,
        colors: item.colors,
        png: Buffer.from(item.image, "base64"),
      })),
    );
    return NextResponse.json({ garments }, { status: 201 });
  } catch (error) {
    // Storage or database failed after segmentation. Log the details, and return only
    // the error type (never config values) so the cause is visible from the browser.
    console.error("[api/garments] saving cutouts failed:", error);
    const code = (error as { Code?: string; name?: string }).Code ?? (error as Error).name ?? "Error";
    const message = (error as Error).message ?? "";
    const reason = message.includes("must be set") ? message : code;
    return NextResponse.json({ error: `Couldn't save your clothes (${reason}). Try again.` }, { status: 500 });
  }
}
