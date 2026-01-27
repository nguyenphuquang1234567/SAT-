import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                class: true,
                questions: true,
            }
        });

        if (!exam) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Verify ownership (indirectly via Class)
        const classCheck = await prisma.class.findUnique({
            where: {
                id: exam.classId,
                teacherId: session.user.id
            }
        });

        if (!classCheck) {
            return new NextResponse("Unauthorized Access", { status: 403 });
        }

        return NextResponse.json(exam);

    } catch (error) {
        console.error("[EXAM_ID_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // First verify ownership
        const existingExam = await prisma.exam.findUnique({
            where: { id },
            include: { class: true }
        });

        if (!existingExam || existingExam.class.teacherId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const updatedExam = await prisma.exam.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                duration: body.duration ? parseInt(body.duration) : undefined,
                startTime: body.startTime ? new Date(body.startTime) : undefined,
                endTime: body.endTime ? new Date(body.endTime) : undefined,
                status: body.status, // ACTIVE, DRAFT, PUBLISHED
            }
        });

        return NextResponse.json(updatedExam);
    } catch (error) {
        console.error("[EXAM_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // First verify ownership
        const existingExam = await prisma.exam.findUnique({
            where: { id },
            include: { class: true }
        });

        if (!existingExam || existingExam.class.teacherId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        await prisma.exam.delete({
            where: { id }
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("[EXAM_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
