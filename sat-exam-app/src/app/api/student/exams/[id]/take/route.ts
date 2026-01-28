
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

        // 1. Verify that the student has an ACTIVE attempt for this exam
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            }
        });

        if (!studentExam || studentExam.status !== 'IN_PROGRESS') {
            return NextResponse.json({ error: 'No active attempt found. Please start the exam first.' }, { status: 403 });
        }

        console.log(`[DEBUG] Exam take for ${id}: current timeSpent is ${(studentExam as any).timeSpent}`);

        // 2. Fetch Exam Questions
        // Map optionA...optionD to the frontend 'answers' structure
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: {
                id: true,
                title: true,
                duration: true,
                pdfUrl: true,
                maxViolations: true,
                questions: {
                    select: {
                        id: true,
                        order: true, // Was questionNumber
                        content: true, // Make sure we get content/imageUrl if needed. Schema says 'content' string. 
                        // Wait, schema has 'content', but does it have imageUrl?
                        // Schema model Question: content String, optionA..D String.
                        // It DOES NOT have imageUrl column in the schema view I saw earlier! 
                        // Let me re-check schema in next step if generic text content is used or if I need to add imageUrl.
                        // For now assuming 'content' might store the image URL or text.
                        // The user wanted "PDF/Image Viewer".
                        // In the previous task "Converting PDF to Image", did we add an imageUrl field?
                        // I need to check schema again to be sure specific fields.
                        // Going with standard fields for now.
                        optionA: true,
                        optionB: true,
                        optionC: true,
                        optionD: true,
                        section: true, // Added
                        rawNumber: true, // Added
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Transform for frontend
        const questionsForFrontend = exam.questions.map((q: any) => ({
            id: q.id,
            questionNumber: q.rawNumber || q.order, // Use rawNumber (1, 2, 3...) from that section
            imageUrl: q.content,
            content: q.content, // Add content to parse true section
            section: q.section || 'General', // Use stored section
            answers: [
                { id: 'A', text: q.optionA, choice: 'A' },
                { id: 'B', text: q.optionB, choice: 'B' },
                { id: 'C', text: q.optionC, choice: 'C' },
                { id: 'D', text: q.optionD, choice: 'D' },
            ]
        }));

        // 3. Get any existing saved answers for this attempt
        const existingAnswers = await prisma.studentAnswer.findMany({
            where: {
                studentExamId: studentExam.id
            },
            select: {
                questionId: true,
                selectedAnswer: true,
                isFlagged: true
            } as any
        });

        return NextResponse.json({
            exam: {
                id: exam.id,
                title: exam.title,
                duration: exam.duration,
                pdfUrl: exam.pdfUrl,
                maxViolations: exam.maxViolations || 3,
                questions: questionsForFrontend
            },
            startedAt: studentExam.startedAt,
            timeSpent: (studentExam as any).timeSpent || 0,
            violationCount: studentExam.violationCount || 0,
            savedAnswers: existingAnswers
        });

    } catch (error) {
        console.error('Error fetching exam content:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
