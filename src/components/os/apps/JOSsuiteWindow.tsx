'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getIcon } from '@/utils/iconMapper';
import { useLanguage } from '@/context/LanguageContext';
import { getProjects, getStrapiMediaUrl, type StrapiProject } from '@/services/strapi';

// componente esqueleto

function GridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="flex flex-wrap items-start justify-start gap-y-8 gap-x-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col w-[90px] items-center text-center p-2 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-os-panel/60 mb-2" />
                    <div className="h-3 w-14 rounded bg-os-panel/40" />
                </div>
            ))}
        </div>
    );
}

function DetailPanelSkeleton() {
    return (
        <div className="flex-1 flex flex-col items-center pt-8 px-8 animate-pulse gap-4">
            <div className="w-20 h-20 rounded-xl bg-os-panel/60" />
            <div className="h-5 w-32 rounded bg-os-panel/50" />
            <div className="h-3 w-40 rounded bg-os-panel/40" />
            <div className="h-3 w-36 rounded bg-os-panel/30" />
            <div className="w-full h-40 rounded bg-os-panel/40 mt-2" />
        </div>
    );
}

// componente principal

function extractStrapiText(content: any): string {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map(block => {
            if (block?.children && Array.isArray(block.children)) {
                return block.children.map((child: any) => child.text || '').join('');
            }
            return '';
        }).join('\n\n');
    }
    return String(content);
}

export default function JOSsuiteWindow() {
    const { t, language } = useLanguage();

    const [projects, setProjects] = useState<StrapiProject[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedProject, setSelectedProject] = useState<StrapiProject | null>(null);
    const [rightPanelWidth, setRightPanelWidth] = useState(260);
    const lastTouchTime = React.useRef<{ [id: string]: number }>({});

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setSelectedProject(null);

        getProjects(language).then((data) => {
            if (cancelled) return;
            setProjects(data);
            if (data.length > 0) setSelectedProject(data[0]);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [language]);

    // doble click
    const handleAppInteraction = (e: React.MouseEvent | React.TouchEvent, project: StrapiProject) => {
        const now = Date.now();
        const lastTime = lastTouchTime.current[project.documentId] || 0;
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTime < DOUBLE_TAP_DELAY) {
            const link = project.githuburl || (project as any).githubUrl;
            if (link) window.open(link, '_blank', 'noopener,noreferrer');
            lastTouchTime.current[project.documentId] = 0;
        } else {
            setSelectedProject(project);
            lastTouchTime.current[project.documentId] = now;
        }
    };

    // panel derecho redimensionable
    const startResizeRight = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = rightPanelWidth;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(200, Math.min(400, startWidth + (startX - moveEvent.clientX)));
            setRightPanelWidth(newWidth);
        };
        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // usar ruta estática si existe, luego intentar con Strapi Media
    const staticImageUrl = selectedProject?.coverImageUrl || (selectedProject as any)?.coverimageurl;
    const selectedImageField = selectedProject?.coverimage || (selectedProject as any)?.coverImage;
    const selectedImageUrl = staticImageUrl || (selectedProject ? getStrapiMediaUrl(selectedImageField) : null);

    const groupedProjects = React.useMemo(() => {
        const groups: Record<string, StrapiProject[]> = {};
        projects.forEach(p => {
            const cat = p.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [projects]);

    return (
        <div className="flex w-full h-full bg-os-panel text-os-panel-text font-sans text-sm select-none overflow-hidden @container transition-colors">

            {/* Left Sidebar */}
            <div className="w-[260px] flex-shrink-0 bg-os-panel border-r border-os-border flex flex-col p-5 overflow-y-auto hidden @4xl:flex transition-colors">
                <p className="text-os-text/80 mb-4 leading-relaxed transition-colors">
                    {t('aiterego.sidebar_p1')}
                </p>
                <p className="text-os-text/80 mb-3 leading-relaxed transition-colors">
                    {t('aiterego.sidebar_p2')}
                </p>

                <div className="border border-os-border bg-os-bg rounded-md p-4 shadow-sm transition-colors">
                    <h3 className="list-disc pl-5 text-os-text/80 space-y-2 mb-8 transition-colors">
                        <li>{t('aiterego.features_1')}</li>
                        <li>{t('aiterego.features_2')}</li>
                        <li>{t('aiterego.features_3')}</li>
                        <li>{t('aiterego.features_4')}</li>
                    </h3>
                </div>
            </div>

            {/* centro*/}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-os-bg relative min-w-[120px] transition-colors shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]">
                <div className="max-w-3xl mx-auto space-y-10">
                    {loading ? (
                        <div>
                            <div className="h-4 w-36 rounded bg-os-panel/40 mb-6 animate-pulse" />
                            <GridSkeleton count={12} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-os-text/40 py-24 gap-3">
                            <Search size={40} strokeWidth={1.5} />
                            <p className="text-sm">{t('aiterego.empty_selection')}</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedProjects).map(([categoryName, catProjects]) => (
                                <div key={categoryName}>
                                    <h2 className="flex items-center text-sm font-bold text-os-text/60 mb-4 transition-colors uppercase tracking-wider">
                                        <span className="mr-2">📍</span>
                                        {categoryName} ({catProjects.length})
                                    </h2>
                                    <div className="flex flex-wrap items-start justify-start gap-y-8 gap-x-2">
                                        {catProjects.map((project) => {
                                            const isSelected = selectedProject?.documentId === project.documentId;

                                            return (
                                                <div
                                                    key={project.documentId}
                                                    className={`flex flex-col w-[90px] items-center text-center cursor-pointer p-2 rounded-lg transition-colors ${isSelected ? 'bg-os-accent/20' : 'hover:bg-os-accent/10'}`}
                                                    onClick={(e) => handleAppInteraction(e, project)}
                                                >
                                                    <div className="relative mb-2 w-16 h-16 rounded-xl overflow-hidden border border-os-border shadow-sm transition-all bg-os-panel/60 flex items-center justify-center">
                                                        {project.iconName ? (
                                                            getIcon(project.iconName, {
                                                                size: 32,
                                                                className: project.iconColor?.startsWith('text-') ? project.iconColor : 'text-os-text/50',
                                                                color: project.iconColor?.startsWith('text-') ? undefined : project.iconColor
                                                            })
                                                        ) : (
                                                            <Search size={24} strokeWidth={1.5} className="text-os-text/30" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-os-text max-w-[80px] leading-tight transition-colors line-clamp-2">
                                                        {project.title}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <hr className="mt-8 border-os-border/50 transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Panel derecho*/}
            <div
                className="flex-shrink-0 bg-os-panel border-l border-os-border hidden @2xl:flex flex-col relative transition-colors"
                style={{ width: rightPanelWidth }}
            >
                <div
                    className="absolute left-[-3px] top-0 bottom-0 w-[6px] cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors z-30"
                    onPointerDown={startResizeRight}
                />

                {loading ? (
                    <DetailPanelSkeleton />
                ) : selectedProject ? (
                    <div className="h-full flex flex-col relative">
                        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-8 pb-32">
                            <div className="flex flex-col items-center px-8 w-full">
                                <div className="mb-6 w-20 h-20 rounded-xl border-2 border-os-border shadow-[4px_4px_0px_var(--os-border)] bg-os-panel/60 flex items-center justify-center transition-all">
                                    {selectedProject.iconName ? (
                                        getIcon(selectedProject.iconName, {
                                            size: 40,
                                            className: selectedProject.iconColor?.startsWith('text-') ? selectedProject.iconColor : 'text-os-text/50',
                                            color: selectedProject.iconColor?.startsWith('text-') ? undefined : selectedProject.iconColor
                                        })
                                    ) : (
                                        <Search size={32} strokeWidth={1.5} className="text-os-text/30" />
                                    )}
                                </div>

                                <h2 className="text-xl font-bold text-os-panel-text mb-2 text-center transition-colors">
                                    {selectedProject.title}
                                </h2>
                                <p className="text-center text-os-text/80 mb-6 text-sm transition-colors whitespace-pre-wrap">
                                    {extractStrapiText(selectedProject.description)}
                                </p>
                            </div>

                            {/* Banner proyecto */}
                            <div className="w-full px-4 mb-4">
                                {selectedImageUrl ? (
                                    <div className="w-full rounded-lg overflow-hidden border border-os-border shadow-md">
                                        <img
                                            src={selectedImageUrl}
                                            alt={`${selectedProject.title} preview`}
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-32 bg-os-panel/40 flex items-center justify-center text-os-text/20 rounded-lg border border-os-border">
                                        <Search size={40} strokeWidth={1} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                            <div className="h-24 w-full bg-gradient-to-t from-os-panel to-transparent transition-colors" />
                            <div className="bg-os-panel px-8 pb-8 pointer-events-auto transition-colors">
                                <button
                                    onClick={() => {
                                        const link = selectedProject.githuburl || (selectedProject as any).githubUrl;
                                        if (link) window.open(link, '_blank', 'noopener,noreferrer');
                                    }}
                                    disabled={!(selectedProject.githuburl || (selectedProject as any).githubUrl)}
                                    className="w-full py-2 px-4 bg-[#f0a92b] hover:bg-[#eab308] border-2 border-slate-800 rounded-md font-bold shadow-[2px_2px_0px_#1e293b] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {t('aiterego.open_page')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <Search size={48} className="mb-4 opacity-50" />
                        <p className="text-center">{t('aiterego.empty_selection')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}