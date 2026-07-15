import { NextRequest } from "next/server";
import { ok, fail, withApi } from "@/lib/api";
import { storeUpload, MAX_UPLOAD_BYTES, ALLOWED_UPLOAD_TYPES } from "@/lib/storage";

export const POST = withApi(
  async (req: NextRequest, { session }) => {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) return fail("No file provided", 400);
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return fail(`Unsupported file type: ${file.type}`, 415);
    if (file.size > MAX_UPLOAD_BYTES) return fail("File exceeds 5MB limit", 413);

    const { url, backend } = await storeUpload(file);

    return ok({ url, backend, uploadedBy: session!.sub });
  },
  { minRole: "SCOUT" }
);
