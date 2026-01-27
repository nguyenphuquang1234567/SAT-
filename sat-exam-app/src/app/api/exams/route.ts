import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, type, duration, startTime, endTime, classId } = body;

        if (!title || !duration || !classId || !type) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify that the teacher owns the class
        const classCheck = await prisma.class.findUnique({
            where: {
                id: classId,
                teacherId: session.user.id,
            }
        });

        if (!classCheck) {
            return new NextResponse("Invalid Class ID or Unauthorized", { status: 403 });
        }

        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                type,
                duration: parseInt(duration),
                startTime: startTime ? new Date(startTime) : null,
                endTime: endTime ? new Date(endTime) : null,
                classId,
                status: "DRAFT", // Default status
            }
        });

        return NextResponse.json(exam);

    } catch (error) {
        console.error("[EXAMS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get all exams for classes owned by this teacher
        const exams = await prisma.exam.findMany({
            where: {
                class: {
                    teacherId: session.user.id
                }
            },
            include: {
                class: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: { questions: true, studentExams: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(exams);

    } catch (error) {
        console.error("[EXAMS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
