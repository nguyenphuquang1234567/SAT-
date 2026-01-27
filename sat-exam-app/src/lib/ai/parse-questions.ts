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
            max_tokens: 16000, // Increased for longer exams
            response_format: { type: 'json_object' }, // Force JSON output
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.error('OpenAI returned empty response');
            return [];
        }

        // Clean the response - remove markdown code blocks if present
        let cleanedContent = content.trim();

        // Remove markdown code blocks
        cleanedContent = cleanedContent.replace(/^```json\s*/i, '');
        cleanedContent = cleanedContent.replace(/^```\s*/i, '');
        cleanedContent = cleanedContent.replace(/\s*```$/i, '');
        cleanedContent = cleanedContent.trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanedContent);
        } catch (jsonError) {
            console.error('JSON parse error, attempting to fix...', jsonError);
            // Try to extract JSON array from response
            const arrayMatch = cleanedContent.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                parsed = JSON.parse(arrayMatch[0]);
            } else {
                throw jsonError;
            }
        }

        // Handle both array and object with questions field
        let questionsArray = parsed;
        if (!Array.isArray(parsed)) {
            // If it's an object with a 'questions' field, use that
            if (parsed.questions && Array.isArray(parsed.questions)) {
                questionsArray = parsed.questions;
            } else {
                console.error('OpenAI response is not an array and has no questions field');
                return [];
            }
        }

        // Validate each question
        const validQuestions: ParsedQuestion[] = questionsArray.filter((q: any) => {
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
