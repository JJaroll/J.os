import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'J.OS - Jarol Espinoza Portfolio',
        short_name: 'J.OS',
        description: 'Ecosistema profesional de Jarol Espinoza: Especialista en QA Automation e Inteligencia Artificial.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0097b2',
        theme_color: '#0097b2',
        icons: [
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable' as 'any',
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable' as 'any',
            },
        ],
    }
}