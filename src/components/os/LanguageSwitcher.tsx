'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';

const LANGUAGES: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'es', label: 'Español', flag: '🇨🇱' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

interface LanguageSwitcherProps {
    direction?: 'up' | 'down';
}

export default function LanguageSwitcher({ direction = 'down' }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // cerrar menu al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 hover:bg-os-hover px-2 py-1 rounded transition-colors text-[13px] font-medium"
                aria-label="Cambiar idioma"
            >
                <Globe size={14} />
                <span className="uppercase">{language}</span>
            </button>

            {isOpen && (
                <div className={`absolute ${direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-1'} right-0 min-w-[140px] bg-os-panel border border-os-border shadow-lg rounded-md py-1 z-[10005] animate-in fade-in zoom-in-95 text-os-panel-text`}>
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full text-left px-3 py-1.5 flex items-center space-x-3 hover:bg-os-accent hover:text-white transition-colors text-sm ${language === lang.code ? 'bg-os-hover' : ''}`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
