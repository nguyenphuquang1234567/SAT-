import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; studentId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId, studentId } = await params;

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

        // Fetch detailed student exam
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                answers: {
                    include: {
                        question: true
                    },
                    orderBy: {
                        question: {
                            order: 'asc'
                        }
                    }
                }
            }
        });

        if (!studentExam) {
            return NextResponse.json({ error: 'Student attempt not found' }, { status: 404 });
        }

        // Fetch all questions for the exam to ensure we show even unanswered ones
        const examQuestions = await prisma.question.findMany({
            where: { examId },
            orderBy: { order: 'asc' }
        });

        // Map all questions to answers
        const answersWithUnanswered = examQuestions.map(question => {
            const studentAns = studentExam.answers.find(a => a.questionId === question.id);
            return {
                questionId: question.id,
                questionContent: question.content,
                questionOrder: question.order,
                options: {
                    A: question.optionA,
                    B: question.optionB,
                    C: question.optionC,
                    D: question.optionD,
                },
                selectedAnswer: studentAns?.selectedAnswer || null,
                correctAnswer: question.correctAnswer,
                isCorrect: studentAns?.isCorrect || false,
                points: question.points,
            };
        });

        return NextResponse.json({
            studentExam: {
                ...studentExam,
                answers: answersWithUnanswered
            }
        });

    } catch (error) {
        console.error('Error fetching student details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student details' },
            { status: 500 }
        );
    }
}
