
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

        const studentId = session.user.id;
        const examId = id;

        // 1. Verify Attempt and Status
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            },
            include: {
                answers: true
            }
        });

        if (!studentExam || studentExam.status !== 'SUBMITTED' && studentExam.status !== 'GRADED') {
            return NextResponse.json({ error: 'Exam not submitted yet' }, { status: 403 });
        }

        // 2. Fetch Exam Details and Questions
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // 3. Construct Review Data
        const questionsWithReview = exam.questions.map(q => {
            const studentAnswer = studentExam.answers.find(a => a.questionId === q.id);
            return {
                id: q.id,
                questionNumber: q.rawNumber || q.order,
                content: q.content,
                section: q.section || 'General',
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer,
                studentAnswer: studentAnswer?.selectedAnswer || null,
                isCorrect: studentAnswer?.isCorrect || false,
                points: q.points
            };
        });

        return NextResponse.json({
            exam: {
                title: exam.title,
                duration: exam.duration,
            },
            result: {
                score: studentExam.score,
                maxScore: studentExam.maxScore,
                submittedAt: studentExam.submittedAt,
                timeSpent: studentExam.timeSpent,
                questions: questionsWithReview
            }
        });

    } catch (error) {
        console.error('Error fetching exam result:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
