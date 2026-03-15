'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getDesktopApps, type StrapiDesktopApp } from '@/services/strapi';
import { getIcon } from '@/utils/iconMapper';

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


// Loader en esqueleto
function AppGridSkeleton() {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-os-hover/60" />
                    <div className="h-3 w-14 rounded bg-os-hover/40" />
                </div>
            ))}
        </div>
    );
}

export default function AllAppsWindow() {
    const { t, language } = useLanguage();
    const [apps, setApps] = useState<StrapiDesktopApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getDesktopApps(language).then((data) => {
            if (cancelled) return;
            setApps(data);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [language]);

    // Filtrar por texto de búsqueda
    const filtered = apps.filter(app =>
        app.label.toLowerCase().includes(query.toLowerCase())
    );


    const handleOpenApp = (app: StrapiDesktopApp) => {
        window.dispatchEvent(new CustomEvent('os:open-app', { detail: { appId: app.appId } }));
    };

    return (
        <div className="flex flex-col h-full bg-os-bg text-os-text font-sans select-none transition-colors">
            {/* Search bar */}
            <div className="shrink-0 px-6 pt-5 pb-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-os-text/40 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={t('topbar.search_placeholder') || 'Type to search…'}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-os-panel border border-os-border rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-os-accent text-os-text placeholder:text-os-text/40 transition-colors"
                    />
                </div>
            </div>


            {/* App grid */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {loading ? (
                    <AppGridSkeleton />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-os-text/30 gap-2">
                        <Search size={32} strokeWidth={1.5} />
                        <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
                        {filtered.map(app => {
                            const colorClass = app.iconColor || ORIGINAL_ICON_COLORS[app.appId] || 'text-os-text';
                            return (
                                <button
                                    key={app.documentId}
                                    onClick={() => handleOpenApp(app)}
                                    title={app.label}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-os-hover active:scale-95 transition-all duration-150 cursor-pointer text-center"
                                >
                                    {/* Contenedor del ícono — cuadrado redondeado estilo macOS */}
                                    <div className="w-14 h-14 rounded-2xl bg-os-panel border border-os-border/60 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                        {getIcon(app.iconName, { size: 30, className: colorClass })}
                                    </div>
                                    {/* Label */}
                                    <span className="text-xs leading-tight text-os-text/80 group-hover:text-os-text line-clamp-2 w-full transition-colors">
                                        {app.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer count */}
            {!loading && (
                <div className="shrink-0 px-6 py-2 border-t border-os-border text-xs text-os-text/40 text-center transition-colors">
                    {filtered.length} {filtered.length === 1 ? 'app' : 'apps'}
                </div>
            )}
        </div>
    );
}
