import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractTextFromPdf } from '@/lib/pdf/extract-text';
import { parseQuestionsFromText } from '@/lib/ai/parse-questions';
import { uploadExamPdf } from '@/lib/supabase';

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

        // Get the PDF file from form data
        const formData = await request.formData();
        const file = formData.get('pdf') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No PDF file provided' },
                { status: 400 }
            );
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'File must be a PDF' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage (optional - for record keeping)
        let pdfUrl: string | null = null;
        try {
            const uploadResult = await uploadExamPdf(buffer, examId, file.name);
            pdfUrl = uploadResult.url;
        } catch (uploadError) {
            console.warn('PDF upload to storage failed, continuing with parse:', uploadError);
            // Continue without storage - parsing is more important
        }

        // Extract text from PDF
        const { text, pageCount } = await extractTextFromPdf(buffer);

        if (!text.trim()) {
            return NextResponse.json(
                { error: 'No text could be extracted from PDF' },
                { status: 400 }
            );
        }

        // Parse questions using AI
        const questions = await parseQuestionsFromText(text);

        return NextResponse.json({
            success: true,
            questions,
            metadata: {
                pageCount,
                textLength: text.length,
                questionsFound: questions.length,
                pdfUrl,
            },
        });
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to parse PDF' },
            { status: 500 }
        );
    }
}
