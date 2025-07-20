import { s3 } from "../../../libs3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return new Response(JSON.stringify({ message: "No file provided" }), { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let newFileName = file.name.replace(/\s+/g, "");
  newFileName = newFileName + String(Date.now())

  const command = new PutObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: newFileName,
    Body: buffer,
    ContentType: file.type,
    ACL: "public-read", // برای لینک عمومی
  });

  try {
    await s3.send(command);
    return new Response(
      JSON.stringify({
        message: "File uploaded",
        fileName: newFileName,
        url: `${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}/${newFileName}`,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ message: "Upload failed" }), { status: 500 });
  }
}
