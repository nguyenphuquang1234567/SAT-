/**
 * Simple PDF Parser - Extract question count and correct answers
 * Uses text extraction to identify questions and answer keys
 */

import { extractText } from 'unpdf';

export interface ParsedQuestion {
    questionNumber: number;
    rawNumber: number; // The number shown in PDF (e.g. 1)
    section: string;   // "Reading/Writing" or "Math"
    correctAnswer: string;
}

export async function parsePdfQuestions(
    pdfBuffer: Buffer
): Promise<ParsedQuestion[]> {
    try {
        const uint8Array = new Uint8Array(pdfBuffer);
        const { text } = await extractText(uint8Array);

        const fullText = Array.isArray(text) ? text.join('\n') : String(text);

        // Clean text: remove common headers/footers
        const cleanedText = fullText.replace(/Page \d+ of \d+|Unauthorized copying/gi, '');


        const foundAnswers = new Map<string, string>(); // Key: "Section-Num"

        // HEURISTIC 1: Check for a dedicated "Answer Key" table/section
        const answerKeySection = cleanedText.split(/Answer Key|Correct Answers/i).pop() || "";
        if (answerKeySection.length < cleanedText.length * 0.3) {
            const tablePattern = /(\d+)\s+([A-D])(?:\s|$)/g;
            let m;
            while ((m = tablePattern.exec(answerKeySection)) !== null) {
                const num = parseInt(m[1]);
                if (num > 0 && num <= 100) {
                    foundAnswers.set(`Exam-${num}`, m[2].toUpperCase());
                }
            }
        }

        // HEURISTIC 2: Block-based detection (Like the sample PDF)
        const mathPos = cleanedText.search(/Math/i);
        const questionRegex = /question\s+(\d+)/gi;
        const keyRegex = /Key(?:s)?\s+([^\n\s]+)/gi;

        const questions: { num: number; pos: number; section: string }[] = [];
        let m;
        while ((m = questionRegex.exec(cleanedText)) !== null) {
            const pos = m.index;
            let section = (mathPos !== -1 && pos >= mathPos) ? "Math" : "Reading/Writing";
            questions.push({ num: parseInt(m[1]), pos, section });
        }

        const keys: { val: string; pos: number }[] = [];
        while ((m = keyRegex.exec(cleanedText)) !== null) {
            keys.push({ val: m[1].trim(), pos: m.index });
        }

        questions.forEach((q) => {
            const nextQAnyPos = cleanedText.indexOf("question", q.pos + 10);
            let foundKey = keys.find(k => k.pos > q.pos && (nextQAnyPos === -1 || k.pos < nextQAnyPos));
            if (foundKey) {
                foundAnswers.set(`${q.section}-${q.num}`, foundKey.val);
            }
        });

        // HEURISTIC 3: Module-Aware Count Detection (For Test 9 and similar)
        const modulePattern = /Module\s+(\d+)\s+([a-zA-Z\s]{0,30})?(\d+)\s+QUESTIONS/gi;
        let moduleMatch;
        let tempGlobalIdx = 1;

        // If we haven't found a dedicated Answer Key, use module markers to build the structure
        if (foundAnswers.size < 10) {
            while ((moduleMatch = modulePattern.exec(cleanedText)) !== null) {
                const moduleNum = moduleMatch[1];
                const sectionNameInput = (moduleMatch[2] || "").includes("Math") ? "Math" : "Reading/Writing";
                const qCount = parseInt(moduleMatch[3]);
                const sectionLabel = `${sectionNameInput} M${moduleNum}`;

                for (let i = 1; i <= qCount; i++) {
                    foundAnswers.set(`${sectionLabel}-${i}`, "B"); // Default to B
                }
            }
        }

        // If after all heuristics we still have nothing (e.g. non-standard headers), 
        // fallback to a simple 1-N sequence if any "QUESTIONS" was found
        if (foundAnswers.size === 0) {
            const simpleCount = (cleanedText.match(/(\d+)\s+QUESTIONS/i) || [])[1];
            if (simpleCount) {
                for (let i = 1; i <= parseInt(simpleCount); i++) {
                    foundAnswers.set(`Exam-1-${i}`, "B");
                }
            }
        }

        // Convert Map to final array with section awareness
        const results: ParsedQuestion[] = [];
        let globalIdx = 1;

        // Sort sections logically: RW M1, RW M2, Math M1, Math M2
        const sortedSectionKeys = Array.from(foundAnswers.keys())
            .map(k => k.split('-')[0])
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => {
                if (a.includes("Reading") && b.includes("Math")) return -1;
                if (a.includes("Math") && b.includes("Reading")) return 1;
                return a.localeCompare(b);
            });

        sortedSectionKeys.forEach(secName => {
            const secQuestions = Array.from(foundAnswers.entries())
                .filter(([k]) => k.startsWith(secName))
                .map(([k, v]) => ({ num: parseInt(k.split('-')[1]), val: v }))
                .sort((a, b) => a.num - b.num);

            secQuestions.forEach(q => {
                results.push({
                    questionNumber: globalIdx++,
                    rawNumber: q.num,
                    section: secName,
                    correctAnswer: q.val
                });
            });
        });


        console.log(`Successfully parsed ${results.length} questions.`);
        return results;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a Markdown preview of the answer key
 */
export function generateAnswerKeyMarkdown(questions: ParsedQuestion[]): string {
    if (questions.length === 0) return "> Không tìm thấy đáp án nào trong file PDF.";

    let md = "# 📋 BẢN NHÁP ĐÁP ÁN (DRAFT)\n";
    md += "*Gợi ý: Nếu không tìm thấy đáp án trong PDF, hệ thống sẽ mặc định chọn B.*\n\n";
    md += "| # | Section | Ques | Đáp án |\n";
    md += "| :--- | :--- | :--- | :--- |\n";

    questions.forEach(q => {
        md += `| ${q.questionNumber} | ${q.section} | ${q.rawNumber} | **${q.correctAnswer}** |\n`;
    });

    md += `\n**Tổng cộng:** ${questions.length} câu hỏi.`;
    return md;
}
