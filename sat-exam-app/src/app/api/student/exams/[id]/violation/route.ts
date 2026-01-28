import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: examId } = await params;
        const studentId = session.user.id;
        const body = await request.json();
        const { type } = body; // e.g., "FULLSCREEN_EXIT", "TAB_SWITCH"

        if (!type) {
            return NextResponse.json({ error: 'Violation type is required' }, { status: 400 });
        }

        // Get student exam and exam info
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: { studentId, examId }
            },
            include: {
                exam: {
                    select: {
                        maxViolations: true
                    }
                }
            }
        });

        if (!studentExam) {
            return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
        }

        // Only track violations for in-progress exams
        if (studentExam.status !== 'IN_PROGRESS') {
            return NextResponse.json({
                error: 'Cannot log violation - exam not in progress',
                violationCount: studentExam.violationCount,
                shouldAutoSubmit: false
            }, { status: 400 });
        }

        // Increment violation count and create violation record
        const [updatedStudentExam] = await prisma.$transaction([
            prisma.studentExam.update({
                where: { id: studentExam.id },
                data: {
                    violationCount: { increment: 1 }
                }
            }),
            prisma.violation.create({
                data: {
                    studentExamId: studentExam.id,
                    type: type,
                    description: `Student violated exam rules: ${type}`
                }
            })
        ]);

        const newViolationCount = updatedStudentExam.violationCount;
        const maxViolations = studentExam.exam.maxViolations;
        const shouldAutoSubmit = newViolationCount >= maxViolations;

        return NextResponse.json({
            violationCount: newViolationCount,
            maxViolations: maxViolations,
            shouldAutoSubmit: shouldAutoSubmit,
            message: shouldAutoSubmit
                ? 'Max violations reached. Exam will be auto-submitted.'
                : `Violation logged. ${maxViolations - newViolationCount} chances remaining.`
        });

    } catch (error) {
        console.error('Error logging violation:', error);
        return NextResponse.json(
            { error: 'Failed to log violation' },
            { status: 500 }
        );
    }
}
