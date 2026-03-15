import React from 'react';
import { notFound } from 'next/navigation';

const APP_METADATA: Record<string, { label: string }> = {
    'readme': { label: 'README.md' },
    'projects': { label: 'Projects' },
    'settings': { label: 'Settings' },
    'gallery': { label: 'Gallery' }
};

export default async function AppStandalonePage({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = await params;
    if (!APP_METADATA[appId]) {
        notFound();
    }

    const app = APP_METADATA[appId];

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-50 text-gray-800">
            <div className="w-full max-w-2xl p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold mb-4 border-b pb-2">{app.label}</h1>
                <div className="flex items-center justify-center min-h-[300px] text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                    <p>Contenido de prueba standalone para: <strong>{app.label}</strong></p>
                </div>
            </div>
            <div className="mt-8 text-sm text-gray-400">
                Opened via J.OS Menú contextual
            </div>
        </div>
    );
}
