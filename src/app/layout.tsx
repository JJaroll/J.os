import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono, VT323, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  variable: "--font-noto-jp",
  subsets: ["latin"],
});

// --- SEO METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL('https://www.jjaroll.dev'),

  title: {
    default: 'Jarol Espinoza | QA & AI Engineer | J.OS',
    template: '%s | Jarol Espinoza'
  },

  description: 'Explora J.OS: El ecosistema de Jarol Espinoza. Ingeniero especializado en QA Automation e Inteligencia Artificial.',

  keywords: [
    'Jarol Espinoza',
    'QA Automation Engineer',
    'AI Specialist',
    'Software Testing',
    'Inteligencia Artificial Aplicada',
    'Machine Learning',
    'J.OS Portfolio',
    'Ingeniería Informática',
    'Biobío Chile',
    'Calidad de Software',
    'Ingeniero de Software'
  ],

  authors: [{ name: 'Jarol Espinoza', url: 'https://github.com/JJaroll' }],
  creator: 'Jarol Espinoza',

  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://www.jjaroll.dev',
    title: 'Jarol Espinoza - QA & AI Engineering',
    description: 'Especialista en automatización de pruebas y soluciones de IA. Descubre mi enfoque técnico en el ecosistema J.OS.',
    siteName: 'J.OS Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Jarol Espinoza - QA & AI Engineering Portfolio',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Jarol Espinoza | QA & AI Specialist',
    description: 'Ingeniería enfocada en Calidad e Inteligencia Artificial.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// --- ESTRUCTURA DE DATOS (JSON-LD) ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jarol Espinoza Vásquez",
  "alternateName": "JJaroll",
  "url": "https://www.jjaroll.dev",
  "image": "https://www.jjaroll.dev/jjaroll-avatar.png",
  "jobTitle": "QA & AI Engineer",
  "description": "Ingeniero especializado en QA Automation e Inteligencia Artificial.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Concepción",
    "addressRegion": "Biobío",
    "addressCountry": "Chile"
  },
  "sameAs": [
    "https://github.com/JJaroll",
    "https://fosil.dev",
    "https://www.linkedin.com/in/jarolespinoza"
  ],
  "knowsAbout": [
    "Software Testing",
    "QA Automation",
    "Artificial Intelligence",
    "Next.js",
    "Machine Learning"
  ],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.jjaroll.dev",
    "name": "J.OS Portfolio"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${vt323.variable} ${notoSansJP.variable} antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}