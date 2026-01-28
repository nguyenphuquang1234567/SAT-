
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
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
        const { answers, isFinalSubmission, timeSpent, flagged } = await request.json();
        console.log(`[DEBUG] Exam progress save for ${id}:`, { isFinalSubmission, timeSpent, answersCount: Object.keys(answers || {}).length });

        // 1. Verify Attempt
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            }
        });

        if (!studentExam || studentExam.status === 'SUBMITTED' || studentExam.status === 'GRADED') {
            return NextResponse.json({ error: 'Invalid attempt or already submitted' }, { status: 403 });
        }

        // 2. Save Answers and Flags
        const allQuestionIds = Array.from(new Set([
            ...Object.keys(answers || {}),
            ...Object.keys(flagged || {})
        ]));

        const answerPromises = allQuestionIds.map(async (questionId) => {
            const selectedChoice = answers?.[questionId];
            const isFlagged = flagged?.[questionId] || false;

            return prisma.studentAnswer.upsert({
                where: {
                    studentExamId_questionId: {
                        studentExamId: studentExam.id,
                        questionId: questionId
                    }
                },
                update: {
                    selectedAnswer: selectedChoice ? (selectedChoice as string) : undefined,
                    isFlagged: isFlagged
                } as any,
                create: {
                    studentExamId: studentExam.id,
                    questionId: questionId,
                    selectedAnswer: selectedChoice ? (selectedChoice as string) : null,
                    isFlagged: isFlagged
                } as any
            });
        });

        await Promise.all(answerPromises);

        // Update time spent even if not final submission
        if (timeSpent !== undefined && timeSpent !== null) {
            console.log(`[DATABASE] Updating timeSpent to: ${timeSpent}`);
            await prisma.studentExam.update({
                where: { id: studentExam.id },
                data: { timeSpent: Number(timeSpent) } as any
            });
        }

        // 3. If Final Submission: Calculate Score and Update Status
        if (isFinalSubmission) {
            // Get client IP for logging
            const forwardedFor = request.headers.get('x-forwarded-for');
            const submitIp = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

            const examQuestions = await prisma.question.findMany({
                where: { examId: examId }
            });

            let score = 0;
            let maxScore = examQuestions.length;

            const savedAnswers = await prisma.studentAnswer.findMany({
                where: { studentExamId: studentExam.id }
            });

            const updates = savedAnswers.map(studentAns => {
                const question = examQuestions.find(q => q.id === studentAns.questionId);
                let isCorrect = false;

                if (question) {
                    if (question.correctAnswer === studentAns.selectedAnswer) {
                        isCorrect = true;
                        score += 1;
                    }
                }

                return prisma.studentAnswer.update({
                    where: { id: studentAns.id },
                    data: { isCorrect }
                });
            });

            await Promise.all(updates);

            await prisma.studentExam.update({
                where: { id: studentExam.id },
                data: {
                    status: 'SUBMITTED',
                    score: score,
                    maxScore: maxScore,
                    submittedAt: new Date(),
                    submitIp: submitIp
                } as any
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error submitting exam:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
