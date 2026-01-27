import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId } = await params;

        // Verify exam ownership
        const exam = await prisma.exam.findFirst({
            where: {
                id: examId,
                class: { teacherId: session.user.id }
            },
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Fetch all student attempts
        const studentExams = await prisma.studentExam.findMany({
            where: { examId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                score: 'desc', // Default sort by score
            }
        });

        // Calculate statistics
        const submittedExams = studentExams.filter(se => se.status === 'SUBMITTED');
        const scores = submittedExams.map(se => se.score || 0);

        const stats = {
            totalStudents: studentExams.length,
            completed: submittedExams.length,
            averageScore: scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        };

        return NextResponse.json({
            stats,
            students: studentExams.map(se => ({
                id: se.id, // studentExamId
                studentId: se.student.id,
                name: se.student.name,
                email: se.student.email,
                status: se.status,
                score: se.score,
                startedAt: se.createdAt,
                submittedAt: se.updatedAt, // Assuming updatedAt is close to submission time for SUBMITTED
                violationCount: se.violationCount,
            }))
        });

    } catch (error) {
        console.error('Error fetching exam results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
