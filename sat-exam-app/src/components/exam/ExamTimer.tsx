
'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
    durationMinutes: number;
    timeSpentSeconds: number; // Added
    onExpire: () => void;
    onTick?: (remaining: number) => void; // Added
}

export default function ExamTimer({ durationMinutes, timeSpentSeconds, onExpire, onTick }: ExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        const totalDuration = durationMinutes * 60;
        let currentRemaining = totalDuration - timeSpentSeconds;

        if (currentRemaining <= 0) {
            setTimeLeft(0);
            onExpire();
            return;
        }

        setTimeLeft(currentRemaining);

        const timer = setInterval(() => {
            currentRemaining -= 1;

            if (currentRemaining <= 0) {
                setTimeLeft(0);
                clearInterval(timer);
                onExpire();
            } else {
                setTimeLeft(currentRemaining);
                if (onTick) onTick(currentRemaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [durationMinutes, timeSpentSeconds]);

    if (timeLeft === null) return null;

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const isUrgent = timeLeft < 300; // Less than 5 mins

    return (
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg border ${isUrgent ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-cb-blue border-gray-200'
            }`}>
            <Clock size={20} />
            <span>
                {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
                {minutes.toString().padStart(2, '0')}:
                {seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
