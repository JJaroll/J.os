import React from 'react';
import { useOS } from '@/context/OSContext';
import { useLanguage } from '@/context/LanguageContext';
import TextViewer from '@/components/os/apps/viewers/TextViewer';

export default function AboutWindow() {
  const { openWindow } = useOS();
  const { t, language } = useLanguage();

  const getCreditsText = () => {
    if (language === 'en') {
      return `================================================================
                    J.OS v1.0.0 - CREDITS
================================================================

This web desktop environment would not be possible without the incredible 
work of the open-source community, scientific agencies, and independent creators. 

All recognition and gratitude to:

[ ENGINE & ARCHITECTURE ]
• Next.js & React: The foundation this interface runs on.
• Tailwind CSS: For making window design not a torture.
• Lucide React: For the beautiful and consistent system iconography.

[ MEDIA & WALLPAPERS ]
• NASA, ESA, CSA, and STScI: For the stunning images from the 
  James Webb Space Telescope (Public Domain).
• Elementary OS Community & Photographers (Unsplash/CC0): 
  For the minimalist and professional wallpapers.

[ EMULATED SOFTWARE ]
• JS-DOS (js-dos.com): For their brilliant WebAssembly DOS emulator, 
  which allows running classic software in the browser.
• id Software: For DOOM (1993) - Shareware Version. A milestone in 
  programming history.

[ AUDIO & STREAMING ]
• YouTube API & React-YouTube: Invisible playback engine.
• Artists and Creators of the Playlist: The Midnight, FM-84, 
  Gunship, Timecop1983, Nina, FM Attack, and more.
• Os startup by jjwoosh -- https://freesound.org/s/735362/ -- License: Creative Commons 0

[ INSPIRATION ]
• Apple, Inc.
• Microsoft, Inc.
• 1995-1998

================================================================
        Developed with ☕ and ❤️ by Jarol Espinoza
        Coronel, Chile | github.com/JJaroll
================================================================`;
    }
    if (language === 'ja') {
      return `================================================================
                    J.OS v1.0.0 - クレジット
================================================================

このWebデスクトップ環境は、オープンソースコミュニティ、科学機関、 
そして独立したクリエイターの素晴らしい仕事なしには実現できませんでした。

すべての認識と感謝を：

[ エンジンとアーキテクチャ ]
• Next.js & React: このインターフェースが実行される基盤。
• Tailwind CSS: ウィンドウのデザインを苦痛にしないために。
• Lucide React: 美しく一貫したシステムアイコンのために。

[ メディアと壁紙 ]
• NASA, ESA, CSA, および STScI: 
  ジェイムズ・ウェッブ宇宙望遠鏡からの素晴らしい画像（パブリックドメイン）。
• Elementary OS コミュニティ & 写真家 (Unsplash/CC0): 
  ミニマリストでプロフェッショナルな壁紙のために。

[ エミュレートされたソフトウェア ]
• JS-DOS (js-dos.com): 素晴らしい WebAssembly DOS エミュレーター。
• id Software: DOOM (1993) - Shareware Version。
  プログラミングの歴史におけるマイルストーン。

[ オーディオとストリーミング ]
• YouTube API & React-YouTube: 目に見えない再生エンジン。
• プレイリストのアーティストとクリエイター: The Midnight, FM-84, 
  Gunship, Timecop1983, Nina, FM Attack など。
• Os startup by jjwoosh -- https://freesound.org/s/735362/ -- ライセンス: Creative Commons 0

[ インスピレーション ]
• Apple, Inc.
• Microsoft, Inc.
• 1995-1998

================================================================
        ☕ と ❤️ を込めて ハロル・エスピノザ が開発
        チリ・コロネル | github.com/JJaroll
================================================================`;
    }
    return `================================================================
                    J.OS v1.0.0 - CRÉDITOS
================================================================

Este entorno de escritorio web no sería posible sin el trabajo 
increíble de la comunidad de código abierto, agencias científicas 
y creadores independientes. 

Todo el reconocimiento y agradecimiento a:

[ MOTOR Y ARQUITECTURA ]
• Next.js & React: La base sobre la que corre esta interfaz.
• Tailwind CSS: Por hacer que diseñar ventanas no sea una tortura.
• Lucide React: Por la hermosa y consistente iconografía del sistema.

[ MEDIOS Y FONDOS DE PANTALLA ]
• NASA, ESA, CSA, and STScI: Por las impresionantes imágenes del 
  Telescopio Espacial James Webb (Dominio Público).
• Comunidad de Elementary OS & Fotógrafos (Unsplash/CC0): 
  Por los fondos de pantalla minimalistas y profesionales.

[ SOFTWARE EMULADO ]
• JS-DOS (js-dos.com): Por su brillante emulador DOS en WebAssembly, 
  que permite ejecutar software clásico en el navegador.
• id Software: Por DOOM (1993) - Shareware Version. Un hito en 
  la historia de la programación.

[ AUDIO Y STREAMING ]
• YouTube API & React-YouTube: Motor invisible de reproducción.
• Artistas y Creadores de la Playlist: The Midnight, FM-84, 
  Gunship, Timecop1983, Nina, FM Attack, y más.
• Os startup by jjwoosh -- https://freesound.org/s/735362/ -- License: Creative Commons 0

[ INSPIRACIÓN ]
• Apple, Inc.
• Microsoft, Inc.
• 1995-1998

================================================================
        Desarrollado con ☕ y ❤️ por Jarol Espinoza
        Coronel, Chile | github.com/JJaroll
================================================================`;
  };

  const getWhyOSText = () => {
    if (language === 'en') {
      return `A traditional portfolio shows you know how to build a static page. Building an Operating System in the browser proves you master software engineering in the frontend.

I decided to create J.OS because I wanted a project that forced me to solve real architecture problems: global state management in React, complex DOM manipulation (like the dragging system and window z-index), keyboard focus management when integrating emulator iframes, and the use of native APIs like Canvas for the drawing application. It is, essentially, the practical demonstration that I don't just write code that looks good, but code that supports complex interaction logic.`;
    }
    if (language === 'ja') {
      return `伝統的なポートフォリオは、静的なページを構築できることを示します。ブラウザにオペレーティングシステムを構築することは、フロントエンドのソフトウェアエンジニアリングを習得していることを証明します。

J.OSの作成を決めたのは、Reactのグローバル状態管理、複雑なDOM操作（ドラッグシステムやウィンドウのZインデックスなど）、エミュレーターのiframeを統合する際のキーボードフォーカス管理、描画アプリケーションのCanvasなどのネイティブAPIの使用といった、実際のアーキテクチャ問題を解決せざるを得ないプロジェクトが欲しかったからです。本質的に、これは見栄えの良いコードを書くだけでなく、複雑なインタラクションロジックをサポートするコードを書くという実用的なデモンストレーションです。`;
    }
    return `Un portafolio tradicional demuestra que sabes maquetar una página estática. Construir un Sistema Operativo en el navegador demuestra que dominas la ingeniería de software en el frontend.

Decidí crear J.OS porque quería un proyecto que me obligara a resolver problemas reales de arquitectura: manejo de estado global en React, manipulación compleja del DOM (como el sistema de arrastre y el z-index de las ventanas), gestión del foco del teclado al integrar iframes de emuladores, y el uso de APIs nativas como Canvas para la aplicación de dibujo. Es, en esencia, la demostración práctica de que no solo escribo código que se ve bien, sino código que soporta lógica compleja de interacción.`;
  };

  const handleOpenCredits = () => {
    openWindow(
      'credits',
      `${t('about.credits')}.txt`,
      <TextViewer title={t('about.credits')} initialContent={getCreditsText()} />,
      { size: { width: 550, height: 600 } }
    );
  };

  const handleOpenWhyOS = (e: React.MouseEvent) => {
    e.preventDefault();
    openWindow(
      'why_os',
      `Why_OS.txt`,
      <TextViewer title={t('about.why_os_title')} initialContent={getWhyOSText()} />,
      { size: { width: 450, height: 500 } }
    );
  };

  return (
    <div className="flex flex-col items-center p-5 bg-os-bg text-os-panel-text font-sans min-h-[100%] transition-colors">
      <div className="w-full max-w-[400px] aspect-[16/9] bg-yellow-100/50 border border-os-border rounded overflow-hidden shadow-sm flex items-center justify-center mb-4 relative transition-colors">
        <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-48 h-32 bg-os-panel border border-gray-400 dark:border-slate-600 rounded-sm shadow-md flex overflow-hidden transition-colors">
            <div className="w-12 h-full bg-os-hover dark:bg-[#2A2B2F] border-r border-os-border dark:border-slate-600 flex flex-col items-center py-2 space-y-2 transition-colors">
              <div className="w-6 h-6 bg-gray-400 dark:bg-slate-500 rounded-full transition-colors"></div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-slate-600 rounded-sm transition-colors"></div>
              <div className="w-6 h-6 bg-gray-300 dark:bg-slate-600 rounded-sm transition-colors"></div>
            </div>
            <div className="flex-1 bg-os-panel p-2 transition-colors">
              <div className="w-3/4 h-2 bg-blue-500 dark:bg-blue-600 rounded-sm mb-2 transition-colors"></div>
              <div className="w-1/2 h-2 bg-os-hover dark:bg-slate-700 rounded-sm mb-1 transition-colors"></div>
              <div className="w-full h-8 bg-os-accent/20 rounded border border-blue-200 dark:border-blue-800/50 mt-4 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-os-panel-text transition-colors mb-2">{t('about.title')}</h1>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 pointer-events-none select-none">
        <img src="https://img.shields.io/badge/version-v1.0.0-blue?style=flat-square" alt="Version 1.0.0" className="h-5" />
        <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" className="h-5" />
        <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" className="h-5" />
        <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" className="h-5" />
      </div>
      <br />

      <p className="text-[16px] italic font-medium text-os-panel-text/80 mb-6 transition-colors tracking-wide text-center">
        {t('about.bringing_pixels')}
      </p>

      <p className="text-[12px] italic font-medium text-os-panel-text/70 mb-6 transition-colors tracking-wide text-center">
        {t('about.portfolio')}
      </p>

      <div className="w-full">


        <div className="flex flex-col items-center space-y-4">

          <a href="#" onClick={handleOpenWhyOS} className="text-os-panel-text/80 hover:text-os-accent underline text-[14px] text-center leading-relaxed transition-colors" dangerouslySetInnerHTML={{ __html: t('about.why_os') }}>
          </a>

          <a href="https://github.com/JJaroll/J.os" className="text-os-panel-text/70 hover:text-os-accent underline text-sm transition-colors">
            {t('about.source_code')}
          </a>
        </div>

        <div className="flex justify-center mt-6 mb-4">
          <button
            onClick={handleOpenCredits}
            className="font-bold text-os-panel-text hover:text-os-accent hover:underline text-lg transition-colors cursor-pointer"
          >
            {t('about.credits')}
          </button>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs text-os-panel-text/60 transition-colors">
            {t('about.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
}
