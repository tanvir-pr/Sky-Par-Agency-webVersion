import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { jsonError } from "@/lib/api-utils";
import { uploadToS3, generateFileKey } from "@/lib/storage/s3";
import { logActivity } from "@/lib/notifications/create";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) return jsonError("No file provided", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateFileKey(folder, file.name);
    const url = await uploadToS3(key, buffer, file.type);

    await logActivity(auth.user.id, "UPLOAD", `Uploaded ${file.name}`, "File", key);

    return NextResponse.json({ url, key, name: file.name });
  } catch (err) {
    console.error("Upload error:", err);
    return jsonError("Upload failed", 500);
  }
}
