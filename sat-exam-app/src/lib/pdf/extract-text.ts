/**
 * PDF Text Extraction using pdfjs-dist
 * Works in Node.js environment (Next.js API routes)
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs
// @ts-expect-error - pdfjs types don't perfectly match
pdfjsLib.GlobalWorkerOptions.workerSrc = false; // Disable worker for Node.js

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
        // Convert Buffer to Uint8Array for pdfjs
        const uint8Array = new Uint8Array(pdfBuffer);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true,
        });

        const pdfDocument = await loadingTask.promise;
        const pageCount = pdfDocument.numPages;

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine text items with proper spacing
            const pageText = textContent.items
                .map((item) => {
                    if ('str' in item) {
                        return item.str;
                    }
                    return '';
                })
                .join(' ');

            fullText += pageText + '\n\n';
        }

        return {
            text: fullText.trim(),
            pageCount,
        };
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(
            `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
