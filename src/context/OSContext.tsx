'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import DisplayOptionsWindow from '@/components/os/apps/DisplayOptionsWindow';

export interface AppWindow {
    id: string;
    title: string;
    content: React.ReactNode;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    minimized: boolean;
    maximized: boolean;
    resizable?: boolean;
}

interface OSContextType {
    windows: AppWindow[];
    activeWindowId: string | null;
    openWindow: (id: string, title: string, content: React.ReactNode, options?: Partial<AppWindow>) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
    updateWindowSize: (id: string, size: { width: number; height: number }) => void;
    closeAllWindows: () => void;
    restoreWindow: (id: string) => void;
    colorMode: string;
    setColorMode: (mode: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    osTheme: string;
    setOsTheme: (theme: string) => void;
    desktopBackground: string;
    setDesktopBackground: (bg: string) => void;
    screensaver: string;
    setScreensaver: (state: string) => void;
    animation: string;
    setAnimation: (state: string) => void;
    isScreensaverActive: boolean;
    setIsScreensaverActive: (active: boolean) => void;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error leyendo clave de localStorage "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error escribiendo clave de localStorage "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}

export function OSProvider({ children }: { children: React.ReactNode }) {
    const [windows, setWindows] = useState<AppWindow[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);

    const [colorMode, setColorMode] = useLocalStorage('os-colorMode', 'light');
    const [theme, setTheme] = useLocalStorage('os-theme', 'modern');
    const [osTheme, setOsTheme] = useLocalStorage('os-osTheme', 'dark-pro');
    const [desktopBackground, setDesktopBackground] = useLocalStorage('os-desktopBackground', 'dinamic');
    const [screensaver, setScreensaver] = useLocalStorage('os-screensaver', 'enabled');
    const [animation, setAnimation] = useLocalStorage('os-animation', 'enabled');

    const focusWindow = useCallback((id: string) => {
        setWindows(prev => {
            const maxZ = Math.max(10, ...prev.map(w => w.zIndex));
            return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
        });
        setActiveWindowId(id);
    }, []);

    const openWindow = useCallback((id: string, title: string, content: React.ReactNode, options?: Partial<AppWindow>) => {
        setWindows(prev => {
            const existing = prev.find(w => w.id === id);
            if (existing) {
                // Si ya existe: restaurar minimizada y traer al frente en el siguiente tick
                // (setTimeout evita mutaciones de estado anidadas durante el render)
                setTimeout(() => {
                    setWindows(current => current.map(window => window.id === id ? { ...window, minimized: false } : window));
                    focusWindow(id);
                }, 0);
                return prev;
            }

            const maxZ = Math.max(10, ...prev.map(w => w.zIndex));
            const newWindow: AppWindow = {
                id,
                title,
                content,
                zIndex: maxZ + 1,
                position: { x: Math.random() * 50 + 50, y: Math.random() * 50 + 50 },
                size: { width: 600, height: 400 },
                minimized: false,
                maximized: false,
                resizable: true,
                ...options
            };

            setTimeout(() => setActiveWindowId(id), 0);
            return [...prev, newWindow];
        });
    }, [focusWindow]);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (activeWindowId === id) setActiveWindowId(null);
    }, [activeWindowId]);

    const minimizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
        if (activeWindowId === id) setActiveWindowId(null);
    }, [activeWindowId]);

    const restoreWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false } : w));
        focusWindow(id);
    }, [focusWindow]);

    const maximizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
        focusWindow(id);
    }, [focusWindow]);

    const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, position } : w));
        focusWindow(id);
    }, [focusWindow]);

    const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, size } : w));
        focusWindow(id);
    }, [focusWindow]);

    const closeAllWindows = useCallback(() => {
        setWindows([]);
        setActiveWindowId(null);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        document.documentElement.setAttribute('data-theme', osTheme);
    }, [osTheme, colorMode]);

    return (
        <OSContext.Provider
            value={{
                windows, activeWindowId, openWindow, closeWindow, focusWindow,
                minimizeWindow, maximizeWindow, updateWindowPosition, updateWindowSize,
                closeAllWindows, restoreWindow, colorMode, setColorMode, theme, setTheme,
                osTheme, setOsTheme, desktopBackground, setDesktopBackground,
                screensaver, setScreensaver, animation, setAnimation,
                isScreensaverActive, setIsScreensaverActive
            }}
        >
            {children}
        </OSContext.Provider>
    );
}

export function useOS() {
    const context = useContext(OSContext);
    if (context === undefined) {
        throw new Error('useOS debe usarse dentro de un OSProvider');
    }
    return context;
}
