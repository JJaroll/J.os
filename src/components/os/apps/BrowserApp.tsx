'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Globe } from 'lucide-react';

export default function BrowserApp() {
    const [url, setUrl] = useState('https://fosil.dev');
    const [inputUrl, setInputUrl] = useState('https://fosil.dev');
    const [isLoading, setIsLoading] = useState(true);

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();

        let finalUrl = inputUrl.trim();

        // Formato básico de URL
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            // Si parece un dominio típico, añadir https
            if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
                finalUrl = `https://${finalUrl}`;
            } else {
                // De lo contrario, tratarlo como una búsqueda
                finalUrl = `https://www.duckduckgo.com/?q=${encodeURIComponent(finalUrl)}`;
            }
        }

        setInputUrl(finalUrl);
        setUrl(finalUrl);
        setIsLoading(true);
    };

    const handleHome = () => {
        const homeUrl = 'https://www.duckduckgo.com/';
        setInputUrl(homeUrl);
        setUrl(homeUrl);
        setIsLoading(true);
    };

    const handleRefresh = () => {
        setIsLoading(true);
        // Truco para forzar la recarga del iframe
        const current = url;
        setUrl('');
        setTimeout(() => setUrl(current), 50);
    };

    return (
        <div className="flex flex-col w-full h-full bg-os-bg font-sans transition-colors overflow-hidden">

            {/* Pestaña del Navegador */}
            <div className="flex items-end px-2 pt-2 bg-os-titlebar shadow-xs h-10 shrink-0">
                <div className="flex items-center gap-2 max-w-[240px] px-3 py-1.5 bg-os-panel rounded-t-lg border-t border-l border-r border-os-border text-os-panel-text text-xs relative overflow-hidden group">
                    <Globe size={14} className="opacity-70 flex-shrink-0" />
                    <span className="truncate flex-1 font-medium z-10">{url.replace(/^https?:\/\//, '')}</span>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-os-accent w-full" />
                </div>
            </div>

            {/* Barra de Navegación */}
            <div className="flex items-center gap-2 px-3 py-2 bg-os-panel border-b border-os-border shadow-sm shrink-0">
                <div className="flex items-center gap-1 mr-1">
                    <button className="p-1.5 rounded-md text-os-panel-text opacity-50 hover:bg-os-hover hover:opacity-100 transition-colors" title="Atrás">
                        <ArrowLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button className="p-1.5 rounded-md text-os-panel-text opacity-50 hover:bg-os-hover hover:opacity-100 transition-colors" title="Adelante">
                        <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        className="p-1.5 rounded-md text-os-panel-text hover:bg-os-hover transition-colors"
                        onClick={handleRefresh}
                        title="Recargar"
                    >
                        <RotateCw size={16} strokeWidth={2.5} className={isLoading ? "animate-spin opacity-50" : ""} />
                    </button>
                    <button
                        className="p-1.5 rounded-md text-os-panel-text hover:bg-os-hover transition-colors ml-1"
                        onClick={handleHome}
                        title="Inicio"
                    >
                        <Home size={16} />
                    </button>
                </div>

                {/* Barra de direcciones */}
                <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-black/5 dark:bg-white/5 border border-os-border rounded-full px-3 py-1 hover:bg-black/10 dark:hover:bg-white/10 focus-within:bg-os-bg focus-within:ring-2 focus-within:ring-os-accent overflow-hidden transition-all shadow-inner">
                    <Search size={14} className="text-os-text opacity-50 mr-2 shrink-0" />
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[13px] text-os-panel-text placeholder:text-os-panel-text/50 w-full"
                        placeholder="Busca o ingresa una dirección web"
                    />
                </form>
            </div>

            {/* Banner de Advertencia */}
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-center shrink-0">
                <span className="text-yellow-700 dark:text-yellow-400 text-xs font-medium text-center">
                    Nota: Muchos sitios web modernos bloquean la incrustación mediante iframes (X-Frame-Options: DENY). Algunos sitios como Wikipedia o DuckDuckGo funcionarán.
                </span>
            </div>

            {/* Lienzo del Navegador (iframe) */}
            <div className="flex-1 relative bg-white dark:bg-gray-100">
                {isLoading && url !== '' && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-100 flex items-center justify-center pointer-events-none z-10">
                        <div className="w-6 h-6 border-2 border-os-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {url ? (
                    <iframe
                        src={url}
                        className="w-full h-full border-none m-0 p-0 block"
                        title="Vista del Navegador"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col text-gray-400">
                        <Globe size={48} className="opacity-20 mb-4" />
                        <p>Ingresa una URL para navegar</p>
                    </div>
                )}
            </div>

        </div>
    );
}
