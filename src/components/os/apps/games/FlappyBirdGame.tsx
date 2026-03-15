'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const BIRD_RADIUS = 12;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -7;
const PIPE_WIDTH = 50;
const PIPE_GAP = 130;
const PIPE_SPEED = 2;
const SPAWN_RATE = 100;

interface Bird {
    y: number;
    velocity: number;
}

interface Pipe {
    x: number;
    topHeight: number;
    passed: boolean;
}

export default function FlappyBirdGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const gameState = useRef({
        bird: { y: CANVAS_HEIGHT / 2, velocity: 0 } as Bird,
        pipes: [] as Pipe[],
        frameCount: 0,
    });

    const initGame = useCallback(() => {
        gameState.current = {
            bird: { y: CANVAS_HEIGHT / 2, velocity: 0 },
            pipes: [],
            frameCount: 0,
        };
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    }, []);

    const flap = useCallback(() => {
        if (!isPlaying && !gameOver) {
            initGame();
        } else if (isPlaying && !gameOver) {
            sounds.playJump();
            gameState.current.bird.velocity = FLAP_STRENGTH;
        } else if (gameOver) {
            initGame();
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

            // Actualizar pájaro
            state.bird.velocity += GRAVITY;
            state.bird.y += state.bird.velocity;

            // Generar tuberías
            if (state.frameCount % SPAWN_RATE === 0) {
                // Altura mínima 50, Altura máxima CANVAS_HEIGHT - PIPE_GAP - 50
                const maxTopHeight = CANVAS_HEIGHT - PIPE_GAP - 50;
                const topHeight = Math.max(50, Math.random() * maxTopHeight);
                state.pipes.push({
                    x: CANVAS_WIDTH,
                    topHeight: topHeight,
                    passed: false
                });
            }

            for (let i = state.pipes.length - 1; i >= 0; i--) {
                const pipe = state.pipes[i];
                pipe.x -= PIPE_SPEED;

                // registra puntaje
                if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2 - BIRD_RADIUS) {
                    pipe.passed = true;
                    sounds.playCoin();
                    setScore(s => {
                        const newScore = s + 1;
                        setHighScore(prev => Math.max(prev, newScore));
                        return newScore;
                    });
                }

                if (pipe.x + PIPE_WIDTH < 0) {
                    state.pipes.splice(i, 1);
                    continue;
                }
                const birdX = CANVAS_WIDTH / 2;
                const birdY = state.bird.y;

                const topRect = { x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.topHeight };
                const bottomRect = { x: pipe.x, y: pipe.topHeight + PIPE_GAP, w: PIPE_WIDTH, h: CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP) };
                const rectIntersect = (r: { x: number, y: number, w: number, h: number }) => {
                    const testX = birdX < r.x ? r.x : (birdX > r.x + r.w ? r.x + r.w : birdX);
                    const testY = birdY < r.y ? r.y : (birdY > r.y + r.h ? r.y + r.h : birdY);
                    const distX = birdX - testX;
                    const distY = birdY - testY;
                    return (distX * distX + distY * distY) <= (BIRD_RADIUS * BIRD_RADIUS);
                };

                if (rectIntersect(topRect) || rectIntersect(bottomRect)) {
                    sounds.playCrash();
                    setGameOver(true);
                }
            }

            // Colisión de suelo / techo
            if (state.bird.y + BIRD_RADIUS > CANVAS_HEIGHT) {
                state.bird.y = CANVAS_HEIGHT - BIRD_RADIUS;
                sounds.playCrash();
                setGameOver(true);
            }
            if (state.bird.y - BIRD_RADIUS < 0) {
                state.bird.y = BIRD_RADIUS;
                state.bird.velocity = 0;
            }
        };

        const draw = () => {
            const state = gameState.current;
            // Fondo (Cielo)
            ctx.fillStyle = '#71c5cf'; // Azul cielo flappy bird
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Representación del suelo (simplista)
            ctx.fillStyle = '#ded895'; // Arena
            ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
            ctx.fillStyle = '#73bf2e'; // Borde de hierba
            ctx.fillRect(0, CANVAS_HEIGHT - 24, CANVAS_WIDTH, 4);

            // Dibujar tuberías
            state.pipes.forEach(pipe => {
                ctx.fillStyle = '#73bf2e'; // Tuberías verdes

                // Tubería superior
                ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
                // Tapa de tubería (superior)
                ctx.fillRect(pipe.x - 2, pipe.topHeight - 15, PIPE_WIDTH + 4, 15);

                // Tubería inferior
                const bottomY = pipe.topHeight + PIPE_GAP;
                ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
                // Tapa de tubería (inferior)
                ctx.fillRect(pipe.x - 2, bottomY, PIPE_WIDTH + 4, 15);

                // Sombreado/contornos de tubería
                ctx.strokeStyle = '#558022';
                ctx.lineWidth = 2;
                ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
                ctx.strokeRect(pipe.x - 2, pipe.topHeight - 15, PIPE_WIDTH + 4, 15);
                ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
                ctx.strokeRect(pipe.x - 2, bottomY, PIPE_WIDTH + 4, 15);
            });

            // Dibujar pájaro
            ctx.save();
            ctx.translate(CANVAS_WIDTH / 2, state.bird.y);

            // Rotación basada en velocidad
            const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.bird.velocity * 0.1)));
            ctx.rotate(rotation);

            // Cuerpo
            ctx.fillStyle = '#f4c82c'; // Amarillo
            ctx.beginPath();
            ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#222';
            ctx.stroke();

            // Ojo
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(BIRD_RADIUS / 2, -BIRD_RADIUS / 3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(BIRD_RADIUS / 2 + 1, -BIRD_RADIUS / 3, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Pico
            ctx.fillStyle = '#f45c2c'; // Naranja
            ctx.beginPath();
            ctx.moveTo(BIRD_RADIUS * 0.8, 0);
            ctx.lineTo(BIRD_RADIUS * 1.5, 0);
            ctx.lineTo(BIRD_RADIUS * 0.8, BIRD_RADIUS * 0.5);
            ctx.fill();
            ctx.stroke();

            // Ala
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            // Animación de aleteo basada en velocidad
            if (state.bird.velocity < 0) {
                ctx.ellipse(-BIRD_RADIUS / 3, 0, 6, 3, Math.PI / 6, 0, Math.PI * 2);
            } else {
                ctx.ellipse(-BIRD_RADIUS / 3, 2, 6, 3, -Math.PI / 6, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.stroke();

            ctx.restore();
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

    // Atajos de teclado para pruebas en escritorio (aunque esté enfocado en móviles)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flap();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flap]);

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 select-none touch-none">
            <div className="relative border-4 border-gray-800 rounded-xl overflow-hidden shadow-2xl bg-[#71c5cf]">

                {/* Superposición de toque para capturar clics/toques en toda el área de juego */}
                <div
                    className="absolute inset-0 z-20 cursor-pointer"
                    onMouseDown={flap} // Para ratón
                    onTouchStart={(e) => { e.preventDefault(); flap(); }} // Para toque móvil
                />

                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none bg-black/40">
                        <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: '2px black' }}>
                            {t('flappybird.title')}
                        </h1>
                        <p className="text-white font-bold text-xl drop-shadow-md bg-black/50 px-4 py-2 rounded-full animate-bounce">
                            {t('flappybird.tap_to_start')}
                        </p>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none bg-black/60">
                        <div className="text-white font-black text-3xl mb-6 tracking-widest" style={{ WebkitTextStroke: '1.5px black' }}>
                            {t('flappybird.game_over')}
                        </div>
                        <div className="bg-[#ded895] border-2 border-[#558022] p-4 rounded-lg shadow-lg flex flex-col items-center mb-6">
                            <div className="text-[#558022] font-bold text-sm">{t('flappybird.score')}</div>
                            <div className="text-3xl font-black text-white" style={{ WebkitTextStroke: '1px black' }}>{score}</div>
                            <div className="text-[#558022] font-bold text-sm mt-2">{t('flappybird.best')}</div>
                            <div className="text-xl font-bold text-white" style={{ WebkitTextStroke: '1px black' }}>{highScore}</div>
                        </div>
                        <p className="text-white font-bold bg-black/50 px-6 py-3 rounded-full shadow-lg">
                            {t('flappybird.tap_to_restart')}
                        </p>
                    </div>
                )}

                {isPlaying && (
                    <div className="absolute top-8 left-0 right-0 z-10 text-center pointer-events-none">
                        <span className="text-5xl font-black text-white drop-shadow-md" style={{ WebkitTextStroke: '2px black' }}>{score}</span>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block shadow-inner"
                    style={{ background: '#71c5cf' }}
                />
            </div>
        </div>
    );
}
