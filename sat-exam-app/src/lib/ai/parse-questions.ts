import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedQuestion {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

const SYSTEM_PROMPT = `You are an expert at parsing SAT and educational exam questions from raw PDF text.

Your task is to extract each multiple-choice question and return them as a JSON array.

RULES:
1. Each question must have exactly 4 options (A, B, C, D)
2. The correctAnswer field must be exactly 'A', 'B', 'C', or 'D'
3. If the correct answer is not clearly marked, make your best educated guess based on the content
4. Clean up any formatting artifacts from PDF extraction (weird characters, line breaks in wrong places)
5. Keep the original question language (Vietnamese or English)
6. If you cannot find any valid questions, return an empty array []

OUTPUT FORMAT (JSON array):
[
  {
    "content": "The full question text",
    "optionA": "First option text",
    "optionB": "Second option text", 
    "optionC": "Third option text",
    "optionD": "Fourth option text",
    "correctAnswer": "A"
  }
]

Important: Return ONLY the JSON array, no markdown code blocks or explanations.`;

/**
 * Parse raw PDF text and extract structured questions using OpenAI
 * @param rawText - The extracted text from PDF
 * @returns Array of parsed questions
 */
export async function parseQuestionsFromText(
    rawText: string
): Promise<ParsedQuestion[]> {
    if (!rawText.trim()) {
        return [];
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Parse the following exam text and extract all multiple-choice questions:\n\n${rawText}`,
                },
            ],
            temperature: 0.1, // Low temperature for consistent structured output
            max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.error('OpenAI returned empty response');
            return [];
        }

        // Clean the response - remove markdown code blocks if present
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.slice(7);
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.slice(3);
        }
        if (cleanedContent.endsWith('```')) {
            cleanedContent = cleanedContent.slice(0, -3);
        }
        cleanedContent = cleanedContent.trim();

        const parsed = JSON.parse(cleanedContent);

        // Validate the structure
        if (!Array.isArray(parsed)) {
            console.error('OpenAI response is not an array');
            return [];
        }

        // Validate each question
        const validQuestions: ParsedQuestion[] = parsed.filter((q) => {
            return (
                q.content &&
                q.optionA &&
                q.optionB &&
                q.optionC &&
                q.optionD &&
                ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
            );
        });

        return validQuestions;
    } catch (error) {
        console.error('Error parsing questions with OpenAI:', error);
        throw new Error(
            `AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
