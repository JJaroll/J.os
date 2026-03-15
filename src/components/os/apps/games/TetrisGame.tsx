'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const COLORS = [
    'none',
    '#00FFFF',
    '#0000FF',
    '#FFA500',
    '#FFFF00',
    '#00FF00',
    '#800080',
    '#FF0000'
];

const SHAPES = [
    [], // 0
    [   // 1: I
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [   // 2: J
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [   // 3: L
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [   // 4: O
        [4, 4],
        [4, 4]
    ],
    [   // 5: S
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [   // 6: T
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [   // 7: Z
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

type Matrix = number[][];
type Piece = {
    matrix: Matrix;
    x: number;
    y: number;
};

const createEmptyMatrix = (w: number, h: number): Matrix => {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
};

// Generar pieza aleatoria
const spawnPiece = (): Piece => {
    const typeId = Math.floor(Math.random() * 7) + 1;
    const matrix = SHAPES[typeId];
    return {
        matrix,
        x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
        y: 0
    };
};

export default function TetrisGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nextCanvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const gameState = useRef({
        playfield: createEmptyMatrix(COLS, ROWS),
        current: null as Piece | null,
        next: spawnPiece(),
        dropCounter: 0,
        dropInterval: 1000,
        lastTime: 0
    });

    const initGame = useCallback(() => {
        gameState.current = {
            playfield: createEmptyMatrix(COLS, ROWS),
            current: spawnPiece(),
            next: spawnPiece(),
            dropCounter: 0,
            dropInterval: 1000,
            lastTime: performance.now()
        };
        setScore(0);
        setLines(0);
        setLevel(1);
        setGameOver(false);
        setIsPlaying(true);
        setIsPaused(false);
    }, []);

    // --- Lógica Principal ---

    const collide = (playfield: Matrix, piece: Piece) => {
        const m = piece.matrix;
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (m[y][x] !== 0 &&
                    (playfield[y + piece.y] && playfield[y + piece.y][x + piece.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const rotate = (matrix: Matrix, dir: number) => {
        const rotated = matrix.map((row, y) =>
            row.map((_, x) => matrix[matrix.length - 1 - x][y])
        );

        if (dir < 0) {
            return matrix.map((_, y) =>
                matrix[y].map((_, x) => matrix[x][matrix.length - 1 - y])
            );
        }
        return rotated;
    };


    useEffect(() => {
        if (!isPlaying || gameOver || isPaused) return;

        const canvas = canvasRef.current;
        const nextCanvas = nextCanvasRef.current;
        if (!canvas || !nextCanvas) return;
        const ctx = canvas.getContext('2d');
        const nextCtx = nextCanvas.getContext('2d');
        if (!ctx || !nextCtx) return;

        let animationFrameId: number;

        const drawMatrix = (matrix: Matrix, offset: { x: number, y: number }, targetCtx: CanvasRenderingContext2D, centerOffset = { x: 0, y: 0 }) => {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        targetCtx.fillStyle = COLORS[value];
                        targetCtx.fillRect((x + offset.x) * BLOCK_SIZE + centerOffset.x, (y + offset.y) * BLOCK_SIZE + centerOffset.y, BLOCK_SIZE, BLOCK_SIZE);

                        targetCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        targetCtx.fillRect((x + offset.x) * BLOCK_SIZE + centerOffset.x, (y + offset.y) * BLOCK_SIZE + centerOffset.y, BLOCK_SIZE, 3); // arriba
                        targetCtx.fillRect((x + offset.x) * BLOCK_SIZE + centerOffset.x, (y + offset.y) * BLOCK_SIZE + centerOffset.y, 3, BLOCK_SIZE); // izquierda

                        targetCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                        targetCtx.fillRect((x + offset.x) * BLOCK_SIZE + centerOffset.x, (y + offset.y + 1) * BLOCK_SIZE - 3 + centerOffset.y, BLOCK_SIZE, 3); // abajo
                        targetCtx.fillRect((x + offset.x + 1) * BLOCK_SIZE - 3 + centerOffset.x, (y + offset.y) * BLOCK_SIZE + centerOffset.y, 3, BLOCK_SIZE); // derecha
                    }
                });
            });
        };

        const merge = (playfield: Matrix, piece: Piece) => {
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        playfield[y + piece.y][x + piece.x] = value;
                    }
                });
            });
        };

        const updateScore = (linesCleared: number) => {
            if (linesCleared > 0) {
                if (linesCleared >= 4) {
                    sounds.playWin();
                } else {
                    sounds.playCoin();
                }
                const linePoints = [0, 40, 100, 300, 1200];
                setScore(s => s + (linePoints[linesCleared] * level));

                setLines(l => {
                    const newLines = l + linesCleared;
                    const newLevel = Math.floor(newLines / 10) + 1;
                    if (newLevel > level) {
                        setLevel(newLevel);
                        gameState.current.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 80);
                    }
                    return newLines;
                });
            }
        };

        const clearLines = () => {
            const state = gameState.current;
            let linesCleared = 0;
            outer: for (let y = state.playfield.length - 1; y >= 0; --y) {
                for (let x = 0; x < state.playfield[y].length; ++x) {
                    if (state.playfield[y][x] === 0) {
                        continue outer;
                    }
                }

                const row = state.playfield.splice(y, 1)[0].fill(0);
                state.playfield.unshift(row);
                ++y;
                linesCleared++;
            }
            updateScore(linesCleared);
        };

        const resetPiece = () => {
            const state = gameState.current;
            state.current = state.next;
            state.next = spawnPiece();

            if (state.current && collide(state.playfield, state.current)) {
                sounds.playCrash();
                setGameOver(true);
            }
        };

        const drop = () => {
            const state = gameState.current;
            if (!state.current) return;

            state.current.y++;
            if (collide(state.playfield, state.current)) {
                state.current.y--;
                merge(state.playfield, state.current);
                resetPiece();
                clearLines();
            }
            state.dropCounter = 0;
        };

        (window as any).__tetrisMove = (dir: number) => {
            const state = gameState.current;
            if (!state.current) return;
            state.current.x += dir;
            if (collide(state.playfield, state.current)) {
                state.current.x -= dir;
            } else {
                sounds.playBlip();
            }
        };

        (window as any).__tetrisDrop = () => {
            drop();
        };

        (window as any).__tetrisHardDrop = () => {
            const state = gameState.current;
            if (!state.current) return;
            let dropped = false;
            while (!collide(state.playfield, state.current)) {
                state.current.y++;
                dropped = true;
            }
            if (dropped) sounds.playPong();
            state.current.y--;
            merge(state.playfield, state.current);
            resetPiece();
            clearLines();
            state.dropCounter = 0;
        };

        (window as any).__tetrisRotate = () => {
            const state = gameState.current;
            if (!state.current) return;

            const pos = state.current.x;
            let offset = 1;

            state.current.matrix = rotate(state.current.matrix, 1);

            let rotated = false;
            while (collide(state.playfield, state.current)) {
                state.current.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));

                if (offset > state.current.matrix[0].length) {
                    state.current.matrix = rotate(state.current.matrix, -1);
                    state.current.x = pos;
                    return;
                }
            }
            sounds.playBlip();
        };


        const draw = () => {
            const state = gameState.current;

            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 1;
            for (let i = 1; i < COLS; i++) {
                ctx.beginPath(); ctx.moveTo(i * BLOCK_SIZE, 0); ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE); ctx.stroke();
            }
            for (let i = 1; i < ROWS; i++) {
                ctx.beginPath(); ctx.moveTo(0, i * BLOCK_SIZE); ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE); ctx.stroke();
            }

            drawMatrix(state.playfield, { x: 0, y: 0 }, ctx);

            if (state.current) {
                const ghostPiece = {
                    matrix: state.current.matrix,
                    x: state.current.x,
                    y: state.current.y
                };
                while (!collide(state.playfield, ghostPiece)) {
                    ghostPiece.y++;
                }
                ghostPiece.y--;

                ghostPiece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value !== 0) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                            ctx.fillRect((x + ghostPiece.x) * BLOCK_SIZE, (y + ghostPiece.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                            ctx.strokeStyle = COLORS[value];
                            ctx.strokeRect((x + ghostPiece.x) * BLOCK_SIZE, (y + ghostPiece.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        }
                    });
                });

                drawMatrix(state.current.matrix, { x: state.current.x, y: state.current.y }, ctx);
            }

            nextCtx.fillStyle = '#111827';
            nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

            if (state.next) {
                const pW = state.next.matrix[0].length * BLOCK_SIZE;
                const pH = state.next.matrix.length * BLOCK_SIZE;
                const cX = (nextCanvas.width - pW) / 2;
                const cY = (nextCanvas.height - pH) / 2;

                drawMatrix(state.next.matrix, { x: 0, y: 0 }, nextCtx, { x: cX, y: cY });
            }
        };

        const loop = (time = 0) => {
            const state = gameState.current;
            const deltaTime = time - state.lastTime;
            state.lastTime = time;

            state.dropCounter += deltaTime;
            if (state.dropCounter > state.dropInterval) {
                drop();
            }

            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            delete (window as any).__tetrisMove;
            delete (window as any).__tetrisDrop;
            delete (window as any).__tetrisHardDrop;
            delete (window as any).__tetrisRotate;
        };
    }, [isPlaying, gameOver, isPaused, level]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPlaying || gameOver || isPaused) return;

            const win = window as any;
            if (e.key === 'ArrowLeft') {
                win.__tetrisMove?.(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                win.__tetrisMove?.(1);
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                win.__tetrisDrop?.();
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                win.__tetrisRotate?.();
                e.preventDefault();
            } else if (e.key === ' ') {
                win.__tetrisHardDrop?.();
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver, isPaused]);

    return (
        <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center p-4 relative font-[monospace] overflow-hidden text-white">

            <div className="flex gap-6 items-start z-0">

                <div className="relative">
                    {!isPlaying && !gameOver && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <h1 className="text-4xl font-bold tracking-widest mb-2 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{t('tetris.title')}</h1>
                            <p className="mb-8 text-sm text-gray-400">{t('tetris.mode')}</p>
                            <button
                                onClick={initGame}
                                className="px-8 py-3 bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-bold rounded shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 transition-all"
                            >
                                {t('tetris.start')}
                            </button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm border-2 border-red-500/50">
                            <h2 className="text-4xl font-bold mb-2 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{t('tetris.game_over')}</h2>
                            <p className="text-xl text-white mb-2">{t('tetris.score')}: {score}</p>
                            <p className="text-gray-400 mb-8">{t('tetris.level')}: {level} | {t('tetris.lines')}: {lines}</p>
                            <button
                                onClick={initGame}
                                className="px-6 py-2 border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition-colors"
                            >
                                {t('tetris.try_again')}
                            </button>
                        </div>
                    )}

                    {isPaused && !gameOver && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                            <h2 className="text-3xl font-bold text-white tracking-widest">{t('tetris.paused')}</h2>
                        </div>
                    )}

                    <div className="bg-gray-900 border-4 border-gray-700 rounded-sm shadow-2xl relative">
                        <canvas
                            ref={canvasRef}
                            width={COLS * BLOCK_SIZE}
                            height={ROWS * BLOCK_SIZE}
                            className="block"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-32">
                    <div className="bg-gray-900 border-2 border-gray-700 rounded-sm p-3 text-center">
                        <h3 className="text-gray-400 text-xs mb-1">{t('tetris.panel_score')}</h3>
                        <div className="text-xl font-bold text-cyan-400">{score.toString().padStart(6, '0')}</div>
                    </div>

                    <div className="bg-gray-900 border-2 border-gray-700 rounded-sm p-3 text-center">
                        <h3 className="text-gray-400 text-xs mb-1">{t('tetris.panel_level')}</h3>
                        <div className="text-xl font-bold">{level}</div>
                    </div>

                    <div className="bg-gray-900 border-2 border-gray-700 rounded-sm p-3 text-center">
                        <h3 className="text-gray-400 text-xs mb-1">{t('tetris.panel_lines')}</h3>
                        <div className="text-xl font-bold text-gray-300">{lines}</div>
                    </div>

                    <div className="bg-gray-900 border-2 border-gray-700 rounded-sm p-2 flex flex-col items-center">
                        <h3 className="text-gray-400 text-xs mb-2">{t('tetris.panel_next')}</h3>
                        <canvas
                            ref={nextCanvasRef}
                            width={100}
                            height={80}
                            className="block"
                        />
                    </div>

                    {isPlaying && !gameOver && (
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-sm transition-colors"
                        >
                            {isPaused ? t('tetris.resume') : t('tetris.pause')}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:hidden w-full max-w-[300px]">
                <div className="flex justify-between gap-4">
                    <button
                        className="flex-1 h-14 bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); (window as any).__tetrisMove?.(-1); }}
                    >◀</button>
                    <button
                        className="flex-1 h-14 bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); (window as any).__tetrisDrop?.(); }}
                    >▼</button>
                    <button
                        className="flex-1 h-14 bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); (window as any).__tetrisMove?.(1); }}
                    >▶</button>
                </div>
                <div className="flex gap-4">
                    <button
                        className="w-14 h-14 bg-blue-600 rounded-full active:bg-blue-500 flex items-center justify-center shadow-[0_4px_0_rgb(30,58,138)] active:shadow-[0_0px_0_rgb(30,58,138)] active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); (window as any).__tetrisHardDrop?.(); }}
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    </button>
                    <button
                        className="flex-1 h-14 bg-red-600 rounded-full active:bg-red-500 flex items-center justify-center font-bold text-lg shadow-[0_4px_0_rgb(153,27,27)] active:shadow-[0_0px_0_rgb(153,27,27)] active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); (window as any).__tetrisRotate?.(); }}
                    >
                        {t('tetris.rotate')}
                    </button>
                </div>
            </div>
        </div>
    );
}
