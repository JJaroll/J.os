'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 150;
const DINO_WIDTH = 44;
const DINO_HEIGHT = 47;
const CACTUS_WIDTH = 34;
const CACTUS_HEIGHT = 50;

const GRAVITY = 0.6;
const JUMP_VELOCITY = -10;
const BASE_GAME_SPEED = 6;
const INITIAL_SPAWN_TIMER = 100;

interface Dino {
    y: number;
    velocity: number;
    isJumping: boolean;
}

interface Obstacle {
    x: number;
    width: number;
    height: number;
}

export default function DinoRunGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const gameState = useRef({
        dino: { y: CANVAS_HEIGHT - DINO_HEIGHT, velocity: 0, isJumping: false } as Dino,
        obstacles: [] as Obstacle[],
        gameSpeed: BASE_GAME_SPEED,
        spawnTimer: INITIAL_SPAWN_TIMER,
        frameCount: 0,
        scoreCounter: 0
    });

    const initGame = useCallback(() => {
        gameState.current = {
            dino: { y: CANVAS_HEIGHT - DINO_HEIGHT, velocity: 0, isJumping: false },
            obstacles: [],
            gameSpeed: BASE_GAME_SPEED,
            spawnTimer: INITIAL_SPAWN_TIMER,
            frameCount: 0,
            scoreCounter: 0
        };
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    }, []);

    const jump = useCallback(() => {
        if (!isPlaying && !gameOver) {
            initGame();
        } else if (gameOver) {
            initGame();
        } else if (!gameState.current.dino.isJumping) {
            sounds.playJump();
            gameState.current.dino.velocity = JUMP_VELOCITY;
            gameState.current.dino.isJumping = true;
        }
    }, [isPlaying, gameOver, initGame, sounds]);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const update = () => {
            const state = gameState.current;
            state.frameCount++;

            // Actualizar Puntaje
            state.scoreCounter++;
            if (state.scoreCounter % 5 === 0) {
                setScore(s => {
                    const newScore = s + 1;
                    setHighScore(prev => Math.max(prev, newScore));
                    return newScore;
                });

                // Aumentar dificultad
                if (state.scoreCounter % 500 === 0) {
                    sounds.playCoin();
                    state.gameSpeed += 0.5;
                }
            }

            // Actualizar Físicas del Dino
            state.dino.velocity += GRAVITY;
            state.dino.y += state.dino.velocity;

            // Colisión de suelo
            if (state.dino.y >= CANVAS_HEIGHT - DINO_HEIGHT) {
                state.dino.y = CANVAS_HEIGHT - DINO_HEIGHT;
                state.dino.velocity = 0;
                state.dino.isJumping = false;
            }

            // Generar obstáculos
            state.spawnTimer--;
            if (state.spawnTimer <= 0) {
                // Aleatorizar el grupo de cactus
                const obstacleMode = Math.floor(Math.random() * 3); // 0=simple, 1=doble, 2=grande

                let width = CACTUS_WIDTH;
                let height = CACTUS_HEIGHT;

                if (obstacleMode === 1) width = CACTUS_WIDTH * 1.5;
                if (obstacleMode === 2) {
                    width = CACTUS_WIDTH * 1.8;
                    height = CACTUS_HEIGHT * 1.2;
                }

                state.obstacles.push({
                    x: CANVAS_WIDTH,
                    width,
                    height
                });
                state.spawnTimer = Math.max(40, INITIAL_SPAWN_TIMER - (state.gameSpeed * 5) + Math.random() * 60);
            }

            // Actualizar obstáculos y comprobar colisión
            const dinoHitbox = {
                x: 50,
                y: state.dino.y,
                width: DINO_WIDTH - 10,
                height: DINO_HEIGHT - 10
            };

            for (let i = state.obstacles.length - 1; i >= 0; i--) {
                const obs = state.obstacles[i];
                obs.x -= state.gameSpeed;

                if (obs.x + obs.width < 0) {
                    state.obstacles.splice(i, 1);
                    continue;
                }

                const obsHitbox = {
                    x: obs.x + 5,
                    y: CANVAS_HEIGHT - obs.height,
                    width: obs.width - 10,
                    height: obs.height
                };

                if (
                    dinoHitbox.x < obsHitbox.x + obsHitbox.width &&
                    dinoHitbox.x + dinoHitbox.width > obsHitbox.x &&
                    dinoHitbox.y < obsHitbox.y + obsHitbox.height &&
                    dinoHitbox.y + dinoHitbox.height > obsHitbox.y
                ) {
                    sounds.playCrash();
                    setGameOver(true);
                }
            }
        };

        const draw = () => {
            const state = gameState.current;

            // Limpiar cielo
            ctx.fillStyle = '#f7f7f7';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Dibujar línea de suelo
            ctx.beginPath();
            ctx.moveTo(0, CANVAS_HEIGHT - 10);
            ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 10);
            ctx.strokeStyle = '#535353';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#535353';
            for (let i = 0; i < 5; i++) {
                const bumpX = ((i * 200) - (state.frameCount * state.gameSpeed * 0.5)) % (CANVAS_WIDTH + 100);
                const drawX = bumpX < -50 ? bumpX + CANVAS_WIDTH + 100 : bumpX;
                ctx.fillRect(drawX, CANVAS_HEIGHT - 8, 3, 2);
                ctx.fillRect(drawX + 10, CANVAS_HEIGHT - 6, 2, 2);
            }

            // Dibujar Dino
            ctx.fillStyle = '#535353';
            const dx = 50;
            const dy = state.dino.y;

            // Cuerpo
            ctx.fillRect(dx + 15, dy, 20, 15);
            ctx.fillRect(dx + 10, dy + 15, 25, 20);
            ctx.fillRect(dx, dy + 20, 10, 10);

            // Ojo
            ctx.fillStyle = '#f7f7f7';
            ctx.fillRect(dx + 20, dy + 3, 5, 5);
            ctx.fillStyle = '#535353';

            // Piernas
            if (state.dino.isJumping) {
                ctx.fillRect(dx + 10, dy + 35, 8, 10);
                ctx.fillRect(dx + 25, dy + 35, 8, 10);
            } else {
                if (state.frameCount % 10 < 5) {
                    ctx.fillRect(dx + 10, dy + 35, 6, 12);
                    ctx.fillRect(dx + 25, dy + 35, 6, 8);
                } else {
                    ctx.fillRect(dx + 10, dy + 35, 6, 8);
                    ctx.fillRect(dx + 25, dy + 35, 6, 12);
                }
            }

            // Dibujar obstáculos (Cactus)
            state.obstacles.forEach(obs => {
                const oy = CANVAS_HEIGHT - obs.height;
                ctx.fillRect(obs.x + obs.width / 2 - 4, oy, 8, obs.height);

                if (obs.width > 20) {
                    ctx.fillRect(obs.x + 2, oy + 15, 6, obs.height / 2);
                    ctx.fillRect(obs.x + 2, oy + 15 + obs.height / 2, obs.width / 2 - 2, 6);
                    ctx.fillRect(obs.x + obs.width - 8, oy + 10, 6, obs.height / 2);
                    ctx.fillRect(obs.x + obs.width / 2, oy + 10 + obs.height / 2, obs.width / 2, 6);
                }
            });
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

    }, [isPlaying, gameOver]);

    // Atajos de escritorio
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [jump]);

    return (
        <div className="w-full h-full bg-[#f7f7f7] flex flex-col items-center justify-center p-4 select-none touch-none overflow-hidden relative">
            <div className="absolute top-8 right-8 flex gap-4 text-[#535353] font-[monospace] font-bold text-xl z-20 pointer-events-none">
                <div className="opacity-70 tracking-widest">
                    {t('dinorun.hi')} {highScore.toString().padStart(5, '0')}
                </div>
                <div className="tracking-widest">
                    {score.toString().padStart(5, '0')}
                </div>
            </div>

            <div
                className="w-full max-w-[600px] relative border-y-2 border-transparent cursor-pointer touch-action-none"
                onMouseDown={jump}
                onTouchStart={(e) => { e.preventDefault(); jump(); }}
            >
                {(!isPlaying || gameOver) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none pb-10">
                        {gameOver ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                                <div className="text-[#535353] font-[monospace] font-bold text-2xl mb-4 tracking-widest text-center">
                                    {t('dinorun.game_over')}
                                </div>
                                <div className="p-3 border border-[#535353] rounded-full text-[#535353]">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[#535353] font-[monospace] font-bold text-xl animate-pulse tracking-widest">
                                {t('dinorun.tap_to_start')}
                            </div>
                        )}
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto bg-transparent touch-none"
                />
            </div>

            <div className="absolute bottom-8 left-0 right-0 text-center text-[#535353]/50 text-xs font-[monospace] pointer-events-none">
                {t('dinorun.instructions')}
            </div>
        </div>
    );
}
