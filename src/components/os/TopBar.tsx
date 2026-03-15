'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Volume2, Wifi, Battery, ChevronRight, Brain, X,
    LayoutGrid, Activity, BarChart2, RotateCcw, ToggleLeft,
    FlaskConical, Database, PieChart, Code, TrendingUp, Zap,
    MessageSquare, Settings, Gift,
    Bird,
    Feather
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useOS } from '@/context/OSContext';
import { useLanguage } from '@/context/LanguageContext';
import AboutWindow from './apps/AboutWindow';
import DisplayOptionsWindow from './apps/DisplayOptionsWindow';
import PdfViewerApp from './apps/PdfViewerApp';
import AllAppsWindow from './apps/AllAppsWindow';
import LanguageSwitcher from './LanguageSwitcher';
import {
    getTopBarItems,
    groupTopBarItemsByMenu,
    type StrapiTopBarItem,
    type GroupedTopBarItems,
} from '@/services/strapi';
import { getIconComponent } from '@/utils/iconMapper';


const Shortcut = ({ children }: { children: React.ReactNode }) => (
    <span className="border border-os-border rounded px-1.5 py-0.5 text-[10px] font-mono text-os-text bg-os-bg ml-1 shadow-sm leading-none flex items-center group-hover:border-os-accent group-hover:bg-os-accent group-hover:text-white">
        {children}
    </span>
);

function MenuTriggerSkeleton() {
    return (
        <div className="hidden sm:block h-4 w-16 rounded bg-os-hover/60 animate-pulse mx-1" />
    );
}

interface DynamicMenuProps {
    triggerLabel: string;
    items: StrapiTopBarItem[];
    openWindow: (id: string, title: string, component: React.ReactNode, options?: any) => void;
}

function DynamicMenu({ triggerLabel, items, openWindow }: DynamicMenuProps) {
    const byCategory = items.reduce<Record<string, StrapiTopBarItem[]>>((acc, item) => {
        const cat = item.category ?? '__default__';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categories = Object.keys(byCategory);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <div className="hidden sm:block font-semibold cursor-pointer hover:bg-os-hover px-3 py-0.5 rounded data-[state=open]:bg-os-hover outline-none transition-colors">
                    {triggerLabel}
                </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="overflow-hidden z-[10000] min-w-[220px] bg-os-panel rounded-md shadow-xl border border-os-border mt-1 text-[13.5px] text-os-panel-text font-medium animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 transition-colors"
                    align="start"
                    sideOffset={4}
                >
                    {categories.map((cat, catIdx) => (
                        <React.Fragment key={cat}>
                            {categories.length > 1 && cat !== '__default__' && (
                                <div className="px-4 py-1.5 text-[11px] uppercase tracking-wider text-os-text/40 font-semibold">
                                    {cat}
                                </div>
                            )}
                            {byCategory[cat].map((item) => {
                                const IconComp = item.iconName ? getIconComponent(item.iconName) : null;
                                return (
                                    <DropdownMenu.Item
                                        key={item.documentId}
                                        className="flex items-center px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white group transition-colors"
                                        onSelect={() => {
                                            const link = item.href || (item as any).url;

                                            if (link && link !== '#') {
                                                if (link.toLowerCase().endsWith('.pdf')) {
                                                    // Abrir PDF en visor interno en vez de navegar afuera
                                                    openWindow(
                                                        `pdf-${item.documentId}`,
                                                        item.label,
                                                        <PdfViewerApp pdfUrl={link} title={item.label} />,
                                                        { size: { width: 750, height: 850 } } // Tamaño vertical ideal para leer
                                                    );
                                                } else if (link.startsWith('http')) {
                                                    window.open(link, '_blank', 'noopener,noreferrer');
                                                } else {
                                                    window.location.href = link;
                                                }
                                            }
                                        }}
                                    >
                                        {IconComp && (
                                            <IconComp
                                                size={15}
                                                className={`mr-3 shrink-0 ${item.iconColor ?? 'text-os-text/70'}`}
                                                strokeWidth={1.75}
                                            />
                                        )}
                                        <span>{item.label}</span>
                                    </DropdownMenu.Item>
                                );
                            })}
                            {catIdx < categories.length - 1 && (
                                <DropdownMenu.Separator className="h-px bg-os-border my-1 mx-3" />
                            )}
                        </React.Fragment>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}


const MENU_ORDER = ['products', 'pricing', 'docs', 'community', 'company', 'more'] as const;

type MenuKey = (typeof MENU_ORDER)[number] | string;


export default function TopBar() {
    const [currentTime, setCurrentTime] = useState<string>('');
    const {
        activeWindowId, windows, openWindow, closeAllWindows,
        closeWindow, restoreWindow, osTheme, setIsScreensaverActive,
    } = useOS();
    const { t, language } = useLanguage();

    const [groupedMenus, setGroupedMenus] = useState<GroupedTopBarItems>({});
    const [topBarLoading, setTopBarLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setTopBarLoading(true);
        getTopBarItems(language).then((items) => {
            if (cancelled) return;
            setGroupedMenus(groupTopBarItemsByMenu(items));
            setTopBarLoading(false);
        });
        return () => { cancelled = true; };
    }, [language]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', weekday: 'short' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [language]);

    const strapiKeys = Object.keys(groupedMenus);
    const orderedKeys: MenuKey[] = [
        ...MENU_ORDER.filter(k => strapiKeys.includes(k)),
        ...strapiKeys.filter(k => !(MENU_ORDER as readonly string[]).includes(k)),
    ];

    // Devuelve el label del trigger: usa la clave traducida si existe; de lo contrario capitaliza la clave de Strapi
    function menuLabel(key: MenuKey): string {
        const tKey = `topbar.${key}`;
        const translated = t(tKey);
        if (translated !== tKey) return translated;
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    return (
        <div className="flex items-center justify-between px-4 py-1 text-sm bg-os-titlebar/80 backdrop-blur-md border-b border-os-border shadow-sm fixed top-0 w-full z-[9999] h-[32px] select-none text-os-titlebar-text transition-colors">

            {/* lado izquierdo: menús estáticos del sistema + menús dinámicos del CMS */}
            <div className="flex items-center space-x-4">

                {/* ⌘ Pluma (icono del sistema) — siempre estático (controles del sistema) */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <div className="flex items-center cursor-pointer hover:bg-os-hover px-2 py-0.5 rounded outline-none data-[state=open]:bg-os-hover transition-colors">
                            <Feather size={16} />
                        </div>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="overflow-hidden z-[10000] min-w-[240px] bg-os-panel rounded-md py-1 shadow-xl border border-os-border mt-1 text-[13px] text-os-panel-text animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 font-medium"
                            align="start"
                            sideOffset={4}
                        >

                            <DropdownMenu.Item
                                onSelect={() => openWindow('about-website', t('topbar.about_website'), <AboutWindow />, { size: { width: 340, height: 600 } })}
                                className="flex items-center px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white group"
                            >
                                {t('topbar.about_website')}
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                onSelect={() => openWindow('window-display-options', t('topbar.display_options'), <DisplayOptionsWindow />, { size: { width: 650, height: 600 } })}
                                className="flex items-center justify-between px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white group mt-1"
                            >
                                {t('topbar.display_options')}
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-os-border my-1.5 mx-2" />
                            <DropdownMenu.Item
                                onSelect={() => setIsScreensaverActive(true)}
                                className="flex items-center justify-between px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white group"
                            >
                                {t('topbar.start_screensaver')}
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                onSelect={() => closeAllWindows()}
                                className="flex items-center justify-between px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white group"
                            >
                                {t('topbar.close_all_windows')}
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {/* Título de la app — siempre estático */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <div className="font-semibold cursor-pointer hover:bg-os-hover px-2 py-0.5 rounded data-[state=open]:bg-os-hover outline-none transition-colors">
                            J.OS
                        </div>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="overflow-hidden z-[10000] min-w-[260px] bg-os-panel rounded-md shadow-xl border border-os-border mt-1 text-[13px] text-os-panel-text animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                            align="start"
                            sideOffset={4}
                        >
                            <DropdownMenu.Item
                                onSelect={() =>
                                    openWindow(
                                        'all-apps',
                                        t('topbar.explore_apps').replace('{count}', '10'),
                                        <AllAppsWindow />,
                                        { size: { width: 560, height: 520 } }
                                    )
                                }
                                className="flex items-center px-4 py-2 outline-none cursor-pointer hover:bg-os-hover group"
                            >
                                <LayoutGrid size={16} className="text-[#f54e00] mr-3" />
                                {t('topbar.explore_apps').replace('{count}', '10')}
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {topBarLoading ? (
                    MENU_ORDER.map(k => <MenuTriggerSkeleton key={k} />)
                ) : (
                    orderedKeys.map(key => (
                        <DynamicMenu
                            key={key}
                            triggerLabel={menuLabel(key)}
                            items={groupedMenus[key] ?? []}
                            openWindow={openWindow}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center space-x-3">
                {windows.length > 0 && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <div className="cursor-pointer hover:bg-os-hover px-1.5 py-0.5 rounded outline-none flex items-center justify-center font-mono text-[11px] font-bold border border-os-border bg-os-panel mr-2 data-[state=open]:bg-os-hover text-os-panel-text transition-colors">
                                {windows.length}
                            </div>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="overflow-hidden z-[10000] min-w-[260px] bg-os-panel rounded-md shadow-xl border border-os-border mt-1 text-[13px] text-gray-700 font-medium overflow-hidden animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 transition-colors"
                                align="end"
                                sideOffset={4}
                            >
                                <div className="flex items-center justify-between px-4 py-2 bg-os-panel border-b border-os-border transition-colors">
                                    <span className="font-semibold text-os-panel-text text-[14px]">{t('topbar.active_windows')}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); closeAllWindows(); }}
                                        className="text-os-text/60 hover:text-os-panel-text flex items-center text-xs transition-colors"
                                    >
                                        {t('topbar.close_all')} <ChevronRight size={14} className="ml-0.5" />
                                    </button>
                                </div>
                                <DropdownMenu.Item
                                    className="px-4 py-2 border-b border-os-border text-os-panel-text hover:bg-os-hover cursor-pointer outline-none transition-colors"
                                    onSelect={() => openWindow('window-display-options', t('topbar.display_options'), <DisplayOptionsWindow />, { size: { width: 650, height: 600 } })}
                                >
                                    {t('topbar.display_options')}
                                </DropdownMenu.Item>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {windows.map(w => (
                                        <div
                                            key={w.id}
                                            className="flex items-center justify-between px-3 py-1.5 rounded cursor-pointer hover:bg-os-hover group border border-os-border bg-os-bg mb-2 last:mb-0 transition-colors"
                                            onClick={() => restoreWindow(w.id)}
                                        >
                                            <span className={`font-semibold truncate ${w.minimized ? 'italic text-os-text/50' : 'text-os-panel-text'}`}>
                                                {w.title}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); closeWindow(w.id); }}
                                                className="text-os-text/60 hover:text-os-panel-text p-0.5 rounded transition-colors"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                )}

                <div className="cursor-pointer hover:bg-os-hover p-1 rounded transition-colors">
                    <LanguageSwitcher />
                </div>
                <div className="cursor-pointer hover:bg-os-hover p-1 rounded transition-colors hidden sm:block">
                    <Battery size={16} />
                </div>
                <div className="cursor-pointer hover:bg-os-hover p-1 rounded transition-colors hidden sm:block">
                    <Wifi size={16} />
                </div>
                <div className="cursor-pointer hover:bg-os-hover p-1 rounded transition-colors hidden sm:block">
                    <Volume2 size={16} />
                </div>
                <div className="font-medium px-2 py-0.5 whitespace-nowrap">
                    {currentTime}
                </div>
            </div>
        </div>
    );
}
