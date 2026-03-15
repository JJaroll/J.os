'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PdfViewerProps {
    title: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PdfViewer({ title }: PdfViewerProps) {
    const { t } = useLanguage();

    return (
        <div className="w-full h-full bg-os-bg flex flex-col font-sans select-none overflow-hidden text-os-panel-text">
            <div className="h-12 bg-os-panel border-b border-os-border flex items-center px-4 justify-between flex-shrink-0">
                <div className="flex gap-4 items-center text-os-panel-text/70">
                    <span className="font-semibold text-lg hover:bg-os-hover px-2 rounded cursor-pointer">↺</span>
                    <span className="font-semibold text-lg hover:bg-os-hover px-2 rounded cursor-pointer" style={{ transform: 'scaleX(-1)' }}>↺</span>
                    <div className="border border-os-border bg-os-panel rounded flex items-center px-2 py-1 cursor-pointer">
                        <span className="text-sm">{t('pdf_viewer.zoom')}</span>
                        <span className="ml-2 text-xs">▼</span>
                    </div>
                </div>
                <div className="font-bold text-lg bg-os-bg px-4 py-1 rounded">{t('pdf_viewer.page_indicator')}</div>
                <div className="flex gap-2 items-center">
                    <button className="bg-orange-500 text-white px-4 py-1.5 rounded-md font-bold text-sm hover:bg-orange-600">{t('pdf_viewer.share')}</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-os-bg">
                <div className="bg-os-panel shadow-xl max-w-3xl w-full p-16 min-h-[900px] flex flex-col">
                    <h1 className="text-3xl font-extrabold mb-12 text-os-panel-text leading-tight">
                        {t('pdf_viewer.title')}
                    </h1>

                    <div className="flex gap-8 relative">
                        <div className="flex-1 text-sm text-os-panel-text/90 leading-relaxed font-serif text-justify">
                            <span className="float-left text-6xl leading-[50px] font-bold mr-2">{t('pdf_viewer.dropcap')}</span>
                            {t('pdf_viewer.p1_start')} <br /><br />
                            {t('pdf_viewer.p2')}
                        </div>

                        <div className="w-64 h-64 rounded-full relative flex-shrink-0"
                            style={{
                                background: 'conic-gradient(#0ea5e9 0% 35%, #22c55e 35% 60%, #9ca3af 60% 71%, #eab308 71% 81%, #ef4444 81% 89%, #d946ef 89% 96%, #8b5cf6 96% 100%)'
                            }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
