import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: classId } = await params;
        const session = await getServerSession(authOptions);

        console.log('Class ID:', classId);
        console.log('Session User:', session?.user);

        if (!session || session.user.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const studentId = session.user.id;
        console.log('Student ID:', studentId);

        // Check if student is enrolled
        const enrollment = await prisma.classStudent.findUnique({
            where: {
                classId_studentId: {
                    classId,
                    studentId,
                },
            },
        });

        console.log('Enrollment found:', !!enrollment);

        if (!enrollment) {
            return new NextResponse("Bạn không tham gia lớp học này", { status: 403 });
        }

        // Fetch class details with teacher info
        const classDetail = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                teacher: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!classDetail) {
            return new NextResponse("Lớp học không tồn tại", { status: 404 });
        }

        // Fetch all exams for this class
        const exams = await prisma.exam.findMany({
            where: {
                classId: classId,
                status: {
                    in: ["PUBLISHED", "ACTIVE", "COMPLETED"], // Only show these
                },
            },
            include: {
                studentExams: {
                    where: {
                        studentId: studentId,
                    },
                    select: {
                        status: true,
                        score: true,
                        maxScore: true,
                        submittedAt: true,
                        violationCount: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        // Separate into upcoming/active and completed
        const availableExams = exams.filter(
            (e) => !e.studentExams[0] || ["NOT_STARTED", "IN_PROGRESS"].includes(e.studentExams[0].status)
        ).map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            duration: e.duration,
            startTime: e.startTime,
            endTime: e.endTime,
            questionCount: e._count.questions,
            status: e.status,
            attemptStatus: e.studentExams[0]?.status || "NOT_STARTED",
        }));

        const completedExams = exams.filter(
            (e) => e.studentExams[0] && ["SUBMITTED", "GRADED"].includes(e.studentExams[0].status)
        ).map(e => ({
            id: e.id,
            title: e.title,
            duration: e.duration,
            questionCount: e._count.questions,
            score: e.studentExams[0].score,
            maxScore: e.studentExams[0].maxScore,
            submittedAt: e.studentExams[0].submittedAt,
            violationCount: e.studentExams[0].violationCount,
        }));

        return NextResponse.json({
            class: {
                id: classDetail.id,
                name: classDetail.name,
                description: classDetail.description,
                code: classDetail.code,
                teacher: classDetail.teacher.name,
            },
            availableExams,
            completedExams,
        });
    } catch (error) {
        console.error("[STUDENT_CLASS_DETAIL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
