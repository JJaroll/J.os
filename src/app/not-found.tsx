import React from 'react';
import Link from 'next/link';
import { TriangleAlert, Terminal } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-os-bg text-os-text font-sans p-4 transition-colors">

            <div className="max-w-md w-full bg-os-panel border-2 border-os-border shadow-[8px_8px_0px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Barra de título del error */}
                <div className="bg-red-600 px-4 py-2 flex items-center gap-2 border-b-2 border-os-border">
                    <TriangleAlert size={18} className="text-white" strokeWidth={2.5} />
                    <span className="text-white font-bold text-sm tracking-wide">FATAL_ERROR_404</span>
                </div>

                {/* Contenido de la ventana */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center">
                    <Terminal size={48} className="text-os-text/50 mb-4" strokeWidth={1.5} />

                    <h2 className="text-2xl font-bold mb-2 text-os-panel-text">
                        Directorio no encontrado
                    </h2>

                    <p className="text-os-text/70 mb-8 text-sm leading-relaxed">
                        El proceso intentó acceder a una ruta de memoria o archivo que no existe en este sistema. Es posible que el archivo haya sido movido, eliminado, o que la URL esté mal escrita.
                    </p>

                    <div className="bg-os-bg border border-os-border p-3 rounded w-full mb-8 font-mono text-xs text-left text-os-text/60 overflow-hidden">
                        <p>{'>'} ERR_CODE: 404_NOT_FOUND</p>
                        <p>{'>'} SYSTEM: J.OS_CORE</p>
                        <p className="animate-pulse">{'>'} Awaiting user input_</p>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-2 bg-[#f0a92b] hover:bg-[#eab308] text-black font-bold text-sm border-2 border-black rounded-md shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] transition-all"
                    >
                        Volver al Sistema
                    </Link>
                </div>
            </div>

        </div>
    );
}