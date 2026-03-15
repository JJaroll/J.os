'use client';

import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
    onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
    const [bootStep, setBootStep] = useState<'bios' | 'splash' | 'done'>('bios');
    const [biosLines, setBiosLines] = useState<string[]>([]);
    const [showAscii, setShowAscii] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const opacityRef = useRef(1);

    useEffect(() => {
        const hasBooted = sessionStorage.getItem('hasBooted');
        if (hasBooted === 'true') {
            setBootStep('done');
            onComplete();
        }
    }, [onComplete]);

    useEffect(() => {
        if (bootStep !== 'bios') return;

        const linesToPrint = [
            "J.OS BIOS (C) 2026 Jarol Espinoza Inc.",
            "",
            "Checking RAM... 8192MB OK",
            "",
            "Loading Next.js Kernel... OK",
            "",
            "Mounting Virtual File System... OK",
            "",
            "Initializing Tailwind CSS Graphics... OK",
            "",
            "Connecting to YouTube Audio Daemon... OK"
        ];

        let currentIndex = 0;
        let timeoutId: NodeJS.Timeout;

        const printNextLine = () => {
            if (currentIndex < linesToPrint.length) {
                setBiosLines(prev => [...prev, linesToPrint[currentIndex]]);
                currentIndex++;
                const delay = linesToPrint[currentIndex - 1] === "" ? 100 : Math.floor(Math.random() * 500) + 300;
                timeoutId = setTimeout(printNextLine, delay);
            } else {
                timeoutId = setTimeout(() => {
                    setShowAscii(true);
                }, 500);
            }
        };

        timeoutId = setTimeout(printNextLine, 500);

        return () => clearTimeout(timeoutId);
    }, [bootStep]);

    const handleBootAction = () => {
        if (bootStep === 'bios' && showAscii) {
            setBootStep('splash');
        }
    };

    useEffect(() => {
        if (bootStep !== 'splash') return;

        try {
            const audio = new Audio('/jos-startup.wav');
            audio.play().catch(e => console.log('Autoplay de audio bloqueado o archivo no encontrado', e));
        } catch (error) {
            console.log('Audio error:', error);
        }

        const timeoutId = setTimeout(() => {
            sessionStorage.setItem('hasBooted', 'true');
            setIsFadingOut(true);

            setTimeout(() => {
                setBootStep('done');
                onComplete();
            }, 800);
        }, 4000);

        return () => clearTimeout(timeoutId);
    }, [bootStep, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleBootAction();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bootStep, showAscii]);

    if (bootStep === 'done') return null;

    if (bootStep === 'splash') {
        return (
            <div
                className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50 flex flex-col items-center justify-center transition-opacity duration-[800ms] ease-in-out"
                style={{ opacity: isFadingOut ? 0 : 1 }}
            >
                <img
                    src="/logo.png"
                    alt="J.OS Logo"
                    className="w-64 h-64 object-contain mb-12 drop-shadow-[0_0_80px_rgba(255,255,255,0.3)]"
                />

                <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full origin-left animate-[progress_4s_ease-in-out_forwards]" />
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes progress {
                        0% { transform: scaleX(0); }
                        20% { transform: scaleX(0.2); }
                        40% { transform: scaleX(0.4); }
                        60% { transform: scaleX(0.6); }
                        80% { transform: scaleX(0.8); }
                        100% { transform: scaleX(1); }
                    }
                `}} />
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black z-50 p-6 text-green-500 overflow-hidden cursor-pointer selection:bg-green-900"
            style={{ fontFamily: 'var(--font-vt323), monospace', textShadow: '0 0 2px rgba(34, 197, 94, 0.5)' }}
            onClick={handleBootAction}
        >
            <div className="max-w-4xl mx-auto flex flex-col h-full justify-start text-xl sm:text-3xl leading-relaxed tracking-wider">
                {biosLines.map((line, index) => (
                    <div key={index} className="opacity-90">{line}</div>
                ))}

                {showAscii && (
                    <div className="mt-8 animate-in fade-in duration-500 text-green-400">
                        <pre
                            className="whitespace-pre overflow-hidden flex justify-center text-[6px] min-[400px]:text-[8px] sm:text-[12px] md:text-[14px] leading-tight font-bold w-full mx-auto"
                            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
                        >
                            {`    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                      ║
    ║      ██╗     ██╗  █████╗ ██████╗  ██████╗ ██╗     ██╗                ║
    ║      ██║     ██║ ██╔══██╗██╔══██╗██╔═══██╗██║     ██║                ║
    ║      ██║     ██║ ███████║██████╔╝██║   ██║██║     ██║                ║
    ║ ██╗  ██║██╗  ██║ ██╔══██║██╔══██╗██║   ██║██║     ██║                ║
    ║ ╚█████╔╝╚█████╔╝ ██║  ██║██║  ██║╚██████╔╝███████╗███████╗           ║
    ║  ╚════╝  ╚════╝  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝           ║
    ║                                                                      ║
    ║   J.OS v1.0.0 - "Dando vida a los píxeles."                          ║
    ║   GitHub: github.com/JJaroll                                         ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝`}
                        </pre>

                        <div className="mt-12 text-center animate-pulse text-white">
                            Press ENTER or Click to boot J.OS...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
