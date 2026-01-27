import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadExamPdf } from '@/lib/supabase';

interface ParsedQuestion {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string; // Changed from 'A' | 'B' | 'C' | 'D' to string to support grid-ins
    points: number;
    order: number;
    metadata?: {
        extractionMethod: string;
        pdfUrl: string | null;
    };
}

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

        // Upload PDF to Supabase Storage (optional)
        let pdfUrl: string | null = null;
        try {
            const uploadResult = await uploadExamPdf(buffer, examId, file.name);
            pdfUrl = uploadResult.url;
        } catch (uploadError) {
            console.warn('PDF upload to storage failed, continuing with parse:', uploadError);
        }

        // Parse PDF to extract question numbers and correct answers
        console.log('Parsing PDF for questions and answers...');
        const { parsePdfQuestions, generateAnswerKeyMarkdown } = await import('@/lib/pdf/parse-simple');
        const parsedQuestions = await parsePdfQuestions(buffer);
        const markdownPreview = generateAnswerKeyMarkdown(parsedQuestions);

        console.log(`Found ${parsedQuestions.length} questions`);

        // Create simple question entries
        const allQuestions = parsedQuestions.map((q) => ({
            content: `[${q.section} Q${q.rawNumber}]`,
            optionA: 'A',
            optionB: 'B',
            optionC: 'C',
            optionD: 'D',
            correctAnswer: q.correctAnswer,
            points: 1,
            order: q.questionNumber,
            rawNumber: q.rawNumber,
            section: q.section,
        }));


        return NextResponse.json({
            success: true,
            questions: allQuestions,
            markdownPreview,
            message: `Successfully parsed ${allQuestions.length} questions`,
            questionCount: allQuestions.length,
            pdfUrl,
        });
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to parse PDF',
            },
            { status: 500 }
        );
    }
}
