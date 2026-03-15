'use client';

import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface GalleryImage {
    id: string;
    url: string;
    title: string;
}

const IMAGES: GalleryImage[] = [
    { id: '1', url: '/1.jpg', title: 'Noche @jjaroll.35mm' },
    { id: '2', url: '/2.jpg', title: 'Japón @jjaroll.35mm' },
    { id: '3', url: '/3.jpg', title: 'Cockatiel @jjaroll.35mm' },
    { id: '4', url: '/4.jpg', title: 'Jardín @jjaroll.35mm' },
    { id: '5', url: '/5.jpg', title: 'Jardín de Flores @jjaroll.35mm' },
    { id: '6', url: '/6.jpg', title: 'Tranvía @jjaroll.35mm' },
    { id: '7', url: '/7.jpg', title: 'Juegos infantiles @jjaroll.35mm' },
    { id: '8', url: '/8.jpg', title: 'Primate @jjaroll.35mm' },
];

export default function GalleryWindow() {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const { t } = useLanguage();

    return (
        <div className="flex flex-col w-full h-full bg-os-bg text-os-text font-sans transition-colors overflow-hidden">
            {/* Cabecera / Barra de herramientas */}
            <div className="flex items-center px-4 py-3 bg-os-panel border-b border-os-border transition-colors z-10">
                <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-os-text opacity-70" />
                    <span className="font-medium text-sm">{t('gallery.title')}</span>
                </div>
            </div>

            {/* Área de la Cuadrícula */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {IMAGES.map((img) => (
                        <div
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className="group relative aspect-square bg-os-panel border border-os-border rounded-xl overflow-hidden cursor-pointer hover:border-os-accent hover:shadow-md transition-all"
                        >
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white text-xs font-medium truncate">{img.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay del Visor de imágenes / Pantalla completa */}
            {selectedImage && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-full h-full max-w-5xl max-h-[85vh] p-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <p className="text-white/80 font-medium mt-4 text-center">{selectedImage.title}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
