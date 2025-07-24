import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({success:false,message: 'Method not allowed'},{status:400})
  }

  const { html } = await req.json();

  const filePath = path.join(process.cwd(), 'public', 'generated', 'viewer.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  try {
    fs.writeFileSync(filePath, html, 'utf8');
    return NextResponse.json({success:true,message: 'File saved'},{status:200})
  } catch (error) {
    console.error('Error writing HTML file:', error);
    return NextResponse.json({success:false,message: 'Failed to save file'},{status:400})

  }
}
