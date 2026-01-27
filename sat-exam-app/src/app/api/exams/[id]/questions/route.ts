import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/exams/[id]/questions
 * List all questions for an exam
 */
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

        // Verify exam exists and belongs to teacher
        const exam = await prisma.exam.findFirst({
            where: { id: examId },
            include: { class: true },
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        if (exam.class.teacherId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const questions = await prisma.question.findMany({
            where: { examId },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/exams/[id]/questions
 * Bulk create questions (after AI parse + review)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId } = await params;

        // Verify exam exists and belongs to teacher
        const exam = await prisma.exam.findFirst({
            where: { id: examId },
            include: { class: true },
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        if (exam.class.teacherId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only allow adding questions to DRAFT exams
        if (exam.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Can only add questions to DRAFT exams' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { questions } = body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: 'Questions array is required' },
                { status: 400 }
            );
        }

        // Get current max order
        const maxOrder = await prisma.question.aggregate({
            where: { examId },
            _max: { order: true },
        });
        const startOrder = (maxOrder._max.order ?? 0) + 1;

        // Create questions with order
        const createdQuestions = await prisma.question.createMany({
            data: questions.map((q: {
                content: string;
                optionA: string;
                optionB: string;
                optionC: string;
                optionD: string;
                correctAnswer: string;
                points?: number;
            }, index: number) => ({
                examId,
                content: q.content,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer,
                points: q.points ?? 1,
                order: startOrder + index,
            })),
        });

        return NextResponse.json({
            success: true,
            count: createdQuestions.count,
        });
    } catch (error) {
        console.error('Error creating questions:', error);
        return NextResponse.json(
            { error: 'Failed to create questions' },
            { status: 500 }
        );
    }
}
