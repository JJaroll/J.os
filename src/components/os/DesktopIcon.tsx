'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import * as ContextMenu from '@radix-ui/react-context-menu';

export interface AppIconData {
    id: string;
    label: string;
    icon: React.ReactNode;
    windowId?: string;
}

interface DesktopIconProps {
    app: AppIconData;
    initialPosition: { x?: number; y: number; right?: number };
    savedOffset?: { deltaX: number; deltaY: number };
    onPositionChange?: (id: string, deltaX: number, deltaY: number) => void;
    onDoubleClick?: () => void;
    constraintsRef: React.RefObject<HTMLDivElement | null>;
    isTablet?: boolean;
}

export default function DesktopIcon({
    app,
    initialPosition,
    savedOffset,
    onPositionChange,
    onDoubleClick,
    constraintsRef,
    isTablet
}: DesktopIconProps) {
    const [isDragging, setIsDragging] = useState(false);

    const x = useMotionValue(savedOffset?.deltaX || 0);
    const y = useMotionValue(savedOffset?.deltaY || 0);

    // cargar posicion guardada
    useEffect(() => {
        if (savedOffset) {
            x.set(savedOffset.deltaX);
            y.set(savedOffset.deltaY);
        }
    }, [savedOffset, x, y]);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        if (onPositionChange) {
            onPositionChange(app.id, x.get(), y.get());
        }
    };

    return (
        <motion.li
            className={`absolute flex flex-col items-center justify-center w-24 gap-2 cursor-pointer ${isDragging ? 'z-50' : 'z-0'}`}
            style={{
                ...(initialPosition.x !== undefined ? { left: initialPosition.x } : {}),
                ...(initialPosition.right !== undefined ? { right: initialPosition.right } : {}),
                top: initialPosition.y,
                x,
                y
            }}
            drag
            dragMomentum={false}
            dragConstraints={constraintsRef}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05, opacity: 0.8 }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick?.();
            }}
        >
            {isTablet ? (
                <div
                    className="flex flex-col items-center justify-center select-none w-full h-full p-1 rounded-md transition-colors hover:bg-os-hover/50 dark:hover:bg-os-panel/10 active:bg-gray-300/50 dark:active:bg-os-panel/20 group drop-shadow-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        // doble click en celular abre la app
                    }}
                >
                    <div className="flex items-center justify-center pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {React.cloneElement(app.icon as React.ReactElement<any>, { strokeWidth: 1.5 })}
                    </div>
                    <span className="mt-1 text-[13px] font-medium text-center text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_90%)] px-1.5 py-0.5 rounded leading-tight max-w-full break-words group-hover:bg-os-accent group-hover:text-white group-hover:drop-shadow-none pointer-events-none transition-colors">
                        {app.label}
                    </span>
                </div>
            ) : (
                <ContextMenu.Root>
                    <ContextMenu.Trigger asChild>
                        <div className="flex flex-col items-center justify-center select-none w-full h-full p-1 rounded-md transition-colors hover:bg-os-hover/50 dark:hover:bg-os-panel/10 active:bg-gray-300/50 dark:active:bg-os-panel/20 group drop-shadow-md">
                            <div className="flex items-center justify-center pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                {React.cloneElement(app.icon as React.ReactElement<any>, { strokeWidth: 1.5 })}
                            </div>
                            <span className="mt-1 text-[13px] font-medium text-center text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_90%)] px-1.5 py-0.5 rounded leading-tight max-w-full break-words group-hover:bg-os-accent group-hover:text-white group-hover:drop-shadow-none pointer-events-none transition-colors">
                                {app.label}
                            </span>
                        </div>
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal>
                        <ContextMenu.Content className="z-[10000] min-w-[200px] bg-os-panel rounded-lg py-1 shadow-xl dark:shadow-[0px_4px_16px_rgba(0,0,0,0.5)] border border-os-border text-os-panel-text font-medium text-sm animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                            <ContextMenu.Item
                                className="flex items-center px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white dark:hover:text-white group"
                                onSelect={() => onDoubleClick?.()}
                            >
                                Abrir en nueva ventana
                            </ContextMenu.Item>
                            <ContextMenu.Item
                                className="flex items-center px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white dark:hover:text-white group"
                                onSelect={() => window.open(`/?app=${app.id}`, '_blank')}
                            >
                                Abrir en nueva pestaña
                            </ContextMenu.Item>
                            <ContextMenu.Item
                                className="flex items-center px-4 py-1.5 outline-none cursor-pointer hover:bg-os-accent hover:text-white dark:hover:text-white group"
                                onSelect={() => {
                                    if (typeof window !== 'undefined') {
                                        navigator.clipboard.writeText(`${window.location.origin}/?app=${app.id}`);
                                    }
                                }}
                            >
                                Copiar enlace
                            </ContextMenu.Item>
                        </ContextMenu.Content>
                    </ContextMenu.Portal>
                </ContextMenu.Root>
            )}
        </motion.li>
    );
}
