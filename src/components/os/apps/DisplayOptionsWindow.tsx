'use client';

import React, { useState } from 'react';
import { Monitor, Sun, Moon, Image as ImageIcon, Sparkles, LayoutGrid, Check, Search, Settings, Globe } from 'lucide-react';
import { useOS } from '@/context/OSContext';
import { useLanguage } from '@/context/LanguageContext';

export const DESKTOP_BACKGROUNDS = [
    { id: 'dinamic', name: 'Dinámico', image: 'https://placehold.co/800x600/f4f4f5/71717a?text=JJaroll.dev' },
    { id: 'space', name: 'Espacio', image: '/jOS7764716.png' },
    { id: 'montania', name: 'Montaña', image: '/wp7764705.png' },
    { id: 'moss', name: 'Moss', image: '/wp7764723.jpg' },
    { id: '2001', name: '2001', image: '/wp7764704.jpg' },
    { id: 'cordillera', name: 'Cordillera', image: '/wp7764717.jpg' },
    { id: 'ciudad', name: 'Ciudad', image: '/wp7764724.jpg' },
    { id: 'nerd', name: 'Nerd', image: '/pexels-kevin-ku-92347-577585.jpg' },
];



const SegmentedControl = ({
    options,
    value,
    onChange,
    className = ""
}: {
    options: { id: string, label: string | React.ReactNode }[],
    value: string,
    onChange: (id: string) => void,
    className?: string
}) => (
    <div className={`flex p-0.5 bg-os-bg border border-os-border rounded-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] h-8 ${className}`}>
        {options.map((option) => {
            const isActive = value === option.id;
            return (
                <button
                    key={option.id}
                    onClick={() => onChange(option.id)}
                    className={`flex-1 flex items-center justify-center text-[13px] font-medium rounded-[4px] transition-all ${isActive ? 'bg-os-panel text-os-panel-text shadow-sm ring-1 ring-os-border' : 'text-os-text/80 hover:text-os-panel-text'
                        }`}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);

const SettingGroup = ({ children, title, description }: { children: React.ReactNode, title?: string, description?: string }) => (
    <div className="mb-6">
        {title && <h3 className="text-[13px] font-semibold text-os-panel-text mb-1 px-2">{title}</h3>}
        {description && <p className="text-[12px] text-os-text/60 mb-2 px-2 leading-relaxed">{description}</p>}
        <div className="bg-os-panel border border-os-border rounded-xl overflow-hidden flex flex-col shadow-sm">
            {children}
        </div>
    </div>
);

const SettingRow = ({ label, children, isLast }: { label: React.ReactNode, children: React.ReactNode, isLast?: boolean }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 gap-3 sm:gap-0 ${!isLast ? 'border-b border-os-border' : ''}`}>
        <div className="text-[13.5px] font-medium text-os-panel-text">{label}</div>
        <div className="flex-shrink-0 w-full sm:min-w-[200px] sm:w-auto flex sm:justify-end">
            {children}
        </div>
    </div>
);

export default function DisplayOptionsWindow({ initialTab = 'appearance' }: { initialTab?: string }) {
    const {
        colorMode, setColorMode,
        theme, setTheme,
        osTheme, setOsTheme,
        desktopBackground, setDesktopBackground,
        screensaver, setScreensaver,
        animation, setAnimation
    } = useOS();

    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div className="flex flex-col md:flex-row w-full h-full bg-os-bg font-sans overflow-hidden">
            {/* Barra lateral */}
            <div className="w-full md:w-[220px] h-auto md:h-full bg-os-panel/70 border-b md:border-b-0 md:border-r border-os-border p-3 pt-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible items-center md:items-stretch backdrop-blur-3xl shrink-0 custom-scrollbar-hidden">
                <div className="relative mb-0 md:mb-4 hidden md:block shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('settings.search')}
                        className="w-full bg-os-hover border border-os-border rounded-md py-1 pl-7 pr-3 text-[13px] text-os-panel-text outline-none focus:ring-2 focus:ring-os-accent/50 transition-shadow placeholder-os-text/50"
                    />
                </div>

                {/* Aspecto */}
                <button
                    onClick={() => setActiveTab('appearance')}
                    onPointerDown={(e) => { e.stopPropagation(); setActiveTab('appearance'); }}
                    className={`w-auto md:w-full shrink-0 flex items-center px-3 py-1.5 md:px-2 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'appearance'
                        ? 'bg-os-accent text-os-accent-text shadow-sm'
                        : 'text-os-text hover:bg-os-hover'
                        }`}
                >
                    <div className={`w-[22px] h-[22px] rounded flex items-center justify-center mr-2 shadow-sm ${activeTab === 'appearance' ? 'bg-os-panel/20' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`}>
                        <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="hidden md:inline">{t('settings.tabs.appearance')}</span>
                </button>

                {/* Escritorio y Dock */}
                <button
                    onClick={() => setActiveTab('desktop')}
                    onPointerDown={(e) => { e.stopPropagation(); setActiveTab('desktop'); }}
                    className={`w-auto md:w-full shrink-0 flex items-center px-3 py-1.5 md:px-2 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'desktop'
                        ? 'bg-os-accent text-os-accent-text shadow-sm'
                        : 'text-os-text hover:bg-os-hover'
                        }`}
                >
                    <div className={`w-[22px] h-[22px] rounded flex items-center justify-center mr-2 shadow-sm ${activeTab === 'desktop' ? 'bg-os-panel/20' : 'bg-gradient-to-b from-cyan-400 to-cyan-600'}`}>
                        <LayoutGrid size={12} className="text-white" />
                    </div>
                    <span className="hidden md:inline">{t('settings.tabs.desktop')}</span>
                </button>

                {/* Fondo de pantalla */}
                <button
                    onClick={() => setActiveTab('wallpaper')}
                    onPointerDown={(e) => { e.stopPropagation(); setActiveTab('wallpaper'); }}
                    className={`w-auto md:w-full shrink-0 flex items-center px-3 py-1.5 md:px-2 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'wallpaper'
                        ? 'bg-os-accent text-os-accent-text shadow-sm'
                        : 'text-os-text hover:bg-os-hover'
                        }`}
                >
                    <div className={`w-[22px] h-[22px] rounded flex items-center justify-center mr-2 shadow-sm ${activeTab === 'wallpaper' ? 'bg-os-panel/20' : 'bg-gradient-to-b from-sky-400 to-sky-600'}`}>
                        <ImageIcon size={12} className="text-white" />
                    </div>
                    <span className="hidden md:inline">{t('settings.tabs.wallpaper')}</span>
                </button>

                {/* Sistema */}
                <button
                    onClick={() => setActiveTab('system')}
                    onPointerDown={(e) => { e.stopPropagation(); setActiveTab('system'); }}
                    className={`w-auto md:w-full shrink-0 flex items-center px-3 py-1.5 md:px-2 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'system'
                        ? 'bg-os-accent text-os-accent-text shadow-sm'
                        : 'text-os-text hover:bg-os-hover'
                        }`}
                >
                    <div className={`w-[22px] h-[22px] rounded flex items-center justify-center mr-2 shadow-sm ${activeTab === 'system' ? 'bg-os-panel/20' : 'bg-gradient-to-b from-gray-500 to-gray-700'}`}>
                        <Settings size={12} className="text-white" />
                    </div>
                    <span className="hidden md:inline">{t('settings.tabs.system')}</span>
                </button>
            </div>

            <div className="flex-1 h-full overflow-y-auto bg-os-bg p-4 md:p-6 lg:p-8 relative transition-colors shadow-none md:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] pb-24">

                <div className="flex items-center mb-6 px-1">
                    <h2 className="text-[17px] font-semibold text-os-panel-text">
                        {activeTab === 'appearance' && t('settings.tabs.appearance')}
                        {activeTab === 'wallpaper' && t('settings.tabs.wallpaper')}
                        {activeTab === 'desktop' && t('settings.tabs.desktop')}
                        {activeTab === 'system' && t('settings.tabs.system')}
                    </h2>
                </div>

                {activeTab === 'appearance' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <SettingGroup title={t('settings.appearance.title')} description={t('settings.appearance.description')}>
                            <div className="flex flex-col sm:flex-row p-5 border-b border-os-border gap-6 justify-center">
                                {/* Auto */}
                                <button className="flex flex-col items-center gap-2 cursor-pointer group outline-none" onClick={() => setColorMode('system')} onPointerDown={(e) => { e.stopPropagation(); setColorMode('system'); }}>
                                    <div className={`w-20 h-14 rounded overflow-hidden border-2 transition-colors ${colorMode === 'system' ? 'border-os-accent ring-2 ring-os-accent/20' : 'border-transparent group-hover:border-os-border'}`}>
                                        <div className="w-full h-full flex bg-gradient-to-br from-blue-100 to-blue-200">
                                            <div className="w-1/2 h-full bg-white p-1 flex items-start gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                            </div>
                                            <div className="w-1/2 h-full bg-[#1c1c1e] p-1 flex gap-1 justify-end">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[12px] font-medium ${colorMode === 'system' ? 'text-os-panel-text' : 'text-os-text/60'}`}>{t('settings.appearance.auto')}</span>
                                </button>
                                {/* Light */}
                                <button className="flex flex-col items-center gap-2 cursor-pointer group outline-none" onClick={() => setColorMode('light')} onPointerDown={(e) => { e.stopPropagation(); setColorMode('light'); }}>
                                    <div className={`w-20 h-14 rounded overflow-hidden border-2 transition-colors ${colorMode === 'light' ? 'border-os-accent ring-2 ring-os-accent/20' : 'border-transparent group-hover:border-os-border'}`}>
                                        <div className="w-full h-full flex bg-gradient-to-br from-blue-100 to-blue-200">
                                            <div className="w-full h-full bg-white p-1 flex items-start gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[12px] font-medium ${colorMode === 'light' ? 'text-os-panel-text' : 'text-os-text/60'}`}>{t('settings.appearance.light')}</span>
                                </button>
                                {/* Dark */}
                                <button className="flex flex-col items-center gap-2 cursor-pointer group outline-none" onClick={() => setColorMode('dark')} onPointerDown={(e) => { e.stopPropagation(); setColorMode('dark'); }}>
                                    <div className={`w-20 h-14 rounded overflow-hidden border-2 transition-colors ${colorMode === 'dark' ? 'border-os-accent ring-2 ring-os-accent/20' : 'border-transparent group-hover:border-os-border'}`}>
                                        <div className="w-full h-full flex bg-gradient-to-br from-slate-700 to-slate-900">
                                            <div className="w-full h-full bg-[#1c1c1e] p-1 flex gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[12px] font-medium ${colorMode === 'dark' ? 'text-os-panel-text' : 'text-os-text/60'}`}>{t('settings.appearance.dark')}</span>
                                </button>
                            </div>
                        </SettingGroup>

                        <SettingGroup title={t('settings.appearance.theme_title')} description={t('settings.appearance.theme_description')}>
                            <div className="p-4 grid grid-cols-3 gap-3">
                                {[
                                    { id: 'light-minimal', name: 'Light Minimal', bg: '#F3F4F6', panel: '#FFFFFF', accent: '#3B82F6' },
                                    { id: 'dark-pro', name: 'Dark Pro', bg: '#111827', panel: '#1F2937', accent: '#0A84FF' },
                                    { id: 'dracula', name: 'Dracula', bg: '#282A36', panel: '#191A21', accent: '#FF79C6' },
                                    { id: 'nord', name: 'Nord', bg: '#2E3440', panel: '#3B4252', accent: '#88C0D0' },
                                    { id: 'retro-95', name: 'Retro 95', bg: '#008080', panel: '#C0C0C0', accent: '#000080' },
                                    { id: 'solar-dark', name: 'Solar Dark', bg: '#002B36', panel: '#073642', accent: '#268BD2' },
                                    { id: 'yaru', name: 'Yaru', bg: '#300A24', panel: '#111111', accent: '#E95420' },
                                    { id: 'gruvbox', name: 'Gruvbox', bg: '#282828', panel: '#1D2021', accent: '#FE8019' },
                                    { id: 'synthwave-84', name: 'Synthwave 84', bg: '#1A0B2E', panel: '#11051F', accent: '#FF2A6D' },
                                    { id: 'xp', name: 'Windows XP', bg: '#004A99', panel: '#0053E1', accent: '#41941A' },
                                ].map((t) => {
                                    const isSelected = osTheme === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setOsTheme(t.id)}
                                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${isSelected ? 'border-os-accent ring-2 ring-os-accent/20' : 'border-os-border hover:border-os-accent/50'}`}
                                        >
                                            {/* Vista previa mini de paleta */}
                                            <div className="w-full h-10 rounded overflow-hidden flex" style={{ background: t.bg }}>
                                                <div className="w-1/3 h-full" style={{ background: t.panel }} />
                                                <div className="flex-1 h-full flex items-end p-1">
                                                    <div className="w-4 h-2 rounded-sm" style={{ background: t.accent }} />
                                                </div>
                                            </div>
                                            <span className={`text-[11px] font-medium text-center leading-tight ${isSelected ? 'text-os-accent' : 'text-os-text'}`}>
                                                {t.name}
                                            </span>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-os-accent" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </SettingGroup>

                    </div>
                )}

                {activeTab === 'desktop' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <SettingGroup title={t('settings.desktop.title')}>
                            <SettingRow label={t('settings.desktop.animations')}>
                                <SegmentedControl
                                    value={animation}
                                    onChange={setAnimation}
                                    className="w-[200px]"
                                    options={[
                                        { id: 'disabled', label: t('settings.desktop.disabled') },
                                        { id: 'enabled', label: t('settings.desktop.enabled') },
                                    ]}
                                />
                            </SettingRow>
                            <SettingRow label={t('settings.desktop.screensaver')} isLast>
                                <SegmentedControl
                                    value={screensaver}
                                    onChange={setScreensaver}
                                    className="w-[200px]"
                                    options={[
                                        { id: 'disabled', label: t('settings.desktop.disabled') },
                                        { id: 'enabled', label: t('settings.desktop.enabled') },
                                    ]}
                                />
                            </SettingRow>
                        </SettingGroup>
                    </div>
                )}

                {activeTab === 'wallpaper' && (
                    <div className="max-w-3xl mx-auto">
                        <SettingGroup title={t('settings.wallpaper.title')}>
                            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {DESKTOP_BACKGROUNDS.map((bg) => {
                                    const isSelected = desktopBackground === bg.id;
                                    let bgName = bg.name;
                                    if (bg.id === 'dinamic') bgName = t('settings.wallpaper.bg_dinamic');
                                    else if (bg.id === 'space') bgName = t('settings.wallpaper.bg_space');
                                    else if (bg.id === 'montania') bgName = t('settings.wallpaper.bg_mountain');
                                    else if (bg.id === 'ciudad') bgName = t('settings.wallpaper.bg_city');
                                    else if (bg.id === 'cordillera') bgName = t('settings.wallpaper.bg_mountain_range');

                                    return (
                                        <button
                                            key={bg.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDesktopBackground(bg.id);
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                setDesktopBackground(bg.id);
                                            }}
                                            className="flex flex-col items-center gap-1 cursor-pointer group outline-none"
                                        >
                                            <div className={`w-full aspect-video rounded-md overflow-hidden border transition-all relative ${isSelected
                                                ? 'border-blue-500 ring-2 ring-blue-500/30'
                                                : 'border-os-border group-hover:border-os-accent/50'
                                                }`}>
                                                <img
                                                    src={bg.image}
                                                    alt={bg.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                        <div className="bg-blue-500 text-white p-1 rounded-full shadow-md">
                                                            <Check size={16} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[12px] font-medium text-center ${isSelected ? 'text-os-accent' : 'text-os-text'}`}>
                                                {bgName}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </SettingGroup>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <SettingGroup title={t('settings.system.title')} description={t('settings.system.description')}>
                            <SettingRow label={t('settings.system.language')}>
                                <div className="text-[13.5px] font-medium text-os-panel-text mr-4 flex items-center">
                                    <Globe size={16} className="text-os-text mr-2" />
                                    {t('taskbar.language')}
                                </div>
                            </SettingRow>
                            <SettingRow label={t('settings.system.restart')} isLast>
                                <button
                                    onClick={() => {
                                        sessionStorage.removeItem('hasBooted');
                                        window.location.reload();
                                    }}
                                    className="bg-os-accent hover:bg-os-accent/90 text-white font-medium text-[13px] px-4 py-1.5 rounded-md transition-colors shadow-sm"
                                >
                                    {t('settings.system.reload')}
                                </button>
                            </SettingRow>
                        </SettingGroup>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
            .custom-scrollbar-hidden::-webkit-scrollbar { display: none; }
            .custom-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        </div>
    );
}
