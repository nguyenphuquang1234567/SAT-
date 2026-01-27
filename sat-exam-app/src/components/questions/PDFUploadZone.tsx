'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface PDFUploadZoneProps {
    examId: string;
    onParseComplete: (questions: ParsedQuestion[], pdfUrl?: string) => void;
    onError: (error: string) => void;
}


export interface ParsedQuestion {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export default function PDFUploadZone({
    examId,
    onParseComplete,
    onError,
}: PDFUploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleUpload = useCallback(
        async (file: File) => {
            if (file.type !== 'application/pdf') {
                onError('Vui lòng chọn file PDF');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                onError('File không được vượt quá 10MB');
                return;
            }

            setFileName(file.name);
            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append('pdf', file);

                const response = await fetch(`/api/exams/${examId}/parse-pdf`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Upload failed');
                }

                onParseComplete(data.questions, data.pdfUrl);

            } catch (error) {
                onError(error instanceof Error ? error.message : 'Upload failed');
            } finally {
                setIsUploading(false);
            }
        },
        [examId, onParseComplete, onError]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleUpload(file);
            }
        },
        [handleUpload]
    );

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-3 border-dashed rounded-none p-12 text-center
        transition-all duration-300 cursor-pointer
        ${isDragOver
                    ? 'border-[#FFCC00] bg-[#FFCC00]/10'
                    : 'border-[#003366]/30 bg-[#003366]/5 hover:border-[#003366] hover:bg-[#003366]/10'
                }
        ${isUploading ? 'pointer-events-none opacity-70' : ''}
      `}
        >
            <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-[#003366] animate-spin" />
                    <div>
                        <p className="text-xl font-bold text-[#003366]">
                            AI đang phân tích đề thi...
                        </p>
                        <p className="text-sm text-[#003366]/60 mt-2">
                            {fileName}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-none bg-[#003366] flex items-center justify-center">
                        {isDragOver ? (
                            <FileText className="w-10 h-10 text-[#FFCC00]" />
                        ) : (
                            <Upload className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-[#003366]">
                            {isDragOver ? 'Thả file tại đây' : 'Upload PDF Đề Thi'}
                        </p>
                        <p className="text-sm text-[#003366]/60 mt-2">
                            Kéo thả hoặc click để chọn file PDF (tối đa 10MB)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#003366]/50 mt-4">
                        <span className="px-2 py-1 bg-[#003366]/10 rounded-none font-mono">
                            AI POWERED
                        </span>
                        <span>Tự động trích xuất câu hỏi từ PDF</span>
                    </div>
                </div>
            )}
        </div>
    );
}
