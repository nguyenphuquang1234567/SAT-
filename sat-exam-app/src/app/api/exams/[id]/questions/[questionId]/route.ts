import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/exams/[id]/questions/[questionId]
 * Update a single question
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId, questionId } = await params;

        // Verify question belongs to exam and teacher owns it
        const question = await prisma.question.findFirst({
            where: { id: questionId, examId },
            include: { exam: { include: { class: true } } },
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        if (question.exam.class.teacherId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only allow editing questions in DRAFT exams
        if (question.exam.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Can only edit questions in DRAFT exams' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { content, optionA, optionB, optionC, optionD, correctAnswer, points } = body;

        const updated = await prisma.question.update({
            where: { id: questionId },
            data: {
                ...(content && { content }),
                ...(optionA && { optionA }),
                ...(optionB && { optionB }),
                ...(optionC && { optionC }),
                ...(optionD && { optionD }),
                ...(correctAnswer && { correctAnswer }),
                ...(points !== undefined && { points }),
            },
        });

        return NextResponse.json({ question: updated });
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json(
            { error: 'Failed to update question' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/exams/[id]/questions/[questionId]
 * Delete a single question
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; questionId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId, questionId } = await params;

        // Verify question belongs to exam and teacher owns it
        const question = await prisma.question.findFirst({
            where: { id: questionId, examId },
            include: { exam: { include: { class: true } } },
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        if (question.exam.class.teacherId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only allow deleting questions in DRAFT exams
        if (question.exam.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Can only delete questions in DRAFT exams' },
                { status: 400 }
            );
        }

        await prisma.question.delete({
            where: { id: questionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting question:', error);
        return NextResponse.json(
            { error: 'Failed to delete question' },
            { status: 500 }
        );
    }
}
