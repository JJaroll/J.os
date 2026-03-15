'use client';

import React from 'react';
import { useOS } from '@/context/OSContext';
import { useLanguage } from '@/context/LanguageContext';
import {
    FileText, Folder as FolderIcon, Video, FileQuestion,
    Calendar, Lock, FileCode, Presentation,
    TerminalSquare
} from 'lucide-react';
import PdfViewer from '@/components/os/apps/viewers/PdfViewer';
import TextViewer from '@/components/os/apps/viewers/TextViewer';
import FolderViewer from '@/components/os/apps/viewers/FolderViewer';
import VideoViewer from '@/components/os/apps/viewers/VideoViewer';
import BsodViewer from '@/components/os/apps/viewers/BsodViewer';

interface TrashItem {
    id: string;
    label: string;
    type: 'pdf' | 'txt' | 'folder' | 'video' | 'doc' | 'canvas' | 'calendar' | 'ga' | 'md' | 'locked-pdf' | 'code' | 'corrupt';
    icon: React.ReactNode;
}

export default function TrashWindow() {
    const { openWindow } = useOS();
    const { t } = useLanguage();

    const RECENTLY_DELETED: TrashItem[] = [
        { id: 'trash-quickcalls', label: t('trash.file_quickcalls'), type: 'txt', icon: <FileText size={36} className="text-gray-500" /> },
        { id: 'trash-employee', label: t('trash.folder_employee'), type: 'folder', icon: <FolderIcon size={36} className="text-os-folder fill-current" /> },
        { id: 'trash-spicy', label: t('trash.video_spicy'), type: 'video', icon: <Video size={36} className="text-red-600" /> },
    ];

    const ARCHIVED: TrashItem[] = [
        { id: 'trash-ga3', label: 'GA3', type: 'corrupt', icon: <FileQuestion size={36} className="text-yellow-600" /> },
    ];

    const handleItemDoubleClick = (item: TrashItem) => {
        let content: React.ReactNode;
        const windowProps = { size: { width: 700, height: 500 } };

        switch (item.id) {
            case 'trash-whitepaper':
                content = <PdfViewer title={item.label} />;
                windowProps.size = { width: 800, height: 900 };
                break;
            case 'trash-quickcalls':
                content = <TextViewer title={item.label} />;
                windowProps.size = { width: 600, height: 400 };
                break;
            case 'trash-employee':
                content = <FolderViewer title={item.label} />;
                break;
            case 'trash-spicy':
                content = <VideoViewer title={item.label} />;
                break;
            case 'trash-ga3':
                window.location.href = '/bsod.html';
                return;
            default:
                // Respaldo para archivos sin visor especializado
                content = (
                    <div className="flex items-center justify-center h-full p-8 text-center text-os-text/60 bg-os-bg transition-colors">
                        <div className="flex flex-col items-center">
                            {item.icon}
                            <p className="mt-4 font-semibold text-os-text">{t('trash.error_title')}</p>
                            <p className="text-sm mt-2">{t('trash.error_desc')}</p>
                        </div>
                    </div>
                );
                windowProps.size = { width: 400, height: 300 };
        }

        openWindow(`trash-viewer-${item.id}`, `${item.label}`, content, windowProps);
    };

    const renderItem = (item: TrashItem) => (
        <div
            key={item.id}
            className="flex flex-col items-center w-24 p-2 cursor-pointer hover:bg-os-accent/20 rounded-md transition-colors"
            onDoubleClick={() => handleItemDoubleClick(item)}
        >
            <div className="flex items-center justify-center w-14 h-14 mb-1 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                {React.cloneElement(item.icon as React.ReactElement<any>, { strokeWidth: 1.5, size: 40 })}
            </div>
            <span className="text-xs text-center text-os-text break-words line-clamp-3 w-full transition-colors">
                {item.label}
            </span>
        </div>
    );

    return (
        <div className="flex w-full h-full bg-os-panel text-os-panel-text font-sans text-sm select-none @container transition-colors">

            {/* Barra lateral izquierda */}
            <div className="w-[200px] flex-shrink-0 border-r border-os-border flex flex-col p-4 hidden @4xl:flex transition-colors">
                <div className="bg-os-panel border border-os-border rounded p-3 shadow-sm transition-colors">
                    <h3 className="font-bold flex justify-between items-center text-os-panel-text mb-2 pb-2 border-b border-gray-100 dark:border-white/10 transition-colors">
                        {t('trash.title')}
                    </h3>
                    <p className="text-os-text/80 text-xs leading-relaxed transition-colors">
                        {t('trash.archive_info')}
                    </p>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 overflow-y-auto bg-os-bg p-6 relative transition-colors shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]">

                {/* Recientes */}
                <div className="mb-10">
                    <h2 className="flex items-center text-sm font-bold text-os-panel-text mb-4 pb-2 border-b border-os-border transition-colors">
                        {t('trash.recent').replace('{count}', RECENTLY_DELETED.length.toString())}
                    </h2>
                    <div className="flex flex-wrap gap-4 items-start">
                        {RECENTLY_DELETED.map(renderItem)}
                    </div>
                </div>

                {/* Archivo */}
                <div>
                    <h2 className="flex items-center text-sm font-bold text-os-panel-text mb-4 pb-2 border-b border-os-border transition-colors">
                        {t('trash.archived').replace('{count}', ARCHIVED.length.toString())}
                    </h2>
                    <div className="flex flex-wrap gap-4 items-start">
                        {ARCHIVED.map(renderItem)}
                    </div>
                </div>

            </div>
        </div>
    );
}
