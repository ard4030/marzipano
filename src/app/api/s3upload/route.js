// src/app/api/storage/upload/route.ts or /app/api/storage/upload/route.ts
import { s3 } from "../../../libs3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";


export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);


  let newFileName = file.name.replace(/\s+/g, '');
  newFileName = newFileName + String(Date.now())

  const command = new PutObjectCommand({
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: newFileName,
    Body: buffer,
    ContentType: file.type,
  });

  await s3.send(command);

  return Response.json({ message: "File uploaded" , fileName:newFileName , url:`${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}/${newFileName}` });
}
