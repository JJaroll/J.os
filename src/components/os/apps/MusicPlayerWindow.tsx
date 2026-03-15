import React, { useState, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Music, ListMusic, X, Repeat, Shuffle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MusicPlayerWindow() {
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const { t } = useLanguage();

    // Nombres y Playlist
    const [currentTitle, setCurrentTitle] = useState<string>(t('music.title'));
    const [playlist, setPlaylist] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [titlesCache, setTitlesCache] = useState<Record<string, string>>({});

    // Controles Extendidos
    const [isLooping, setIsLooping] = useState(true);
    const [isShuffled, setIsShuffled] = useState(false);

    // YouTube Event Handlers
    const onReady = (event: YouTubeEvent) => {
        setPlayer(event.target);
        setIsReady(true);
        const pl = event.target.getPlaylist();
        if (pl) setPlaylist(pl);
    };

    const onStateChange = (event: YouTubeEvent) => {
        const state = event.data;
        const p = event.target;

        if (playlist.length === 0) {
            const pl = p.getPlaylist();
            if (pl) setPlaylist(pl);
        }

        if (state === 1 || state === 2 || state === 3) {
            const idx = p.getPlaylistIndex();
            setCurrentIndex(idx);

            const data = p.getVideoData();
            if (data && data.title) {
                setCurrentTitle(data.title);
                setCurrentVideoId(data.video_id);
                setTitlesCache(prev => ({ ...prev, [data.video_id]: data.title }));
            }
        }

        if (state === 0) {
            const currentIdx = p.getPlaylistIndex();
            if (isLooping && playlist.length > 0 && currentIdx === playlist.length - 1) {
                p.playVideoAt(0);
            }
        }

        if (state === 1) {
            setIsPlaying(true);
        } else if (state === 2 || state === 0) {
            setIsPlaying(false);
        }
    };

    const onError = (event: YouTubeEvent) => {
        console.warn("YouTube Player Error - Skipping track", event.data);
        if (event.target) {
            event.target.nextVideo();
        }
    };

    // Controles
    const togglePlay = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const nextTrack = () => {
        if (!player) return;
        player.nextVideo();
    };

    const prevTrack = () => {
        if (!player) return;
        player.previousVideo();
    };

    const toggleLoop = () => {
        if (!player) return;
        const newState = !isLooping;
        player.setLoop(newState);
        setIsLooping(newState);
    };

    const toggleShuffle = () => {
        if (!player) return;
        const newState = !isShuffled;
        player.setShuffle(newState);
        setIsShuffled(newState);
    };

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            listType: 'playlist',
            list: 'PLHQXJoLR6Xmx5sj9yOBD-FwXeTD6tMPEG',
            autoplay: 0,
            loop: 1,
        },
    };

    return (
        <div className="w-full h-full bg-os-panel flex flex-col items-center justify-center p-6 text-os-panel-text font-sans relative">
            <style>{`
                @keyframes player-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: player-marquee 15s linear infinite;
                }
            `}</style>

            <div className="absolute inset-0 opacity-0 pointer-events-none z-0">
                <YouTube
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    onError={onError}
                />
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-[280px] z-10">
                <div className="w-full aspect-square bg-os-bg border border-os-border shadow-inner rounded-xl flex flex-col items-center justify-center overflow-hidden relative group">

                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className="absolute top-3 right-3 p-1.5 bg-os-panel/70 hover:bg-os-panel backdrop-blur-md rounded-full text-os-text transition-colors z-20 shadow-sm"
                        title={t('music.view_playlist')}
                    >
                        {showPlaylist ? <X size={16} /> : <ListMusic size={16} />}
                    </button>

                    {showPlaylist ? (
                        <div className="absolute inset-0 bg-os-bg/95 backdrop-blur-md z-10 p-4 pb-2 flex flex-col">
                            <h4 className="font-bold text-sm text-os-panel-text mb-3 flex-shrink-0">{t('music.playlist')}</h4>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
                                {playlist.length > 0 ? playlist.map((id, index) => (
                                    <button
                                        key={`${id}-${index}`}
                                        onClick={() => {
                                            player?.playVideoAt(index);
                                            setShowPlaylist(false);
                                        }}
                                        className={`text-left text-xs p-2 rounded-lg truncate transition-all duration-200 ${currentIndex === index
                                            ? 'bg-os-accent text-white font-bold shadow-sm'
                                            : 'hover:bg-os-hover text-os-text border border-transparent hover:border-os-border/50'
                                            }`}
                                    >
                                        <span className="mr-2 opacity-50 font-mono text-[10px] w-4 inline-block">{index + 1}.</span>
                                        {titlesCache[id] ? titlesCache[id] : (currentIndex === index ? currentTitle : t('music.unknown_track'))}
                                    </button>
                                )) : (
                                    <p className="text-xs text-os-text/50 italic text-center mt-10">{t('music.loading_tracks')}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {currentVideoId && (
                                <img
                                    src={`https://img.youtube.com/vi/${currentVideoId}/maxresdefault.jpg`}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`;
                                    }}
                                    alt="Cover"
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 mix-blend-overlay"
                                />
                            )}
                            <Music size={64} className="relative z-10 text-os-accent/40 drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-110 group-hover:text-os-accent/60" />
                            <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center z-10">
                                <div className="bg-os-panel/80 backdrop-blur-md border border-os-border text-center rounded-xl shadow-sm overflow-hidden flex flex-col w-full max-w-[90%]">
                                    <span className="bg-os-accent text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest shrink-0">
                                        J.OS Media
                                    </span>
                                    <div className="w-full overflow-hidden">
                                        <div className="inline-block whitespace-nowrap pl-[100%] animate-marquee py-1.5 hover:[animation-play-state:paused]">
                                            <span className="px-3 text-xs font-semibold text-os-panel-text" title={currentTitle !== t('music.title') ? currentTitle : t('music.live_radio_title')}>
                                                {currentTitle !== t('music.title') ? currentTitle : t('music.loading_track')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center w-full px-2" style={{ display: showPlaylist ? 'none' : 'block' }}>
                    <h3 className="font-semibold text-os-panel-text text-base leading-tight truncate">
                        {isPlaying ? t('music.status_playing') : (isReady ? t('music.status_ready') : t('music.status_loading'))}
                    </h3>
                    <div className="w-full overflow-hidden mt-1 text-center">
                        <div className="inline-block whitespace-nowrap pl-[100%] animate-marquee hover:[animation-play-state:paused]">
                            <p className="text-xs text-os-text opacity-70 px-4">
                                {isPlaying && currentTitle !== t('music.title') ? currentTitle : t('music.live_radio_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controles*/}
                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={toggleShuffle}
                        disabled={!isReady}
                        className={`p-2 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isShuffled ? 'text-os-accent bg-os-accent/10' : 'text-os-panel-text hover:bg-os-hover'}`}
                        title={t('music.shuffle')}
                    >
                        <Shuffle size={18} />
                    </button>

                    <button
                        onClick={prevTrack}
                        disabled={!isReady}
                        className="p-3 bg-os-bg hover:bg-os-hover border border-os-border rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-os-panel-text"
                    >
                        <SkipBack size={20} className="fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        disabled={!isReady}
                        className="p-5 bg-os-accent text-white hover:brightness-110 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPlaying ? (
                            <Pause size={28} className="fill-current" />
                        ) : (
                            <Play size={28} className="fill-current ml-1" />
                        )}
                    </button>

                    <button
                        onClick={nextTrack}
                        disabled={!isReady}
                        className="p-3 bg-os-bg hover:bg-os-hover border border-os-border rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-os-panel-text"
                    >
                        <SkipForward size={20} className="fill-current" />
                    </button>

                    <button
                        onClick={toggleLoop}
                        disabled={!isReady}
                        className={`p-2 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLooping ? 'text-os-accent bg-os-accent/10' : 'text-os-panel-text hover:bg-os-hover'}`}
                        title={t('music.repeat')}
                    >
                        <Repeat size={18} />
                    </button>
                </div>

                {/* Volumen*/}
                <span className="text-xs text-os-text opacity-50 mt-4 text-center">
                    {t('music.volume_hint')}
                </span>
            </div>
        </div>
    );
}
