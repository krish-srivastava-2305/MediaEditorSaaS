import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryResponse {
  public_id: string;
  [key: string]: any;
}

export const POST = async (req: NextRequest) => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "User not Authorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        { folder: "media-editor-uploads" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResponse);
        }
      );
      upload_stream.end(buffer);
    });

    return NextResponse.json(
      {
        publicId: result.public_id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Upload image failed", error);
    return NextResponse.json({ error: "Upload image failed" }, { status: 500 });
  }
};
