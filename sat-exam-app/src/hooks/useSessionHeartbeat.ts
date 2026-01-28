'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSessionHeartbeatReturn {
    isKicked: boolean;
    sessionId: string | null;
}

export function useSessionHeartbeat(
    examId: string | null,
    sessionId: string | null,
    enabled: boolean = true
): UseSessionHeartbeatReturn {
    const [isKicked, setIsKicked] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const sendHeartbeat = useCallback(async () => {
        if (!examId || !sessionId || isKicked) return;

        try {
            const res = await fetch(`/api/student/exams/${examId}/heartbeat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.kicked) {
                    setIsKicked(true);
                }
            }
        } catch (error) {
            // Silently fail, will retry on next heartbeat
            console.warn('Heartbeat failed:', error);
        }
    }, [examId, sessionId, isKicked]);

    useEffect(() => {
        if (!enabled || !examId || !sessionId) return;

        // Send initial heartbeat
        sendHeartbeat();

        // Set up interval (every 10 seconds)
        intervalRef.current = setInterval(sendHeartbeat, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, examId, sessionId, sendHeartbeat]);

    return {
        isKicked,
        sessionId
    };
}
