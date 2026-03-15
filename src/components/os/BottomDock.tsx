'use client';

import React, { useEffect, useState } from 'react';
import { useOS } from '@/context/OSContext';
import JOSsuiteWindow from './apps/JOSsuiteWindow';
import ReadmeViewerApp from './apps/ReadmeViewerApp';
import DisplayOptionsWindow from './apps/DisplayOptionsWindow';
import ContactWindow from './apps/ContactWindow';
import MusicPlayerWindow from './apps/MusicPlayerWindow';
import { useIsTablet } from '@/hooks/useMediaQuery';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { getDesktopApps, type StrapiDesktopApp } from '@/services/strapi';
import { getIcon } from '@/utils/iconMapper';

interface DockApp {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const ORIGINAL_ICON_COLORS: Record<string, string> = {
    readme: 'text-os-text',
    projects: 'text-os-folder fill-current',
    settings: 'text-os-text',
    gallery: 'text-purple-500',
    terminal: 'text-os-terminal-text',
    contact: 'text-[#d97706]',
    trash: 'text-os-text',
    games: 'text-os-folder',
    browser: 'text-[#3b82f6]',
    music: 'text-blue-500 drop-shadow-md',
};

function strapiAppToDockApp(app: StrapiDesktopApp): DockApp {
    const colorClass = app.iconColor || ORIGINAL_ICON_COLORS[app.appId] || 'text-os-panel-text';

    return {
        id: app.appId,
        label: app.label,
        icon: getIcon(app.iconName, { size: 28, className: colorClass }),
    };
}

function DockSkeleton({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={`dock-sk-${i}`} className="w-14 h-14 rounded-2xl bg-os-panel/40 animate-pulse" />
            ))}
        </>
    );
}

export default function BottomDock() {
    const { openWindow, windows } = useOS();
    const { language } = useLanguage();
    const isTablet = useIsTablet();

    const [dockApps, setDockApps] = useState<DockApp[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getDesktopApps(language).then((apps) => {
            if (cancelled) return;
            const dockOnly = apps
                .filter((a) => a.showInDock)
                .map(strapiAppToDockApp);
            setDockApps(dockOnly);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [language]);

    if (!isTablet) return null;

    const handleIconClick = (appId: string) => {
        const appInfo = dockApps.find(i => i.id === appId);
        const appLabel = appInfo ? appInfo.label : 'App';

        if (appId === 'projects') {
            openWindow(
                `window-${appId}`,
                `${appLabel} - App`,
                <JOSsuiteWindow />,
                { size: { width: 900, height: 600 } }
            );
        } else if (appId === 'readme') {
            openWindow(
                `window-${appId}`,
                appLabel,
                <ReadmeViewerApp />,
                { size: { width: 850, height: 750 } }
            );
        } else if (appId === 'settings') {
            openWindow(
                'window-display-options',
                appLabel,
                <DisplayOptionsWindow initialTab="appearance" />,
                { size: { width: 650, height: 600 } }
            );
        } else if (appId === 'contact') {
            openWindow(
                `window-${appId}`,
                appLabel,
                <ContactWindow />,
                { size: { width: 700, height: 600 } }
            );
        } else if (appId === 'music') {
            openWindow(
                `window-${appId}`,
                appLabel,
                <MusicPlayerWindow />,
                { size: { width: 340, height: 550 }, resizable: false }
            );
        } else {
            openWindow(
                `window-${appId}`,
                appLabel,
                <div className="p-8 flex items-center justify-center h-full text-gray-500 font-mono text-sm">
                    No content available for: <strong className="ml-1">{appId}</strong>
                </div>,
                { size: { width: 600, height: 400 } }
            );
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] flex">
            <div className="os-dock flex items-center gap-2 px-4 py-3 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-lg">
                {loading ? (
                    <DockSkeleton count={4} />
                ) : (
                    dockApps.map((app) => {
                        const isOpen = windows.some(w => w.id === `window-${app.id}`);
                        return (
                            <div key={app.id} className="relative flex flex-col items-center group">
                                <button
                                    onClick={() => handleIconClick(app.id)}
                                    className="os-dock-item w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all duration-200"
                                >
                                    {app.icon}
                                </button>
                                <span className="absolute -top-10 px-2 py-1 bg-black/70 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {app.label}
                                </span>
                                {isOpen && (
                                    <div className="absolute -bottom-2 w-1 h-1 bg-os-panel-text rounded-full" />
                                )}
                            </div>
                        );
                    })
                )}

                <div className="w-[1px] h-10 bg-white/20 dark:bg-white/10 mx-1" />

                <div className="relative flex flex-col items-center group">
                    <div className="os-dock-item flex items-center justify-center rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all duration-200">
                        <LanguageSwitcher direction="up" />
                    </div>
                </div>
            </div>
        </div>
    );
}
