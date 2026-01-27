
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Updated params type
) {
    try {
        const { id } = await context.params; // Await params
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = session.user.id;
        const examId = id;

        // 1. Check if exam exists and is accessible
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                class: {
                    select: { id: true, students: { select: { studentId: true } } }
                }
            }
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Check if student is in the class assigned to this exam
        const isStudentInClass = exam.classId &&
            (await prisma.classStudent.findFirst({
                where: {
                    classId: exam.classId,
                    studentId: studentId
                }
            }));

        if (!isStudentInClass) {
            return NextResponse.json({ error: 'You are not enrolled in the class for this exam' }, { status: 403 });
        }

        // 2. Check exam status and time
        if (exam.status !== 'PUBLISHED' && exam.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Exam is not active' }, { status: 403 });
        }

        const now = new Date();
        if (exam.startTime && now < exam.startTime) {
            return NextResponse.json({ error: 'Exam has not started yet' }, { status: 403 });
        }
        if (exam.endTime && now > exam.endTime) {
            return NextResponse.json({ error: 'Exam has ended' }, { status: 403 });
        }

        // 3. Check if attempt already exists
        let studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            }
        });

        // 4. Create attempt if not exists
        if (!studentExam) {
            studentExam = await prisma.studentExam.create({
                data: {
                    studentId,
                    examId,
                    status: 'IN_PROGRESS',
                    startedAt: new Date()
                }
            });
        } else if (studentExam.status === 'SUBMITTED' || studentExam.status === 'GRADED') {
            return NextResponse.json({ error: 'You have already submitted this exam' }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            attemptId: studentExam.id
        });

    } catch (error) {
        console.error('Error starting exam attempt:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
