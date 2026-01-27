
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const examId = id;
        const studentId = session.user.id;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                classId: true,
                _count: {
                    select: { questions: true }
                }
            }
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Verify access (must be enrolled in class)
        // Ideally we should check this, consistent with 'attempt' logic
        if (exam.classId) {
            const isStudentInClass = await prisma.classStudent.findFirst({
                where: {
                    classId: exam.classId,
                    studentId: studentId
                }
            });

            if (!isStudentInClass) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        }

        return NextResponse.json({
            id: exam.id,
            title: exam.title,
            description: exam.description,
            duration: exam.duration,
            questionCount: exam._count.questions
        });

    } catch (error) {
        console.error('Error fetching exam info:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
