'use client';

import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useOS, AppWindow } from '@/context/OSContext';
import { X, Minus, Square } from 'lucide-react';
import { useIsTablet, useIsMobile } from '@/hooks/useMediaQuery';

export default function Window({ window: w }: { window: AppWindow }) {
    const { focusWindow, minimizeWindow, maximizeWindow, closeWindow, updateWindowPosition, updateWindowSize } = useOS();
    const controls = useDragControls();
    const windowRef = useRef<HTMLDivElement>(null);
    const isTablet = useIsTablet();
    const isMobile = useIsMobile();

    // Controlador de redimensionamiento
    const startResize = (e: React.PointerEvent) => {
        if (w.resizable === false || w.maximized) return;
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = w.size.width;
        const startHeight = w.size.height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY));
            updateWindowSize(w.id, { width: newWidth, height: newHeight });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <motion.div
            ref={windowRef}
            className={`absolute top-0 left-0 flex flex-col overflow-hidden bg-os-panel text-os-panel-text rounded-xl shadow-2xl dark:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.7)] border border-os-border ${w.minimized ? 'hidden' : ''
                }`}
            style={{ zIndex: w.zIndex }}
            initial={{
                x: w.position.x,
                y: w.position.y,
                width: w.size.width,
                height: w.size.height,
                scale: 0.9,
                opacity: 0,
            }}
            animate={
                isMobile
                    ? {
                        x: 0,
                        y: 0,
                        width: '100vw',
                        height: 'calc(100vh - 84px)', // Espacio para el dock inferior en pantallas pequeñas
                        scale: 1,
                        opacity: 1,
                    }
                    : isTablet
                        ? {
                            x: 12,
                            y: 12,
                            width: 'calc(100vw - 24px)',
                            height: 'calc(100vh - 100px)', // Espacio para el dock inferior en tablet
                            scale: 1,
                            opacity: 1,
                        }
                        : w.maximized
                            ? {
                                x: 0,
                                y: isTablet ? 0 : 32, // Compensar altura del TopBar (32px)
                                width: '100vw',
                                height: isTablet ? '100%' : 'calc(100vh - 32px)',
                                scale: 1,
                                opacity: 1,
                            }
                            : {
                                x: w.position.x,
                                y: w.position.y,
                                width: w.size.width,
                                height: w.size.height,
                                scale: 1,
                                opacity: 1,
                            }
            }
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            drag={!w.maximized && !isTablet}
            dragListener={false}
            dragControls={controls}
            dragMomentum={false}
            onDragEnd={(event, info) => {
                const rect = windowRef.current?.getBoundingClientRect();
                if (rect) {
                    updateWindowPosition(w.id, { x: rect.left, y: rect.top });
                }
            }}
            onPointerDown={() => focusWindow(w.id)}
        >
            {/* Barra de título */}
            <div
                className={`flex items-center justify-between px-3 py-2 bg-os-titlebar border-b border-os-border ${isTablet ? '' : 'cursor-move'} select-none transition-colors`}
                onPointerDown={(e) => {
                    focusWindow(w.id);
                    if (!isTablet) controls.start(e);
                }}
                onDoubleClick={() => !isTablet && maximizeWindow(w.id)}
            >
                {/* Botones de semáforo */}
                <div className="flex space-x-2">
                    <button
                        className="flex items-center justify-center w-3.5 h-3.5 bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeWindow(w.id);
                        }}
                    >
                        <X size={10} className="text-red-900 opacity-0 hover:opacity-100" />
                    </button>
                    <button
                        className="flex items-center justify-center w-3.5 h-3.5 bg-yellow-500 rounded-full hover:bg-yellow-600 focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            minimizeWindow(w.id);
                        }}
                    >
                        <Minus size={10} className="text-yellow-900 opacity-0 hover:opacity-100" />
                    </button>
                    <button
                        className="flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            maximizeWindow(w.id);
                        }}
                    >
                        <Square size={8} className="text-green-900 opacity-0 hover:opacity-100" />
                    </button>
                </div>
                <div className="flex-1 text-sm font-semibold text-center text-os-titlebar-text transition-colors">
                    {w.title}
                </div>
                <div className="w-12" />
            </div>

            {/* Contenido de la ventana */}
            <div className="flex-1 overflow-auto bg-os-panel relative transition-colors">
                {w.content}
            </div>

            {/* Controlador de redimensionamiento */}
            {w.resizable !== false && !w.maximized && !isTablet && (
                <div
                    className="flex md:hidden lg:flex absolute bottom-0 right-0 w-5 h-5 cursor-se-resize items-end justify-end p-1 z-50"
                    onPointerDown={startResize}
                >
                    {/* Indicador visual de agarre */}
                    <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 rounded-br-[2px] opacity-70"></div>
                </div>
            )}
        </motion.div>
    );
}
