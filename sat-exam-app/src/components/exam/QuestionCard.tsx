
'use client';

import Image from 'next/image';

interface Answer {
    id: string;
    text: string;
    choice: string;
}

interface Question {
    id: string;
    questionNumber: number;
    imageUrl: string | null;
    section: string;
    answers: Answer[];
}

interface QuestionCardProps {
    question: Question;
    selectedAnswer: string | undefined;
    onSelectAnswer: (choice: string) => void;
}

export default function QuestionCard({ question, selectedAnswer, onSelectAnswer }: QuestionCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">
                    Câu hỏi <span className="text-cb-blue">{question.questionNumber}</span>
                </h2>
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {question.section}
                </span>
            </div>

            {/* Question Image */}
            <div className="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[200px] flex items-center justify-center relative">
                {question.imageUrl ? (
                    <div className="relative w-full h-full min-h-[300px]">
                        {/* We use standard img tag or Next Image with specific handling since width/height might be unknown or variable */}
                        {/* Ideally we use Next Image but allow it to be responsive */}
                        <img
                            src={question.imageUrl}
                            alt={`Question ${question.questionNumber}`}
                            className="w-full h-auto object-contain rounded-lg max-h-[500px]"
                        />
                    </div>
                ) : (
                    <div className="text-gray-400 font-medium italic">Không có hình ảnh cho câu hỏi này.</div>
                )}
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 mb-4">Chọn đáp án:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.answers.map((ans) => (
                        <label
                            key={ans.id}
                            className={`
                                relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${selectedAnswer === ans.choice
                                    ? 'border-cb-blue bg-blue-50/50 shadow-md shadow-blue-900/5'
                                    : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50'
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={ans.choice}
                                checked={selectedAnswer === ans.choice}
                                onChange={() => onSelectAnswer(ans.choice)}
                                className="sr-only"
                            />
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mr-4 transition-colors
                                ${selectedAnswer === ans.choice
                                    ? 'bg-cb-blue text-white'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                }
                            `}>
                                {ans.choice}
                            </div>
                            <span className="font-medium text-gray-700">{ans.text || ''}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
