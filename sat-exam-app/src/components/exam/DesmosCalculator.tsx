'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Minus, GripHorizontal } from 'lucide-react';

interface DesmosCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

declare global {
    interface Window {
        Desmos: any;
    }
}

export default function DesmosCalculator({ isOpen, onClose }: DesmosCalculatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const calculatorRef = useRef<any>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Initialize Desmos calculator only once when first opened
    useEffect(() => {
        if (isOpen && containerRef.current && !isInitialized && window.Desmos) {
            calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
                keypad: true,
                expressions: true,
                settingsMenu: false,
                zoomButtons: true,
                expressionsTopbar: true,
                border: false,
            });
            setIsInitialized(true);
        }
    }, [isOpen, isInitialized]);

    // Handle drag start
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.drag-handle')) {
            setIsDragging(true);
            dragOffset.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            };
        }
    };

    // Handle drag move
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Use CSS to hide instead of unmounting to preserve calculator state
    return (
        <div
            className="fixed z-50"
            style={{
                left: position.x,
                top: position.y,
                width: isMinimized ? 280 : 1100,
                height: isMinimized ? 48 : 800,
                display: isOpen ? 'block' : 'none', // Hide instead of unmount
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Window Container */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 h-full flex flex-col">
                {/* Header / Drag Handle */}
                <div className="drag-handle bg-gradient-to-r from-cb-blue to-blue-700 text-white px-4 py-3 flex items-center justify-between cursor-move select-none">
                    <div className="flex items-center gap-2">
                        <GripHorizontal size={16} className="opacity-50" />
                        <span className="font-bold text-sm tracking-wide">Máy tính đồ thị</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(!isMinimized);
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                        >
                            <Minus size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="p-1.5 hover:bg-red-500 rounded-lg transition-colors"
                            title="Đóng"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Calculator Container - Always rendered to preserve state */}
                <div
                    ref={containerRef}
                    className="flex-1 bg-white"
                    style={{
                        minHeight: 450,
                        display: isMinimized ? 'none' : 'block'
                    }}
                />
            </div>
        </div>
    );
}

