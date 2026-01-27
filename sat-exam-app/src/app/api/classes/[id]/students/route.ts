import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: classId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "TEACHER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify class ownership
        const classCheck = await prisma.class.findUnique({
            where: { id: classId, teacherId: session.user.id }
        });

        if (!classCheck) {
            return new NextResponse("Class Not Found", { status: 404 });
        }

        const { email } = await req.json();

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        // Find student by email
        const student = await prisma.user.findUnique({
            where: { email, role: "STUDENT" },
        });

        if (!student) {
            return new NextResponse("Không tìm thấy học sinh với email này. Hãy chắc chắn học sinh đã đăng ký tài khoản.", { status: 404 });
        }

        // Check if already in class
        const existing = await prisma.classStudent.findUnique({
            where: {
                classId_studentId: {
                    classId,
                    studentId: student.id,
                },
            },
        });

        if (existing) {
            return new NextResponse("Học sinh này đã có trong lớp rồi.", { status: 400 });
        }

        // Add student to class
        const newEnrollment = await prisma.classStudent.create({
            data: {
                classId,
                studentId: student.id,
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(newEnrollment);
    } catch (error) {
        console.error("[CLASS_STUDENT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
