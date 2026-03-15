'use client';

import React, { useState, useEffect } from 'react';
import {
    Gamepad2, Swords, Hexagon, CircleDashed, Shapes, Ghost, Puzzle, ArrowLeft, Bird, LayoutGrid, Calculator, Footprints
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import PongGame from './games/PongGame';
import MinesweeperGame from './games/MinesweeperGame';
import SolitaireGame from './games/SolitaireGame';
import PacmanGame from './games/PacmanGame';
import TetrisGame from './games/TetrisGame';
import FlappyBirdGame from './games/FlappyBirdGame';
import BreakoutGame from './games/BreakoutGame';
import TwoThousandFortyEightGame from './games/TwoThousandFortyEightGame';
import DinoRunGame from './games/DinoRunGame';
import DoomGame from './games/DoomGame';

interface GameApp {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    image: string;
}

const DESKTOP_GAMES: GameApp[] = [
    { id: 'minesweeper', label: 'Buscaminas', description: 'Clásico juego de puzzle lógico.', icon: <Hexagon size={36} />, color: '#ef4444', image: 'https://placehold.co/600x400/fee2e2/dc2626?text=Minesweeper' },
    { id: 'solitaire', label: 'Solitario', description: 'Clásico juego de cartas.', icon: <Shapes size={36} />, color: '#3b82f6', image: 'https://placehold.co/600x400/dbeafe/2563eb?text=Solitaire' },
    { id: 'pacman', label: 'Pac-Man Clone', description: 'Come puntos y evita fantasmas.', icon: <Ghost size={36} />, color: '#eab308', image: 'https://placehold.co/600x400/fef9c3/ca8a04?text=Pac-Man' },
    { id: 'tetris', label: 'Tetris', description: 'Limpia líneas en este clásico juego de bloques.', icon: <Puzzle size={36} />, color: '#8b5cf6', image: 'https://placehold.co/600x400/ede9fe/7c3aed?text=Tetris' },
    { id: 'pong', label: 'Pong', description: 'Juego deportivo de pong clásico.', icon: <CircleDashed size={36} />, color: '#22c55e', image: 'https://placehold.co/600x400/dcfce7/16a34a?text=Pong' },
    { id: 'rpg', label: 'Mini RPG', description: 'Una aventura te espera.', icon: <Swords size={36} />, color: '#f97316', image: 'https://placehold.co/600x400/ffedd5/ea580c?text=Mini+RPG' },
    { id: 'doom', label: 'DOOM', description: 'El clásico shooter en primera persona de 1993, jugable en línea.', icon: <img src="/doom.png" alt="DOOM" className="w-8 h-8 drop-shadow-md pixelated" />, color: '#7f1d1d', image: 'https://placehold.co/600x400/7f1d1d/ffffff?text=DOOM' },
];

const MOBILE_GAMES: GameApp[] = [
    { id: '2048', label: '2048', description: 'Une los números para llegar a la ficha 2048.', icon: <Calculator size={36} />, color: '#edc22e', image: 'https://placehold.co/600x400/edc22e/ffffff?text=2048' },
    { id: 'dinorun', label: 'Dino Run', description: 'Salta obstáculos en esta carrera infinita.', icon: <Footprints size={36} />, color: '#535353', image: 'https://placehold.co/600x400/f7f7f7/535353?text=Dino+Run' },
    { id: 'flappybird', label: 'Flappy OS', description: 'Toca para volar y evitar las tuberías.', icon: <Bird size={36} />, color: '#f4c82c', image: 'https://placehold.co/600x400/71c5cf/ffffff?text=Flappy+OS' },
    { id: 'breakout', label: 'Breakout', description: 'Rebota la pelota y rompe los bloques.', icon: <LayoutGrid size={36} />, color: '#38BDF8', image: 'https://placehold.co/600x400/38bdf8/ffffff?text=Breakout' }
];

export default function GamesWindow() {
    const [selectedGame, setSelectedGame] = useState<GameApp | null>(null);
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [rightPanelWidth, setRightPanelWidth] = useState(260);
    const [isMobile, setIsMobile] = useState(false);
    const [lastClickTime, setLastClickTime] = useState<number>(0);
    const { t } = useLanguage();
    const translateGame = (game: GameApp) => ({
        ...game,
        label: t(`games_window.${game.id}_label`),
        description: t(`games_window.${game.id}_desc`)
    });

    const translatedDesktopGames = DESKTOP_GAMES.map(translateGame);
    const translatedMobileGames = MOBILE_GAMES.map(translateGame);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentGamesList = isMobile ? translatedMobileGames : translatedDesktopGames;

    const startResizeRight = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = rightPanelWidth;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(200, Math.min(400, startWidth + (startX - moveEvent.clientX)));
            setRightPanelWidth(newWidth);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div className="flex w-full h-full bg-os-bg text-os-text font-sans text-sm transition-colors overflow-hidden">

            {/* Área Principal */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar scroll-smooth transition-colors">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-os-text mb-4">{t('games_window.title')}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentGamesList.map((game) => (
                            <button
                                key={game.id}
                                onClick={() => {
                                    setSelectedGame(game);
                                    const now = Date.now();
                                    if (now - lastClickTime < 300) {
                                        if (['pong', 'minesweeper', 'solitaire', 'pacman', 'tetris', 'flappybird', 'breakout', '2048', 'dinorun', 'doom'].includes(game.id)) {
                                            setActiveGame(game.id);
                                        } else {
                                            alert(t('games_window.not_implemented').replace('{label}', game.label));
                                        }
                                    }
                                    setLastClickTime(now);
                                }}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedGame?.id === game.id
                                    ? 'border-os-accent bg-os-hover shadow-sm scale-95'
                                    : 'border-transparent hover:bg-os-hover hover:border-os-border/50'
                                    }`}
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-105 shadow-sm"
                                    style={{ backgroundColor: game.color }}
                                >
                                    {game.icon}
                                </div>
                                <span className="font-medium text-os-text text-center text-xs leading-none">
                                    {game.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel derecho de detalles */}
            {selectedGame && (
                <div
                    className="relative flex-none bg-os-panel border-l border-os-border transition-colors hidden sm:block overflow-y-auto"
                    style={{ width: rightPanelWidth }}
                >
                    <div
                        className="absolute top-0 bottom-0 left-0 w-1 cursor-col-resize hover:bg-os-accent/50 active:bg-os-accent transition-colors hidden sm:block"
                        onPointerDown={startResizeRight}
                    />

                    <div className="p-6">
                        <img
                            src={selectedGame.image}
                            alt={selectedGame.label}
                            className="w-full h-32 object-cover rounded-xl border border-os-border mb-4 shadow-sm"
                        />
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-os-panel-text leading-tight">{selectedGame.label}</h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: selectedGame.color }}
                            >
                                {React.cloneElement(selectedGame.icon as React.ReactElement<any>, { size: 20 })}
                            </div>
                        </div>

                        <p className="text-os-panel-text/70 text-[13px] mb-6 leading-relaxed">
                            {selectedGame.description}
                        </p>

                        <div className="pt-4 border-t border-os-border">
                            <button
                                className={`w-full py-2 text-white font-medium rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 ${['pong', 'minesweeper', 'solitaire', 'pacman', 'tetris', 'flappybird', 'breakout', '2048', 'dinorun', 'doom'].includes(selectedGame.id)
                                    ? 'bg-os-accent hover:brightness-110 active:scale-[0.98]'
                                    : 'bg-os-border/50 cursor-not-allowed opacity-70'
                                    }`}
                                onClick={() => {
                                    if (['pong', 'minesweeper', 'solitaire', 'pacman', 'tetris', 'flappybird', 'breakout', '2048', 'dinorun', 'doom'].includes(selectedGame.id)) {
                                        setActiveGame(selectedGame.id);
                                    } else {
                                        alert(t('games_window.not_implemented').replace('{label}', selectedGame.label));
                                    }
                                }}
                                disabled={!['pong', 'minesweeper', 'solitaire', 'pacman', 'tetris', 'flappybird', 'breakout', '2048', 'dinorun', 'doom'].includes(selectedGame.id)}
                            >
                                <Gamepad2 size={16} />
                                {['pong', 'minesweeper', 'solitaire', 'pacman', 'tetris', 'flappybird', 'breakout', '2048', 'dinorun', 'doom'].includes(selectedGame.id) ? t('games_window.play_now') : t('games_window.coming_soon')}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Superposición de juego activo */}
            {activeGame && (
                <div className="absolute inset-0 z-50 bg-os-bg flex flex-col">
                    <div className="flex items-center px-4 py-2 bg-os-titlebar border-b border-os-border text-os-panel-text shadow-sm shrink-0">
                        <button
                            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded bg-os-panel border border-os-border hover:bg-os-hover transition-colors shadow-sm"
                            onClick={() => setActiveGame(null)}
                        >
                            <ArrowLeft size={14} />
                            {t('games_window.exit_game')}
                        </button>
                        <span className="flex-1 text-center font-bold text-sm pr-10 capitalize">{activeGame}</span>
                    </div>
                    <div className="flex-1 relative">
                        {activeGame === 'pong' && <PongGame />}
                        {activeGame === 'minesweeper' && <MinesweeperGame />}
                        {activeGame === 'solitaire' && <SolitaireGame />}
                        {activeGame === 'pacman' && <PacmanGame />}
                        {activeGame === 'tetris' && <TetrisGame />}
                        {activeGame === 'flappybird' && <FlappyBirdGame />}
                        {activeGame === 'breakout' && <BreakoutGame />}
                        {activeGame === '2048' && <TwoThousandFortyEightGame />}
                        {activeGame === 'dinorun' && <DinoRunGame />}
                        {activeGame === 'doom' && <DoomGame />}
                    </div>
                </div>
            )}
        </div >
    );
}
