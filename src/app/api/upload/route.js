import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
const path = require("path");


export const config = {api: {bodyParser: false,},};
const allowFormats = ["image/jpeg","image/webp","image/png"]

export async function POST(req) {

  try {
    // Get File
    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const file = (body.file) || null;

    // Check Formatt
    if(!allowFormats.includes(file.type)) throw new Error("The format is not allowed!!")
    
    // Check Size
    if(file.size > 100000) throw new Error("Maximum file size 2 MB!!") 

    // Upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadPath = path.join(process.cwd(), 'public', 'uploads'); 

    let myFileName = `${Date.now()}${file.name.replaceAll(" ", "ـ")}`;
    await mkdir(uploadPath, { recursive: true });
    const filePath = `${uploadPath}/${myFileName}`;
    await writeFile(filePath, buffer);
        

    return NextResponse.json(
            {success:true,message:"success",data:myFileName},
            {status:200}
        )
    
  } catch (error) {
    return NextResponse.json(
        {success:false,message:error.message},
        {status:400}
    )
  }

    

    
  

}