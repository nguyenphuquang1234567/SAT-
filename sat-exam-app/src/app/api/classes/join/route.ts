import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { code } = await req.json();

        if (!code) {
            return new NextResponse("Class code is required", { status: 400 });
        }

        const classToJoin = await prisma.class.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!classToJoin) {
            return new NextResponse("Mã lớp không hợp lệ", { status: 404 });
        }

        // Check if already joined
        const existing = await prisma.classStudent.findUnique({
            where: {
                classId_studentId: {
                    classId: classToJoin.id,
                    studentId: session.user.id,
                },
            },
        });

        if (existing) {
            return new NextResponse("Bạn đã tham gia lớp này rồi", { status: 400 });
        }

        const joined = await prisma.classStudent.create({
            data: {
                classId: classToJoin.id,
                studentId: session.user.id,
            },
        });

        return NextResponse.json(joined);
    } catch (error) {
        console.error("[CLASS_JOIN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
