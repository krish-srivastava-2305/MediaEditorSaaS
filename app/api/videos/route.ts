import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const GET = async (req: NextRequest) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {createdAt : 'desc'}
        })
        return NextResponse.json({videos , message: "req success"}, {status: 200})

    } catch (error) {
        return NextResponse.json({error: "Error fetching vids"}, {status: 500})
    } finally {
        await prisma.$disconnect()
    }
} 