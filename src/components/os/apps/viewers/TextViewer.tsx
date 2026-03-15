'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TextViewerProps {
    title: string;
    initialContent?: string;
}

export default function TextViewer({ title, initialContent }: TextViewerProps) {
    const { t } = useLanguage();

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
                            {t('text_viewer.p1')}
                        </p>
                        <p className="mb-6 leading-relaxed">
                            {t('text_viewer.p2')}
                        </p>
                        <p className="mb-6 leading-relaxed">
                            {t('text_viewer.p3')}
                        </p>
                        <p className="mb-6 leading-relaxed">
                            {t('text_viewer.p4')}
                        </p>
                        <p className="mb-6 leading-relaxed">
                            {t('text_viewer.p5')}
                        </p>
                        <p className="mb-6 leading-relaxed">
                            {t('text_viewer.p6')}
                        </p>
                    </>
                )}

            </div>
        </div>
    );
}
