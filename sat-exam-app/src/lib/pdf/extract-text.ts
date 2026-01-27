/**
 * PDF Text Extraction using unpdf
 * Optimized for Node.js/Next.js server environment
 */

import { extractText } from 'unpdf';

interface ExtractResult {
    text: string;
    pageCount: number;
}

/**
 * Extract text content from a PDF buffer
 * @param pdfBuffer - The PDF file as a Buffer
 * @returns Object containing extracted text and page count
 */
export async function extractTextFromPdf(
    pdfBuffer: Buffer
): Promise<ExtractResult> {
    try {
        // Convert Buffer to Uint8Array
        const uint8Array = new Uint8Array(pdfBuffer);

        // Extract text using unpdf
        const { text, totalPages } = await extractText(uint8Array);

        // text is an array of strings (one per page), join them
        const fullText = Array.isArray(text) ? text.join('\n\n') : String(text);

        return {
            text: fullText.trim(),
            pageCount: totalPages,
        };
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(
            `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
