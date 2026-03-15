'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

// --- Constantes y Tipos ---
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 6;

const BALL_RADIUS = 5;
const INITIAL_BALL_SPEED = 4;

const BRICK_ROWS = 6;
const BRICK_COLS = 5;
const BRICK_WIDTH = 54;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 9;

// Colores para las filas
const BRICK_COLORS = [
    '#EF4444', // Rojo
    '#F97316', // Naranja
    '#EAB308', // Amarillo
    '#22C55E', // Verde
    '#3B82F6', // Azul
    '#A855F7', // Púrpura
];

interface Brick {
    x: number;
    y: number;
    status: number;
    color: string;
}

export default function BreakoutGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const gameState = useRef({
        paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED },
        bricks: [] as Brick[][],
        rightPressed: false,
        leftPressed: false,
        touchX: null as number | null,
    });

    const initBricks = () => {
        const bricks: Brick[][] = [];
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROWS; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1, color: BRICK_COLORS[r] };
            }
        }
        return bricks;
    };

    const initGame = useCallback(() => {
        gameState.current = {
            paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
            ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: INITIAL_BALL_SPEED, dy: -INITIAL_BALL_SPEED },
            bricks: initBricks(),
            rightPressed: false,
            leftPressed: false,
            touchX: null,
        };
        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setIsPlaying(true);
    }, []);

    useEffect(() => {
        if (!isPlaying || gameOver || gameWon) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const drawBall = (x: number, y: number) => {
            ctx.beginPath();
            ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.closePath();
        };

        const drawPaddle = (x: number) => {
            ctx.beginPath();
            ctx.rect(x, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillStyle = '#38BDF8';
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(x, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, 2);
            ctx.closePath();
        };

        const drawBricks = (bricks: Brick[][]) => {
            for (let c = 0; c < BRICK_COLS; c++) {
                for (let r = 0; r < BRICK_ROWS; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                        const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;

                        ctx.beginPath();
                        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                        ctx.fillStyle = bricks[c][r].color;
                        ctx.fill();

                        // Efecto 3D retro
                        ctx.fillStyle = 'rgba(255,255,255,0.3)';
                        ctx.fillRect(brickX, brickY, BRICK_WIDTH, 2);
                        ctx.fillRect(brickX, brickY, 2, BRICK_HEIGHT);
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        ctx.fillRect(brickX, brickY + BRICK_HEIGHT - 2, BRICK_WIDTH, 2);
                        ctx.fillRect(brickX + BRICK_WIDTH - 2, brickY, 2, BRICK_HEIGHT);

                        ctx.closePath();
                    }
                }
            }
        };

        const update = () => {
            const state = gameState.current;
            const b = state.ball;

            // Detecta choques
            let bricksRemaining = 0;
            for (let c = 0; c < BRICK_COLS; c++) {
                for (let r = 0; r < BRICK_ROWS; r++) {
                    const brick = state.bricks[c][r];
                    if (brick.status === 1) {
                        bricksRemaining++;
                        if (b.x > brick.x && b.x < brick.x + BRICK_WIDTH && b.y > brick.y && b.y < brick.y + BRICK_HEIGHT) {
                            sounds.playCoin();
                            b.dy = -b.dy;
                            brick.status = 0;
                            setScore(s => s + (BRICK_ROWS - r) * 10);

                            // Aumentar velocidad ligeramente
                            if (Math.abs(b.dx) < 8) {
                                b.dx *= 1.01;
                                b.dy *= 1.01;
                            }
                        }
                    }
                }
            }

            if (bricksRemaining === 0) {
                sounds.playWin();
                setGameWon(true);
            }

            // Colisiones de pared (Izquierda/Derecha)
            if (b.x + b.dx > CANVAS_WIDTH - BALL_RADIUS || b.x + b.dx < BALL_RADIUS) {
                sounds.playPong();
                b.dx = -b.dx;
            }

            // Colisión de techo
            if (b.y + b.dy < BALL_RADIUS) {
                sounds.playPong();
                b.dy = -b.dy;
            }
            // Colisión inferior (Paleta o Suelo)
            else if (b.y + b.dy > CANVAS_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT - 10) {
                // Comprobar si golpea la paleta
                if (b.x > state.paddleX && b.x < state.paddleX + PADDLE_WIDTH && b.y < CANVAS_HEIGHT - 10) {
                    sounds.playPing();
                    b.dy = -Math.abs(b.dy);
                    const hitPoint = b.x - (state.paddleX + PADDLE_WIDTH / 2);
                    b.dx = hitPoint * 0.15;
                } else if (b.y + b.dy > CANVAS_HEIGHT - BALL_RADIUS) {
                    // Golpeó el suelo
                    sounds.playCrash();
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setGameOver(true);
                        } else {
                            // Reiniciar pelota y paleta
                            state.ball.x = CANVAS_WIDTH / 2;
                            state.ball.y = CANVAS_HEIGHT - 30;
                            state.ball.dx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
                            state.ball.dy = -INITIAL_BALL_SPEED;
                            state.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
                        }
                        return newLives;
                    });
                }
            }

            // Usar teclado
            if (state.rightPressed && state.paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
                state.paddleX += PADDLE_SPEED;
            } else if (state.leftPressed && state.paddleX > 0) {
                state.paddleX -= PADDLE_SPEED;
            }

            // Pantalla touch
            if (state.touchX !== null) {
                let targetX = state.touchX - PADDLE_WIDTH / 2;
                targetX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, targetX));
                state.paddleX += (targetX - state.paddleX) * 0.3;
            }

            // Mover pelota
            b.x += b.dx;
            b.y += b.dy;
        };

        const draw = () => {
            const state = gameState.current;
            ctx.fillStyle = '#111827';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            drawBricks(state.bricks);
            drawPaddle(state.paddleX);
            drawBall(state.ball.x, state.ball.y);
        };

        const loop = () => {
            update();
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, gameOver, gameWon]);

    useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = true;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = true;
        };
        const keyUpHandler = (e: KeyboardEvent) => {
            if (e.key === 'Right' || e.key === 'ArrowRight') gameState.current.rightPressed = false;
            else if (e.key === 'Left' || e.key === 'ArrowLeft') gameState.current.leftPressed = false;
        };

        window.addEventListener('keydown', keyDownHandler);
        window.addEventListener('keyup', keyUpHandler);
        return () => {
            window.removeEventListener('keydown', keyDownHandler);
            window.removeEventListener('keyup', keyUpHandler);
        };
    }, []);

    // Touch para celulares/tablets
    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isPlaying || gameOver || gameWon) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as React.MouseEvent).clientX;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const relativeX = (clientX - rect.left) * scaleX;

        gameState.current.touchX = relativeX;
    };

    const handleTouchEnd = () => {
        gameState.current.touchX = null;
    };

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 select-none outline-none overflow-hidden touch-none">
            <div className="relative border-2 border-gray-700 rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.2)]">

                {(!isPlaying || gameOver || gameWon) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
                        {!isPlaying && !gameOver && !gameWon && (
                            <>
                                <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">{t('breakout.title')}</h1>
                                <p className="text-gray-400 mb-8 text-sm">{t('breakout.instructions')}</p>
                                <button
                                    onClick={initGame}
                                    className="px-8 py-3 bg-sky-500 text-white font-bold rounded-full hover:bg-sky-400 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.5)] uppercase tracking-wider active:scale-95"
                                >
                                    {t('breakout.start')}
                                </button>
                            </>
                        )}

                        {gameOver && (
                            <>
                                <h2 className="text-4xl font-extrabold text-red-500 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{t('breakout.game_over')}</h2>
                                <p className="text-xl text-white mb-2">{t('breakout.score').replace('{score}', score.toString())}</p>
                                <button
                                    onClick={initGame}
                                    className="mt-6 px-8 py-3 bg-transparent border-2 border-sky-400 text-sky-400 font-bold rounded-full hover:bg-sky-400 hover:text-white transition-colors uppercase tracking-wider active:scale-95"
                                >
                                    {t('breakout.try_again')}
                                </button>
                            </>
                        )}

                        {gameWon && (
                            <>
                                <h2 className="text-4xl font-extrabold text-green-400 mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">{t('breakout.you_win')}</h2>
                                <p className="text-xl text-white mb-2">{t('breakout.final_score').replace('{score}', score.toString())}</p>
                                <button
                                    onClick={initGame}
                                    className="mt-6 px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-400 transition-colors uppercase tracking-wider active:scale-95"
                                >
                                    {t('breakout.play_again')}
                                </button>
                            </>
                        )}
                    </div>
                )}

                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between z-10 pointer-events-none">
                    <div className="text-white font-[monospace] font-bold text-sm">
                        {t('breakout.hud_score').replace('{score}', score.toString())}
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                        ))}
                    </div>
                </div>

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block rounded-lg touch-none cursor-ew-resize"
                    style={{ background: '#111827' }}
                    onMouseMove={handleTouchMove}
                    onMouseLeave={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                />
            </div>
        </div>
    );
}
