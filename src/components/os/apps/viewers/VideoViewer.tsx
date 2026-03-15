'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface VideoViewerProps {
    title: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function VideoViewer({ title }: VideoViewerProps) {
    const { t } = useLanguage();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [seeking, setSeeking] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (playing) {
                    setShowControls(false);
                }
            }, 3000);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => setShowControls(false));
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', () => setShowControls(false));
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [playing]);

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
        if (parseFloat(e.target.value) > 0) {
            setMuted(false);
        }
    };

    const handleToggleMuted = () => {
        setMuted(!muted);
    };

    const setPlaybackRateValue = (rate: number) => {
        setPlaybackRate(rate);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleProgress = (state: any) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current) {
            const target = e.target as HTMLInputElement;
            playerRef.current.seekTo(parseFloat(target.value));
        }
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const elapsedTime = formatTime(duration * played);
    const totalTime = formatTime(duration);

    return (
        <div ref={containerRef} className="flex flex-col w-full h-full bg-black text-white select-none relative group">
            {/* Video Container (YouTube Embed via react-player) */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black pb-0 cursor-pointer" onClick={handlePlayPause}>
                {mounted && <ReactPlayer
                    ref={playerRef}
                    url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="absolute top-0 left-0 pointer-events-none"
                    width="100%"
                    height="100%"
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    playbackRate={playbackRate}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    style={{ pointerEvents: 'none' }}
                    config={{
                        youtube: {
                            playerVars: {
                                showinfo: 0,
                                controls: 0,
                                rel: 0,
                                modestbranding: 1,
                                iv_load_policy: 3,
                                fs: 0,
                                disablekb: 1
                            } as any
                        }
                    }}
                />}
            </div>

            <div
                className={`absolute bottom-4 left-4 right-4 bg-[#e5e7da] text-[#333] rounded-md shadow-lg border border-[#c5c7ba] transition-opacity duration-300 p-2 px-4 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold font-mono w-24 text-center">{elapsedTime} / {totalTime}</span>
                    <div className="flex-1 h-3 relative flex items-center">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step="any"
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                            className="w-full h-full opacity-0 absolute top-0 left-0 z-10 cursor-pointer"
                        />
                        <div className="w-full h-full bg-white border border-[#c5c7ba] rounded relative pointer-events-none">
                            <div
                                className="absolute top-0 bottom-0 left-0 bg-[#a5a79a] border-r border-[#85877a] transition-all duration-75"
                                style={{ width: `${played * 100}%` }}
                            ></div>
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-black transition-all duration-75"
                                style={{ left: `calc(${played * 100}% - 4px)` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={handleToggleMuted} className="text-xl w-6 text-center hover:scale-110 transition-transform">
                            {muted || volume === 0 ? '🔇' : (volume > 0.5 ? '🔊' : '🔉')}
                        </button>
                        <div className="w-20 h-2 relative flex items-center group/volume">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step="any"
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full h-full opacity-0 absolute top-0 left-0 z-10 cursor-pointer"
                            />
                            <div className="w-full h-full bg-white border border-[#c5c7ba] rounded-full overflow-hidden pointer-events-none">
                                <div
                                    className="h-full bg-[#85877a] transition-all duration-75"
                                    style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            className="w-8 h-8 rounded-full border-2 border-[#85877a] flex items-center justify-center hover:bg-os-panel text-lg active:scale-95 transition-all text-[#333]"
                            onClick={() => {
                                if (playerRef.current) {
                                    playerRef.current.seekTo(0);
                                }
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                        </button>
                        <button
                            className="w-10 h-10 rounded-full border-2 border-[#85877a] flex items-center justify-center bg-os-panel hover:bg-os-bg text-xl font-bold shadow-sm active:scale-95 transition-all text-[#333]"
                            onClick={handlePlayPause}
                        >
                            {playing ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            )}
                        </button>
                        <button
                            className="w-8 h-8 rounded-full border-2 border-[#85877a] flex items-center justify-center hover:bg-os-panel text-lg active:scale-95 transition-all text-[#333]"
                            onClick={() => {
                                if (playerRef.current) {
                                    playerRef.current.seekTo(duration * 0.99);
                                }
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="border border-[#85877a] px-2 py-0.5 rounded text-xs bg-os-panel cursor-pointer font-bold hover:bg-os-bg active:scale-95 transition-all w-10 text-center text-[#333] outline-none">
                                    {playbackRate}x
                                </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    className="z-[10000] min-w-[140px] bg-[#f9f9f9] rounded-md py-1.5 shadow-xl border border-gray-200 text-[#333] font-medium animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 mb-1"
                                    sideOffset={5}
                                    align="center"
                                >
                                    <DropdownMenu.Label className="px-6 py-1.5 text-sm text-gray-500 font-normal">
                                        {t('video_viewer.playback_speed')}
                                    </DropdownMenu.Label>
                                    {[0.5, 1, 1.5, 2].map((rate) => (
                                        <DropdownMenu.Item
                                            key={rate}
                                            className="relative flex items-center px-8 py-1.5 text-sm outline-none cursor-pointer hover:bg-[#e6e6e6] transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPlaybackRateValue(rate);
                                            }}
                                        >
                                            {playbackRate === rate && (
                                                <span className="absolute left-2 flex items-center justify-center w-4 h-4 text-black">
                                                    <Check size={16} strokeWidth={2.5} />
                                                </span>
                                            )}
                                            {rate}x
                                        </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                        <button
                            className="text-lg w-8 h-8 flex items-center justify-center hover:bg-[#d5d7ca] rounded transition-colors text-[#333]"
                            onClick={handleFullscreen}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
