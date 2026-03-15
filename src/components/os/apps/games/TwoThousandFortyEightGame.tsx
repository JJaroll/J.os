'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

interface Tile {
    id: string;
    value: number;
}

type BoardState = (Tile | null)[];

const createEmptyBoard = (): BoardState => Array(CELL_COUNT).fill(null);

const TILE_COLORS: Record<number, { bg: string, text: string }> = {
    2: { bg: '#eee4da', text: '#776e65' },
    4: { bg: '#ede0c8', text: '#776e65' },
    8: { bg: '#f2b179', text: '#f9f6f2' },
    16: { bg: '#f59563', text: '#f9f6f2' },
    32: { bg: '#f67c5f', text: '#f9f6f2' },
    64: { bg: '#f65e3b', text: '#f9f6f2' },
    128: { bg: '#edcf72', text: '#f9f6f2' },
    256: { bg: '#edcc61', text: '#f9f6f2' },
    512: { bg: '#edc850', text: '#f9f6f2' },
    1024: { bg: '#edc53f', text: '#f9f6f2' },
    2048: { bg: '#edc22e', text: '#f9f6f2' },
};

const FALLBACK_COLOR = { bg: '#3c3a32', text: '#f9f6f2' };

export default function TwoThousandFortyEightGame() {
    const [board, setBoard] = useState<BoardState>(createEmptyBoard());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [hasKeptPlaying, setHasKeptPlaying] = useState(false);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    // --- Lógica Principal ---

    const getEmptyCells = (currentBoard: BoardState) => {
        return currentBoard.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
    };

    const addRandomTile = (currentBoard: BoardState): BoardState => {
        const emptyCells = getEmptyCells(currentBoard);
        if (emptyCells.length === 0) return currentBoard;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = [...currentBoard];
        newBoard[randomCell] = {
            id: Math.random().toString(36).substring(2, 9),
            value: Math.random() < 0.9 ? 2 : 4
        };
        return newBoard;
    };

    const initGame = useCallback(() => {
        let newBoard = createEmptyBoard();
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
        setHasKeptPlaying(false);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);
    const checkGameOver = (currentBoard: BoardState) => {
        if (getEmptyCells(currentBoard).length > 0) return false;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const i = r * GRID_SIZE + c;
                const val = currentBoard[i]?.value;
                if (!val) continue;

                if (c < GRID_SIZE - 1 && currentBoard[i + 1]?.value === val) return false;
                if (r < GRID_SIZE - 1 && currentBoard[i + GRID_SIZE]?.value === val) return false;
            }
        }
        return true;
    };

    const slide = (row: (Tile | null)[]) => {
        const filteredRow = row.filter(cell => cell !== null) as Tile[];
        const newRow: (Tile | null)[] = [];
        let scoreIncrement = 0;

        for (let i = 0; i < filteredRow.length; i++) {
            if (i < filteredRow.length - 1 && filteredRow[i].value === filteredRow[i + 1].value) {
                const mergedValue = filteredRow[i].value * 2;
                newRow.push({ id: filteredRow[i].id, value: mergedValue });
                scoreIncrement += mergedValue;
                i++;
            } else {
                newRow.push(filteredRow[i]);
            }
        }

        while (newRow.length < GRID_SIZE) {
            newRow.push(null);
        }

        return { newRow, scoreIncrement };
    };

    const processMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver || (gameWon && !hasKeptPlaying)) return;

        setBoard(prevBoard => {
            let newBoard = [...prevBoard];
            let totalScoreInc = 0;
            let moved = false;
            let reached2048 = false;

            if (direction === 'LEFT' || direction === 'RIGHT') {
                for (let r = 0; r < GRID_SIZE; r++) {
                    const rowIndices = [0, 1, 2, 3].map(c => r * GRID_SIZE + c);
                    let row = rowIndices.map(i => prevBoard[i]);

                    if (direction === 'RIGHT') row.reverse();

                    const { newRow, scoreIncrement } = slide(row);

                    if (direction === 'RIGHT') newRow.reverse();

                    rowIndices.forEach((idx, i) => {
                        if (newBoard[idx] !== newRow[i]) moved = true;
                        newBoard[idx] = newRow[i];
                    });
                    totalScoreInc += scoreIncrement;
                }
            } else if (direction === 'UP' || direction === 'DOWN') {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const colIndices = [0, 1, 2, 3].map(r => r * GRID_SIZE + c);
                    let col = colIndices.map(i => prevBoard[i]);

                    if (direction === 'DOWN') col.reverse();

                    const { newRow, scoreIncrement } = slide(col);

                    if (direction === 'DOWN') newRow.reverse();

                    colIndices.forEach((idx, i) => {
                        if (newBoard[idx] !== newRow[i]) moved = true;
                        newBoard[idx] = newRow[i];
                    });
                    totalScoreInc += scoreIncrement;
                }
            }

            if (moved) {
                if (totalScoreInc > 0) {
                    sounds.playCoin();
                } else {
                    sounds.playBlip();
                }

                newBoard = addRandomTile(newBoard);

                setScore(s => {
                    const newScore = s + totalScoreInc;
                    setBestScore(b => Math.max(b, newScore));
                    return newScore;
                });

                if (!hasKeptPlaying && newBoard.some(t => t?.value === 2048)) {
                    sounds.playWin();
                    setGameWon(true);
                }

                if (checkGameOver(newBoard)) {
                    sounds.playCrash();
                    setGameOver(true);
                }
                return newBoard;
            }
            return prevBoard;
        });
    }, [gameOver, gameWon, hasKeptPlaying]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                switch (e.key) {
                    case 'ArrowUp': processMove('UP'); break;
                    case 'ArrowDown': processMove('DOWN'); break;
                    case 'ArrowLeft': processMove('LEFT'); break;
                    case 'ArrowRight': processMove('RIGHT'); break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [processMove]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = endX - touchStartRef.current.x;
        const dy = endY - touchStartRef.current.y;

        const threshold = 30;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
                processMove(dx > 0 ? 'RIGHT' : 'LEFT');
            }
        } else {
            if (Math.abs(dy) > threshold) {
                processMove(dy > 0 ? 'DOWN' : 'UP');
            }
        }
        touchStartRef.current = null;
    };


    return (
        <div className="w-full h-full bg-[#faf8ef] flex flex-col items-center justify-center p-4 font-sans select-none touch-none overflow-hidden text-[#776e65]">

            <div className="w-full max-w-[400px] flex justify-between items-start mb-6">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#776e65] to-[#3c3a32]">2048</h1>
                <div className="flex gap-2">
                    <div className="bg-[#bbada0] rounded text-center px-4 py-1">
                        <div className="text-[#eee4da] text-[10px] font-bold uppercase tracking-wider">{t('2048.score')}</div>
                        <div className="text-white font-bold leading-none">{score}</div>
                    </div>
                    <div className="bg-[#bbada0] rounded text-center px-4 py-1">
                        <div className="text-[#eee4da] text-[10px] font-bold uppercase tracking-wider">{t('2048.best')}</div>
                        <div className="text-white font-bold leading-none">{bestScore}</div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[400px] flex justify-between items-center mb-8 px-1">
                <p className="text-sm font-medium leading-tight">{t('2048.instruction')}</p>
                <button
                    onClick={initGame}
                    className="bg-[#8f7a66] hover:bg-[#9f8b77] text-[#f9f6f2] font-bold py-2 px-4 rounded transition-colors"
                >
                    {t('2048.new_game')}
                </button>
            </div>

            <div
                className="relative bg-[#bbada0] p-3 rounded-lg w-full max-w-[400px] aspect-square"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="absolute inset-3 grid grid-cols-4 grid-rows-4 gap-3 z-0">
                    {Array(16).fill(0).map((_, i) => (
                        <div key={i} className="bg-[#cdc1b4] rounded-sm w-full h-full"></div>
                    ))}
                </div>

                <div className="absolute inset-3 grid grid-cols-4 grid-rows-4 gap-3 z-10 pointer-events-none">
                    {board.map((tile, i) => {
                        if (!tile) return <div key={i} className="w-full h-full" />;

                        const colors = TILE_COLORS[tile.value] || FALLBACK_COLOR;
                        const fontSize = tile.value > 1000 ? 'text-2xl' : tile.value > 100 ? 'text-3xl' : 'text-4xl';

                        return (
                            <div
                                key={tile.id || i}
                                className={`w-full h-full rounded-sm flex items-center justify-center font-bold ${fontSize} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                style={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    animation: 'pop 0.2s ease-in-out'
                                }}
                            >
                                {tile.value}
                            </div>
                        );
                    })}
                </div>

                {gameOver && (
                    <div className="absolute inset-0 bg-[#eee4da]/70 z-20 flex flex-col items-center justify-center rounded-lg backdrop-blur-[2px] animate-in fade-in duration-300">
                        <h2 className="text-5xl font-bold text-[#776e65] mb-4">{t('2048.game_over')}</h2>
                        <button
                            onClick={initGame}
                            className="bg-[#8f7a66] text-[#f9f6f2] font-bold py-3 px-6 rounded text-lg shadow-lg active:translate-y-1 transition-all"
                        >
                            {t('2048.try_again')}
                        </button>
                    </div>
                )}

                {gameWon && !hasKeptPlaying && (
                    <div className="absolute inset-0 bg-[#edc22e]/50 z-20 flex flex-col items-center justify-center rounded-lg backdrop-blur-[2px] animate-in fade-in duration-300">
                        <h2 className="text-5xl font-bold text-white drop-shadow-md mb-4">{t('2048.you_win')}</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setHasKeptPlaying(true)}
                                className="bg-transparent border-2 border-white text-white font-bold py-2 px-4 rounded hover:bg-white hover:text-[#edc22e] transition-colors"
                            >
                                {t('2048.keep_playing')}
                            </button>
                            <button
                                onClick={initGame}
                                className="bg-[#8f7a66] text-[#f9f6f2] font-bold py-2 px-4 rounded shadow-lg"
                            >
                                {t('2048.restart')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pop {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </div>
    );
}
