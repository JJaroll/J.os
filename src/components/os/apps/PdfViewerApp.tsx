import React from 'react';

interface PdfViewerProps {
    pdfUrl?: string;
    title?: string;
}

export default function PdfViewerApp({
    pdfUrl = '/pdf-sample_0.pdf',
    title = 'Visor de Documentos'
}: PdfViewerProps) {
    return (
        <div className="w-full h-full bg-os-panel flex flex-col items-center justify-center p-0 m-0">
            <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={title}
            />
        </div>
    );
}