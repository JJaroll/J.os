'use client';

import { useCallback, useRef, useEffect } from 'react';

const NOTES = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
};

export function useGameSound() {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            try {
                // @ts-expect-error - webkitAudioContext para Safari antiguos
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new AudioContextClass();
            } catch (e) {
                console.warn("Web Audio API not supported in this browser", e);
            }
        }
        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, durationMs: number = 100, vol: number = 0.1, freqSlide?: number) => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            if (freqSlide) {
                osc.frequency.exponentialRampToValueAtTime(freqSlide, ctx.currentTime + (durationMs / 1000));
            }

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + (durationMs / 1000));
        } catch (e) {
            console.error("Error playing tone", e);
        }
    }, [initAudio]);

    const playPing = useCallback(() => {
        playTone(NOTES.E5, 'square', 100, 0.05);
    }, [playTone]);

    const playPong = useCallback(() => {
        playTone(NOTES.C4, 'square', 100, 0.05);
    }, [playTone]);

    const playCoin = useCallback(() => {
        playTone(NOTES.B4, 'sine', 80, 0.08, NOTES.E5);
    }, [playTone]);

    const playJump = useCallback(() => {
        playTone(150, 'square', 150, 0.05, 400);
    }, [playTone]);
    const playCrash = useCallback(() => {
        playTone(100, 'sawtooth', 300, 0.1, 40);
        setTimeout(() => playTone(80, 'square', 400, 0.1, 20), 50);
        setTimeout(() => playTone(80, 'square', 400, 0.1, 20), 50);
    }, [playTone]);

    const playBlip = useCallback(() => {
        playTone(300, 'sine', 50, 0.03);
    }, [playTone]);

    const playWin = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        playTone(NOTES.C5, 'square', 150, 0.05, undefined);
        setTimeout(() => playTone(NOTES.E5, 'square', 150, 0.05, undefined), 100);
        setTimeout(() => playTone(NOTES.G5, 'square', 400, 0.05, undefined), 200);
    }, [initAudio, playTone]);

    return {
        initAudio,
        playPing,
        playPong,
        playCoin,
        playJump,
        playCrash,
        playBlip,
        playWin
    };
}
