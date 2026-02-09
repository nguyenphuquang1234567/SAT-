import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { questions, pdfUrl } = await request.json();

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
        }

        // Logic xử lý preview (tương tự route parse-pdf cũ)
        const { generateAnswerKeyMarkdown } = await import('@/lib/pdf/parse-simple');
        const markdownPreview = generateAnswerKeyMarkdown(questions.map((q: any) => ({
            questionNumber: q.order,
            rawNumber: q.rawNumber,
            section: q.section,
            correctAnswer: q.correctAnswer
        })));

        return NextResponse.json({
            success: true,
            questions,
            markdownPreview,
            pdfUrl
        });
    } catch (error) {
        console.error('Error saving parsed questions:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
