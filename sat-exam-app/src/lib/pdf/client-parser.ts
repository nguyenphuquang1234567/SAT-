export interface ParsedQuestion {
    questionNumber: number;
    rawNumber: number;
    section: string;
    correctAnswer: string;
}

export async function parsePdfOnClient(file: File): Promise<ParsedQuestion[]> {
    // unpdf is already in package.json and more compatible with Next.js
    const { extractText } = await import('unpdf');

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // extractText handles the worker and loading internally
    const { text } = await extractText(uint8Array);

    const fullText = Array.isArray(text) ? text.join('\n') : String(text);

    // Logic xử lý giống hệt như server
    return processExtractedText(fullText);
}

function processExtractedText(text: string): ParsedQuestion[] {
    // Clean text: remove common headers/footers
    const cleanedText = text.replace(/Page \d+ of \d+|Unauthorized copying/gi, '');
    const foundAnswers = new Map<string, string>();

    // HEURISTIC 1: Check for a dedicated "Answer Key"
    const answerKeySection = cleanedText.split(/Answer Key|Correct Answers/i).pop() || "";
    if (answerKeySection.length < cleanedText.length * 0.4) {
        const tablePattern = /(\d+)\s+([A-D])(?:\s|$)/g;
        let m;
        while ((m = tablePattern.exec(answerKeySection)) !== null) {
            const num = parseInt(m[1]);
            if (num > 0 && num <= 100) {
                foundAnswers.set(`Exam-${num}`, m[2].toUpperCase());
            }
        }
    }

    // HEURISTIC 2: Module-Aware Count Detection
    const modulePattern = /Module\s+(\d+)\s+([a-zA-Z\s]{0,30})?(\d+)\s+QUESTIONS/gi;
    let moduleMatch;

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

    // Fallback if nothing found
    if (foundAnswers.size === 0) {
        const simpleCountMatch = cleanedText.match(/(\d+)\s+QUESTIONS/i);
        if (simpleCountMatch) {
            const count = parseInt(simpleCountMatch[1]);
            for (let i = 1; i <= count; i++) {
                foundAnswers.set(`Exam-1-${i}`, "B");
            }
        }
    }

    // Convert to final format
    const results: ParsedQuestion[] = [];
    let globalIdx = 1;

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

    return results;
}
