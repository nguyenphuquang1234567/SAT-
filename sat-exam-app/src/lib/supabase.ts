import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Service role client - for server-side operations (uploads, admin tasks)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Bucket name for exam PDFs (matching user's bucket name)
export const EXAM_PDF_BUCKET = 'exam pdfs';

/**
 * Upload a PDF file to Supabase Storage
 * @param file - The PDF file buffer
 * @param examId - The exam ID for organizing files
 * @param filename - Original filename
 * @returns The public URL of the uploaded file
 */
export async function uploadExamPdf(
    file: Buffer,
    examId: string,
    filename: string
): Promise<{ url: string; path: string }> {
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${examId}/${Date.now()}_${safeName}`;

    const { data, error } = await supabaseAdmin.storage
        .from(EXAM_PDF_BUCKET)
        .upload(filePath, file, {
            contentType: 'application/pdf',
            upsert: false,
        });

    if (error) {
        throw new Error(`Failed to upload PDF: ${error.message}`);
    }

    const { data: urlData } = supabaseAdmin.storage
        .from(EXAM_PDF_BUCKET)
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
    };
}


