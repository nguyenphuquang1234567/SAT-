'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFullscreenLockReturn {
    isFullscreen: boolean;
    enterFullscreen: () => Promise<boolean>;
    exitFullscreen: () => Promise<void>;
    isSupported: boolean;
}

export function useFullscreenLock(): UseFullscreenLockReturn {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    // Check if Fullscreen API is supported
    useEffect(() => {
        const doc = document as any;
        const supported = !!(
            doc.fullscreenEnabled ||
            doc.webkitFullscreenEnabled ||
            doc.mozFullScreenEnabled ||
            doc.msFullscreenEnabled
        );
        setIsSupported(supported);

        // Check initial fullscreen state
        const fullscreenElement =
            doc.fullscreenElement ||
            doc.webkitFullscreenElement ||
            doc.mozFullScreenElement ||
            doc.msFullscreenElement;

        setIsFullscreen(!!fullscreenElement);
    }, []);

    // Listen to fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            const doc = document as any;
            const fullscreenElement =
                doc.fullscreenElement ||
                doc.webkitFullscreenElement ||
                doc.mozFullScreenElement ||
                doc.msFullscreenElement;

            setIsFullscreen(!!fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const enterFullscreen = useCallback(async (): Promise<boolean> => {
        const elem = document.documentElement as any;

        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            } else {
                console.warn('Fullscreen API is not supported');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
            return false;
        }
    }, []);

    const exitFullscreen = useCallback(async (): Promise<void> => {
        const doc = document as any;

        try {
            if (doc.exitFullscreen) {
                await doc.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                await doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                await doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                await doc.msExitFullscreen();
            }
        } catch (error) {
            console.error('Failed to exit fullscreen:', error);
        }
    }, []);

    return {
        isFullscreen,
        enterFullscreen,
        exitFullscreen,
        isSupported
    };
}
