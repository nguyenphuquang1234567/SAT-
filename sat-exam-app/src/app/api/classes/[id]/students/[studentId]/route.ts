import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; studentId: string }> }
) {
    try {
        const { id, studentId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify class ownership
        const classCheck = await prisma.class.findUnique({
            where: { id, teacherId: session.user.id }
        });

        if (!classCheck) {
            return new NextResponse("Class Not Found or Unauthorized", { status: 404 });
        }

        await prisma.classStudent.deleteMany({
            where: {
                classId: id,
                studentId: studentId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[CLASS_STUDENT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
