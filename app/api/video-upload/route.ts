import {v2 as cloudinary} from "cloudinary"
import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@clerk/nextjs/server"

const prisma = new PrismaClient()

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

interface CloudinaryResponse {
    public_id: string,
    bytes: number;
    duration?: number
    [key: string]: any
}

export const POST = async (req: NextRequest) => {
    const {userId} = auth()
    if(!userId) return NextResponse.json({error: "User not authorized!"}, {status: 401})
        
    try {
        const formData = await req.formData()

        const file = formData.get('file') as File | null
        const description = formData.get('description') as string
        const title = formData.get('title') as string
        const originalSize = formData.get('originalSize') as string

        if(!file || !title || !description || !originalSize) return NextResponse.json({error: "Err one or more fields missing"}, {status: 400})
            
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryResponse>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "video-uploads",
                        transformation: [
                            {quality: "auto", fetch_format: "mp4"},
                        ]
                    },
                    (error, result) => {
                        if(error) reject(error);
                        else resolve(result as CloudinaryResponse);
                    }
                )
                uploadStream.end(buffer)
            }
        )

        const video = await prisma.video.create({
            data: {
                publicId: result.public_id,
                title,
                description,
                originalSize,
                compressedSize: String(result.bytes),
                duration: String(result.duration) || '0',
            }
        })

        return NextResponse.json({video, message: "Upload Success"}, {status: 200})


    } catch (error) {
        console.log("Err in Uploading Vid: ", error)
        return NextResponse.json({error: "Server Error in uploading video"}, {status: 500})
    } finally {
        await prisma.$disconnect()
    }
}
