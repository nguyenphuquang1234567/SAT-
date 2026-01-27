import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/exams/[id]/questions/reorder
 * Reorder questions (drag-and-drop)
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

        // Only allow reordering in DRAFT exams
        if (exam.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Can only reorder questions in DRAFT exams' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { questionIds } = body;

        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json(
                { error: 'questionIds array is required' },
                { status: 400 }
            );
        }

        // Update each question's order in a transaction
        await prisma.$transaction(
            questionIds.map((questionId: string, index: number) =>
                prisma.question.update({
                    where: { id: questionId },
                    data: { order: index + 1 },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering questions:', error);
        return NextResponse.json(
            { error: 'Failed to reorder questions' },
            { status: 500 }
        );
    }
}
