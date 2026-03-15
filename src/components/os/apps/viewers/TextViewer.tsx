'use client';

import React from 'react';

interface TextViewerProps {
    title: string;
    initialContent?: string;
}

export default function TextViewer({ title, initialContent }: TextViewerProps) {
    return (
        <div className="flex flex-col w-full h-full bg-os-panel select-text">
            {/* Editor de contenido */}
            <div className="flex-1 overflow-auto p-12 text-os-panel-text text-sm font-sans">
                <h1 className="text-3xl font-bold mb-8 text-os-panel-text">{title}</h1>

                {initialContent ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-os-panel-text/90 leading-relaxed">
                        {initialContent}
                    </pre>
                ) : (
                    <>
                        <p className="mb-6 leading-relaxed">
                            Lo sentimos, esto en realidad no existe porque no te obligamos a hablar con nadie.
                        </p>
                        <p className="mb-6 leading-relaxed">
                            Pero puedes <strong>ver una demostración grabada</strong> (a tu propio ritmo) o <strong>solicitar una demostración personalizada</strong> si lo deseas.
                        </p>
                        <p className="mb-6 leading-relaxed">
                            También podrías disfrutar de <strong>nuestra comparación a fondo</strong> de cómo hacemos las &quot;ventas&quot; en comparación con todos los demás.
                        </p>
                    </>
                )}

            </div>
        </div>
    );
}
