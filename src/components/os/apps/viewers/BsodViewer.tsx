'use client';

import React, { useEffect, useState } from 'react';

interface BsodViewerProps {
    title: string;
}

export default function BsodViewer({ title }: BsodViewerProps) {
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 150);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`w-full h-full bg-blue-800 text-white font-mono p-12 flex flex-col justify-center items-center select-none cursor-none ${glitch ? 'translate-x-[2px] -translate-y-[2px] hue-rotate-15' : ''}`}>
            <div className="max-w-3xl w-full text-lg">
                <div className="bg-os-panel text-blue-800 inline-block px-4 py-1 mb-8 font-bold text-xl">
                    J.OS
                </div>

                <p className="mb-6">
                    Ha ocurrido una excepción fatal 0E en 0028:C0011E36 en VXD VMM(01) +
                    00010E36. La aplicación actual será terminada.
                </p>

                <ul className="list-disc pl-8 mb-8 space-y-2">
                    <li>Presiona cualquier tecla para terminar la aplicación actual.</li>
                    <li>Presiona CTRL+ALT+SUPR nuevamente para reiniciar tu computadora. Perderás cualquier información no guardada en todas las aplicaciones.</li>
                </ul>

                <p className="mb-8">
                    Error al leer el archivo <strong>{title}</strong>. El archivo está corrupto o es ilegible.
                </p>

                <p className="text-center mt-12 animate-pulse">
                    Presiona cualquier tecla para continuar _
                </p>
            </div>
        </div>
    );
}
