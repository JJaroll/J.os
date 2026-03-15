import React from 'react';
import { Folder, FileText, Settings, Image as ImageIcon } from 'lucide-react';
import { AppIconData } from '@/components/os/DesktopIcon';

export const STATIC_ICONS: AppIconData[] = [
    {
        id: 'readme',
        label: 'README.md',
        icon: <FileText size={32} className="text-gray-700" />,
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: <Folder size={32} className="text-blue-500 fill-current" />,
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={32} className="text-gray-600" />,
    },
    {
        id: 'gallery',
        label: 'Gallery',
        icon: <ImageIcon size={32} className="text-purple-500" />,
    }
];
