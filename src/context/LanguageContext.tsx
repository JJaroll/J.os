'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

export type Language = 'es' | 'en' | 'ja';

type Dictionary = Record<string, any>;

const dictionaries: Record<Language, Dictionary> = {
    es,
    en,
    ja,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // Inicializar en español por defecto
    const [language, setLanguageState] = useState<Language>('es');
    const [isHydrated, setIsHydrated] = useState(false);

    // actulización en caliente
    useEffect(() => {
        const storedLang = localStorage.getItem('jos_lang') as Language;
        if (storedLang && ['es', 'en', 'ja'].includes(storedLang)) {
            setLanguageState(storedLang);
        }
        setIsHydrated(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('jos_lang', lang);
    };

    const t = (key: string): string => {
        const dict = dictionaries[language];
        const keys = key.split('.');
        let value: any = dict;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        if (typeof value === 'string') {
            return value;
        }

        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
    }
    return context;
};
