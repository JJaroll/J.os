import React, { useRef } from 'react';

export default function DoomGame() {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const giveFocusToGame = () => {
        if (iframeRef.current) {
            iframeRef.current.focus();
        }
    };

    return (
        <div
            className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-b-lg"
            onClick={giveFocusToGame}
            onMouseEnter={giveFocusToGame}
        >
            <iframe
                ref={iframeRef}
                title="DOOM (JS-DOS)"
                src="https://js-dos.com/games/doom.exe.html"
                className="w-full h-full border-none"
                allow="autoplay; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                onLoad={giveFocusToGame}
            />
        </div>
    );
}