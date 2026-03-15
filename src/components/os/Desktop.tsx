'use client';

import React, { useRef } from 'react';
import DesktopIcon, { AppIconData } from './DesktopIcon';
import * as ContextMenu from '@radix-ui/react-dropdown-menu';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import Window from './Window';
import TopBar from './TopBar';
import JOSsuiteWindow from '@/components/os/apps/JOSsuiteWindow';
import TrashWindow from '@/components/os/apps/TrashWindow';
import DisplayOptionsWindow, { DESKTOP_BACKGROUNDS } from '@/components/os/apps/DisplayOptionsWindow';
import BottomDock from './BottomDock';
import Screensaver from './apps/Screensaver';
import TerminalApp from '@/components/os/apps/TerminalApp';
import ContactWindow from '@/components/os/apps/ContactWindow';
import GamesWindow from '@/components/os/apps/GamesWindow';
import GalleryWindow from '@/components/os/apps/GalleryWindow';
import BrowserApp from './apps/BrowserApp';
import MusicPlayerWindow from './apps/MusicPlayerWindow';
import PdfViewerApp from './apps/PdfViewerApp';
import ReadmeViewerApp from './apps/ReadmeViewerApp';
import { useOS } from '@/context/OSContext';
import { useLanguage } from '@/context/LanguageContext';
import { Image as ImageIcon, Info, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useIsTablet, useIsMobile } from '@/hooks/useMediaQuery';
import { getDesktopApps, type StrapiDesktopApp } from '@/services/strapi';
import { getIcon } from '@/utils/iconMapper';

interface IconPosition {
    deltaX: number;
    deltaY: number;
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

function strapiAppToIconData(app: StrapiDesktopApp): AppIconData {
    const colorClass = app.iconColor || ORIGINAL_ICON_COLORS[app.appId] || 'text-os-text';

    return {
        id: app.appId,
        label: app.label,
        icon: getIcon(app.iconName, { size: 32, className: colorClass }),
    };
}

// Esqueleto mientras cargan los datos de Strapi
function DesktopIconSkeleton({ count = 5 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <li
                    key={`skeleton-${i}`}
                    className="absolute flex flex-col items-center gap-2 w-24 animate-pulse"
                    style={{ left: 20, top: 20 + i * 100 }}
                >
                    <div className="w-10 h-10 rounded-lg bg-os-panel/40" />
                    <div className="h-3 w-16 rounded bg-os-panel/30" />
                </li>
            ))}
        </>
    );
}

export default function Desktop() {
    const constraintsRef = useRef<HTMLDivElement>(null);
    const { windows, openWindow, colorMode, desktopBackground, animation, screensaver, osTheme, isScreensaverActive, setIsScreensaverActive } = useOS();
    const { t, language } = useLanguage();
    const [systemPrefersDark, setSystemPrefersDark] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({});
    const [mounted, setMounted] = useState(false);
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();

    const [desktopApps, setDesktopApps] = useState<AppIconData[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setAppsLoading(true);
        getDesktopApps(language).then((strapiApps) => {
            if (cancelled) return;
            setDesktopApps(strapiApps.map(strapiAppToIconData));
            setAppsLoading(false);
        });
        return () => { cancelled = true; };
    }, [language]);

    const translatedIcons = desktopApps;

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const savedPositions = localStorage.getItem('os-icon-positions');
            if (savedPositions) {
                try {
                    setIconPositions(JSON.parse(savedPositions));
                } catch (e) {
                    console.error('Failed to parse icon positions:', e);
                }
            }
        }
    }, []);

    const handleIconPositionChange = useCallback((id: string, deltaX: number, deltaY: number) => {
        setIconPositions(prev => {
            const newPositions = { ...prev, [id]: { deltaX, deltaY } };
            if (typeof window !== 'undefined') {
                localStorage.setItem('os-icon-positions', JSON.stringify(newPositions));
            }
            return newPositions;
        });
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemPrefersDark(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const isDarkMode = colorMode === 'dark' || (colorMode === 'system' && systemPrefersDark);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const currentBackground = DESKTOP_BACKGROUNDS.find(bg => bg.id === desktopBackground) || DESKTOP_BACKGROUNDS[0];

    const THEME_WALLPAPER: Record<string, { a: string; b: string; key: string }> = {
        'light-minimal': { a: '#DBEAFE', b: '#BFDBFE', key: '#93C5FD' },
        'dark-pro': { a: '#1F2937', b: '#111827', key: '#0A84FF' },
        'dracula': { a: '#282A36', b: '#191A21', key: '#BD93F9' },
        'nord': { a: '#3B4252', b: '#2E3440', key: '#88C0D0' },
        'retro-95': { a: '#008080', b: '#006060', key: '#EAB308' },
        'solar-dark': { a: '#073642', b: '#002B36', key: '#268BD2' },
        'yaru': { a: '#300A24', b: '#1a0512', key: '#E95420' },
        'gruvbox': { a: '#282828', b: '#1D2021', key: '#FE8019' },
        'synthwave-84': { a: '#1A0B2E', b: '#11051F', key: '#FF2A6D' },
        'xp': { a: '#004A99', b: '#003366', key: '#41941A' },
    };
    const wallpaperColors = THEME_WALLPAPER[osTheme] || THEME_WALLPAPER['light-minimal'];

    const handleOpenDisplayOptions = (initialTab: string = 'appearance') => {
        openWindow(
            'window-display-options',
            t('desktop.settings'),
            <DisplayOptionsWindow initialTab={initialTab} />,
            { size: { width: 650, height: 600 } }
        );
    };

    // Lógica del salvapantallas (2 minutos de inactividad)
    useEffect(() => {
        if (screensaver !== 'enabled') {
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsScreensaverActive(true);
            }, 120000);
        };

        timeoutId = setTimeout(() => {
            setIsScreensaverActive(true);
        }, 120000);

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
        };
    }, [screensaver]);

    const handleIconDoubleClick = (app: AppIconData) => {
        if (app.id === 'projects') {
            openWindow(
                `window-${app.id}`,
                `${app.label} - App`,
                <JOSsuiteWindow />,
                { size: { width: 900, height: 600 } }
            );
        } else if (app.id === 'trash') {
            openWindow(
                `window-${app.id}`,
                `${app.label} - App`,
                <TrashWindow />,
                { size: { width: 950, height: 500 } }
            );
        } else if (app.id === 'settings') {
            handleOpenDisplayOptions();
        } else if (app.id === 'terminal') {
            openWindow(
                `window-${app.id}`,
                'jjaroll@aiterego:~',
                <TerminalApp />,
                { size: { width: 700, height: 450 }, resizable: true }
            );
        } else if (app.id === 'contact') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <ContactWindow />,
                { size: { width: 700, height: 600 } }
            );
        } else if (app.id === 'games') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <GamesWindow />,
                { size: { width: 850, height: 550 } }
            );
        } else if (app.id === 'gallery') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <GalleryWindow />,
                { size: { width: 800, height: 600 } }
            );
        } else if (app.id === 'browser') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <BrowserApp />,
                { size: { width: 1000, height: 700 } }
            );
        } else if (app.id === 'music') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <MusicPlayerWindow />,
                { size: { width: 340, height: 550 }, resizable: false }
            );
        } else if (app.id === 'readme') {
            openWindow(
                `window-${app.id}`,
                app.label,
                <ReadmeViewerApp />,
                { size: { width: 850, height: 750 } }
            );
        } else {
            openWindow(
                `window-${app.id}`,
                app.label,
                <div className="flex items-center justify-center h-full p-8 text-center text-gray-500">
                    <p>Contenido de prueba para: <strong>{app.label}</strong></p>
                </div>
            );
        }
    };

    // abrir automaticamente una app desde la url (ej. /?app=gallery)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const appToOpen = params.get('app');
            if (appToOpen) {
                const app = translatedIcons.find(a => a.id === appToOpen);
                if (app) {
                    const isOpen = windows.some(w => w.id === app.id || w.id === `window-${app.id}`);
                    if (!isOpen) {
                        setTimeout(() => handleIconDoubleClick(app), 500);
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        const handleOpenAppEvent = (e: Event) => {
            const { appId } = (e as CustomEvent<{ appId: string }>).detail;
            const app = translatedIcons.find(a => a.id === appId);
            if (app) handleIconDoubleClick(app);
        };
        window.addEventListener('os:open-app', handleOpenAppEvent);
        return () => window.removeEventListener('os:open-app', handleOpenAppEvent);
    }, [translatedIcons]);

    if (!mounted) {
        return <div className="w-screen h-screen bg-os-bg overflow-hidden" />;
    }

    return (
        <div className={`relative w-screen h-screen overflow-hidden select-none bg-os-bg text-os-panel-text transition-colors duration-300 ${animation === 'disabled' ? '*:!transition-none *:!animate-none' : ''}`}>
            {/* Fondo de pantalla */}
            {desktopBackground === 'dinamic' ? (
                // Fondo de teclado SVG generado con la paleta del tema activo
                <div
                    className="absolute inset-0 pointer-events-none transition-colors duration-500 flex items-center justify-center font-bold"
                    style={{
                        backgroundColor: wallpaperColors.b,
                        backgroundImage: `
                            radial-gradient(ellipse at 20% 50%, ${wallpaperColors.a}88 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, ${wallpaperColors.key}33 0%, transparent 50%),
                            repeating-linear-gradient(90deg, ${wallpaperColors.key}18 0px, ${wallpaperColors.key}18 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(0deg, ${wallpaperColors.key}18 0px, ${wallpaperColors.key}18 1px, transparent 1px, transparent 40px)
                        `,
                    }}
                >
                    {/* Formas de teclas del teclado */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="keys" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <rect x="4" y="4" width="22" height="22" rx="4" fill={wallpaperColors.key} opacity="0.6" />
                                <rect x="32" y="4" width="22" height="22" rx="4" fill={wallpaperColors.key} opacity="0.4" />
                                <rect x="4" y="32" width="22" height="22" rx="4" fill={wallpaperColors.key} opacity="0.4" />
                                <rect x="32" y="32" width="22" height="22" rx="4" fill={wallpaperColors.key} opacity="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#keys)" />
                    </svg>

                </div>
            ) : (
                <div
                    className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-opacity duration-300"
                    style={{
                        backgroundImage: `url(${currentBackground.image})`,
                        opacity: isDarkMode ? 0.7 : 1
                    }}
                />
            )}

            {/* marca de agua */}
            <div className={`absolute inset-0 pointer-events-none flex z-0 ${desktopBackground === 'dinamic' ? 'items-center justify-center' : `items-end justify-end ${isTablet ? 'pb-32 pr-6 sm:pb-24 sm:pr-8' : 'p-8'}`}`}>
                <div
                    className={`tracking-tight drop-shadow-sm select-none transition-all duration-500 ${desktopBackground === 'dinamic' ? 'text-white/40 text-6xl md:text-8xl' : 'text-white/30 text-xl font-bold mix-blend-overlay'}`}
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                    JJaroll.dev
                </div>
            </div>

            {!isTablet && (
                <div className="hidden sm:block">
                    <TopBar />
                </div>
            )}

            {/* escritorio con menú contextual*/}
            {isTablet ? (
                <div
                    ref={constraintsRef}
                    className={`absolute inset-x-0 bottom-0 ${isMobile ? 'top-0' : 'top-[32px] md:top-0 lg:top-[32px]'} md:bottom-[80px] lg:bottom-0`}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {/* arreglo de iconos en tablet */}
                    <ul className="relative w-full h-full p-6 pt-12 sm:p-12 sm:pt-16 list-none flex flex-row flex-wrap justify-center sm:justify-start content-start gap-y-8 gap-x-4 sm:gap-x-12">
                        {appsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <li key={`sk-${i}`} className="flex flex-col items-center w-20 gap-1.5 animate-pulse">
                                    <div className="w-16 h-16 rounded-2xl bg-os-panel/40" />
                                    <div className="h-3 w-14 rounded bg-os-panel/30" />
                                </li>
                            ))
                        ) : translatedIcons.filter(app => app.id !== 'terminal').map((app) => (
                            <li
                                key={`tablet-${app.id}`}
                                className="flex flex-col items-center w-20 gap-1.5 cursor-pointer group"
                                onClick={() => handleIconDoubleClick(app)}
                            >
                                <div className="flex flex-col items-center justify-center select-none w-16 h-16 rounded-2xl bg-os-panel shadow-sm transition-transform hover:scale-105 active:scale-95">
                                    <div className="pointer-events-none scale-125">
                                        {app.icon}
                                    </div>
                                </div>
                                <span className="text-white text-[13px] font-medium tracking-wide drop-shadow-md text-center leading-tight [text-shadow:_0_1px_3px_rgb(0_0_0_/_80%)]">
                                    {app.label}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {windows.map(window => (
                        <Window key={window.id} window={window} />
                    ))}
                </div>
            ) : (
                <>
                    <RadixContextMenu.Root>
                        <RadixContextMenu.Trigger asChild>
                            <div
                                ref={constraintsRef}
                                className={`absolute inset-x-0 bottom-0 ${isMobile ? 'top-0' : 'top-[32px] md:top-0 lg:top-[32px]'} md:bottom-[80px] lg:bottom-0`}
                            >
                                {/* arrastrar iconos del escritorio */}
                                <ul className="relative w-full h-full p-4 list-none hidden sm:block">
                                    {appsLoading ? (
                                        <DesktopIconSkeleton count={5} />
                                    ) : translatedIcons.map((app, dynamicIndex) => {
                                        const appIdsRight = ['trash', 'settings', 'terminal'];
                                        const appIdsLeft = ['readme', 'projects', 'gallery', 'browser', 'games', 'music', 'contact'];
                                        const isRight = appIdsRight.includes(app.id);
                                        let index = isRight ? appIdsRight.indexOf(app.id) : appIdsLeft.indexOf(app.id);
                                        if (index === -1) index = dynamicIndex;

                                        const savedPos = iconPositions[app.id];
                                        const defaultPos = isRight
                                            ? { right: 20, y: 20 + index * 100 }
                                            : { x: 20, y: 20 + index * 100 };

                                        return (
                                            <DesktopIcon
                                                key={app.id}
                                                app={app}
                                                initialPosition={defaultPos}
                                                savedOffset={savedPos}
                                                constraintsRef={constraintsRef}
                                                onDoubleClick={() => handleIconDoubleClick(app)}
                                                onPositionChange={handleIconPositionChange}
                                                isTablet={isTablet}
                                            />
                                        );
                                    })}
                                </ul>
                            </div>
                        </RadixContextMenu.Trigger>
                        <RadixContextMenu.Portal>
                            <RadixContextMenu.Content
                                className="z-[10000] min-w-[280px] bg-os-panel/90 backdrop-blur-3xl rounded-xl py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-os-border text-os-panel-text font-medium text-[13.5px] animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                            >
                                <div className="px-1.5">
                                    <RadixContextMenu.Item
                                        className="flex items-center px-2 py-1 outline-none cursor-default rounded hover:bg-os-accent hover:text-white focus:bg-os-accent focus:text-white transition-colors"
                                        onSelect={() => {
                                            const readmeApp = translatedIcons.find(app => app.id === 'readme');
                                            if (readmeApp) handleIconDoubleClick(readmeApp);
                                        }}
                                    >
                                        <Info size={16} strokeWidth={1.5} className="mr-3 opacity-90" />
                                        <span>{t('desktop.context_menu.info')}</span>
                                    </RadixContextMenu.Item>
                                    <RadixContextMenu.Item
                                        className="flex items-center px-2 py-1 outline-none cursor-default rounded hover:bg-os-accent hover:text-white focus:bg-os-accent focus:text-white transition-colors"
                                        onSelect={() => handleOpenDisplayOptions('wallpaper')}
                                    >
                                        <ImageIcon size={16} strokeWidth={1.5} className="mr-3 opacity-90" />
                                        <span>{t('desktop.context_menu.wallpaper')}</span>
                                    </RadixContextMenu.Item>
                                </div>
                                <RadixContextMenu.Separator className="h-px bg-os-panel/10 my-1 mx-3" />
                                <div className="px-1.5">
                                    <RadixContextMenu.Item
                                        className="flex items-center px-2 py-1 outline-none cursor-default rounded hover:bg-os-accent hover:text-white focus:bg-os-accent focus:text-white transition-colors"
                                        onSelect={() => {
                                            localStorage.clear();
                                            sessionStorage.clear();
                                            window.location.reload();
                                        }}
                                    >
                                        <RefreshCw size={16} strokeWidth={1.5} className="mr-3 opacity-90" />
                                        <span>{t('desktop.context_menu.reload')}</span>
                                    </RadixContextMenu.Item>
                                </div>
                            </RadixContextMenu.Content>
                        </RadixContextMenu.Portal>
                    </RadixContextMenu.Root>

                    {windows.map(window => (
                        <Window key={window.id} window={window} />
                    ))}
                </>
            )}

            {isScreensaverActive && (
                <Screensaver onActivity={() => setIsScreensaverActive(false)} />
            )}

            <BottomDock />
        </div>
    );
}
