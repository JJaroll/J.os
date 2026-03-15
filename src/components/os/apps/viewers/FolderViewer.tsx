'use client';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface FolderViewerProps {
    title: string;
}

const ITEMS = [
    { name: 'horizon_measurement_001.png', src: '/papelera/horizonte.png', href: '/papelera/horizon_measurement_001.png' },
    { name: 'NASA_Internal_Leak.mp4', src: '/papelera/video1.png', href: '/papelera/NASA_Internal_Leak.mp4' },
    { name: 'Laser_Across_Lake_Curvature_Test.pdf', src: '/papelera/laser.png', href: '/papelera/Laser_Across_Lake_Curvature_Test.pdf' },
    { name: 'Geodesic_Refraction_Analysis_v4.pdf', src: '/papelera/curva.png', href: '/papelera/Geodesic_Refraction_Analysis_v4.pdf' },
    { name: 'antarctica_ice_wall_map.png', src: '/papelera/antartica.png', href: '/papelera/antarctica_ice_wall_map.png' },
    { name: 'Antarctica_perimeter_security_plan.pdf', src: '/papelera/blueprint.png', href: '/papelera/antarctica_perimeter_security_plan.pdf' },
    { name: 'Antarctica_perimeter_security_plan_2.pdf', src: '/papelera/blueprint_2.png', href: '/papelera/antarctica_perimeter_security_plan_v2.pdf' },
    { name: 'water_level_test.mp4', src: '/papelera/video2.png', href: '/papelera/water_level_test.mp4' },
];

export default function FolderViewer({ title }: FolderViewerProps) {
    const { t } = useLanguage();

    return (
        <div className="flex w-full h-full bg-os-bg text-os-panel-text font-sans text-sm select-none">
            <div className="w-[220px] flex-shrink-0 border-r border-os-border flex flex-col p-4 bg-os-panel/60">
                <div className="bg-os-panel border border-os-border rounded p-3 shadow-sm mb-4">
                    <h3 className="font-bold flex justify-between items-center text-os-panel-text mb-2 pb-2 border-b border-os-border">
                        {title}
                    </h3>
                    <p className="text-os-text/80 text-xs leading-relaxed">
                        {t('folder_viewer.about_text')}
                    </p>
                </div>

                <div className="bg-os-panel border border-os-border rounded p-3 shadow-sm">
                    <h3 className="font-bold flex justify-between items-center text-os-panel-text mb-2 pb-2 border-b border-os-border">
                        {t('folder_viewer.disclaimer_title')}
                    </h3>
                    <p className="text-os-text/80 text-xs leading-relaxed">
                        {t('folder_viewer.disclaimer_text')}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-os-bg p-6">
                <div className="flex flex-wrap gap-4 items-start">
                    {ITEMS.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center w-28 p-2 rounded hover:bg-os-panel/40 transition-colors cursor-pointer group no-underline decoration-transparent"
                        >
                            <img
                                src={item.src}
                                alt={item.name}
                                className="w-24 h-24 object-cover mb-2 border border-os-border shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <span className="text-xs text-center text-os-text/80 break-words leading-tight w-full group-hover:text-os-panel-text">
                                {item.name}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
