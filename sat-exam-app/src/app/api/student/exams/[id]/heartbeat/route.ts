
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
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Check if the session matches
        const studentExam = await prisma.studentExam.findUnique({
            where: {
                studentId_examId: {
                    studentId,
                    examId
                }
            }
        });

        if (!studentExam) {
            return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
        }

        // If already submitted, don't kick
        if (studentExam.status === 'SUBMITTED' || studentExam.status === 'GRADED') {
            return NextResponse.json({ kicked: false, reason: 'already_submitted' });
        }

        // Check if session matches - if not, this session is invalid (kicked)
        const currentSessionId = (studentExam as any).sessionId;
        if (currentSessionId && currentSessionId !== sessionId) {
            return NextResponse.json({
                kicked: true,
                reason: 'session_replaced',
                message: 'Another session is active for this exam'
            });
        }

        // Session is valid
        return NextResponse.json({ kicked: false });

    } catch (error) {
        console.error('Error processing heartbeat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
