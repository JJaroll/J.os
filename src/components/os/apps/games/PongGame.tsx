'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 70;
const PADDLE_SPEED = 6;
const BALL_SIZE = 10;
const INITIAL_BALL_SPEED = 4;
const MAX_SCORE = 5;

interface GameState {
    status: 'start' | 'playing' | 'paused' | 'gameover';
    winner: 'player' | 'ai' | null;
    playerScore: number;
    aiScore: number;
}

export default function PongGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const [gameState, setGameState] = useState<GameState>({
        status: 'start',
        winner: null,
        playerScore: 0,
        aiScore: 0
    });

    const stateRef = useRef(gameState);
    const playerRef = useRef({ x: 20, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, vy: 0 });
    const aiRef = useRef({ x: CANVAS_WIDTH - 30, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    const ballRef = useRef({
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: INITIAL_BALL_SPEED,
        vy: INITIAL_BALL_SPEED
    });

    const keys = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        stateRef.current = gameState;
    }, [gameState]);

    const resetBall = useCallback((scorer: 'player' | 'ai') => {
        ballRef.current = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            vx: (scorer === 'player' ? -1 : 1) * INITIAL_BALL_SPEED,
            vy: (Math.random() > 0.5 ? 1 : -1) * (INITIAL_BALL_SPEED - 1)
        };
    }, []);

    const update = useCallback(() => {
        const state = stateRef.current;
        if (state.status !== 'playing') return;

        const player = playerRef.current;
        const ai = aiRef.current;
        const ball = ballRef.current;

        if (keys.current['ArrowUp'] || keys.current['W'] || keys.current['w']) {
            player.y = Math.max(0, player.y - PADDLE_SPEED);
        }
        if (keys.current['ArrowDown'] || keys.current['S'] || keys.current['s']) {
            player.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.y + PADDLE_SPEED);
        }

        const aiCenter = ai.y + PADDLE_HEIGHT / 2;
        if (aiCenter < ball.y - 10) {
            ai.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, ai.y + PADDLE_SPEED * 0.7);
        } else if (aiCenter > ball.y + 10) {
            ai.y = Math.max(0, ai.y - PADDLE_SPEED * 0.7);
        }

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y <= 0 || ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
            sounds.playPong();
            ball.vy = -ball.vy;
            ball.y = ball.y <= 0 ? 0 : CANVAS_HEIGHT - BALL_SIZE;
        }

        if (
            ball.x <= player.x + PADDLE_WIDTH &&
            ball.x + BALL_SIZE >= player.x &&
            ball.y + BALL_SIZE >= player.y &&
            ball.y <= player.y + PADDLE_HEIGHT
        ) {
            sounds.playPing();
            const hitPos = (ball.y + BALL_SIZE / 2 - (player.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
            ball.vx = Math.abs(ball.vx) + 0.5;
            ball.vy = hitPos * INITIAL_BALL_SPEED * 1.5;
            ball.x = player.x + PADDLE_WIDTH;
        }

        if (
            ball.x + BALL_SIZE >= ai.x &&
            ball.x <= ai.x + PADDLE_WIDTH &&
            ball.y + BALL_SIZE >= ai.y &&
            ball.y <= ai.y + PADDLE_HEIGHT
        ) {
            sounds.playPing();
            const hitPos = (ball.y + BALL_SIZE / 2 - (ai.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
            ball.vx = -Math.abs(ball.vx) - 0.5;
            ball.vy = hitPos * INITIAL_BALL_SPEED * 1.5;
            ball.x = ai.x - BALL_SIZE;
        }
        if (ball.x < 0) {
            const newAiScore = state.aiScore + 1;
            if (newAiScore >= MAX_SCORE) {
                sounds.playCrash();
                setGameState(prev => ({ ...prev, status: 'gameover', aiScore: newAiScore, winner: 'ai' }));
            } else {
                sounds.playPong();
                setGameState(prev => ({ ...prev, aiScore: newAiScore }));
                resetBall('ai');
            }
        } else if (ball.x > CANVAS_WIDTH) {
            const newPlayerScore = state.playerScore + 1;
            if (newPlayerScore >= MAX_SCORE) {
                sounds.playWin();
                setGameState(prev => ({ ...prev, status: 'gameover', playerScore: newPlayerScore, winner: 'player' }));
            } else {
                sounds.playCoin();
                setGameState(prev => ({ ...prev, playerScore: newPlayerScore }));
                resetBall('player');
            }
        }

    }, [resetBall, sounds]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.strokeStyle = '#374151';
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(playerRef.current.x, playerRef.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.fillStyle = '#ef4444';
        ctx.fillRect(aiRef.current.x, aiRef.current.y, PADDLE_WIDTH, PADDLE_HEIGHT);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(ballRef.current.x, ballRef.current.y, BALL_SIZE, BALL_SIZE);

    }, []);

    const loop = useCallback(() => {
        update();
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) draw(ctx);
        }
        requestRef.current = requestAnimationFrame(loop);
    }, [update, draw]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop]);

    const togglePlay = () => {
        if (gameState.status === 'start' || gameState.status === 'paused') {
            setGameState(prev => ({ ...prev, status: 'playing' }));
        } else if (gameState.status === 'playing') {
            setGameState(prev => ({ ...prev, status: 'paused' }));
        } else if (gameState.status === 'gameover') {
            // Reiniciar
            setGameState({
                status: 'playing',
                winner: null,
                playerScore: 0,
                aiScore: 0
            });
            resetBall('player');
            playerRef.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            aiRef.current.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-os-bg font-sans p-6 overflow-hidden">
            <div className="flex justify-between w-[600px] mb-4 text-3xl font-bold font-mono tracking-widest text-os-text">
                <span className="text-green-500 drop-shadow-sm">{gameState.playerScore}</span>
                <span className="text-os-text/30">VS</span>
                <span className="text-red-500 drop-shadow-sm">{gameState.aiScore}</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-os-border bg-gray-900 group">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block"
                />

                {gameState.status === 'start' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <h1 className="text-5xl font-extrabold text-white tracking-widest mb-2 shadow-black">{t('pong.title')}</h1>
                        <p className="text-white/80 mb-6 font-medium">{t('pong.first_to').replace('{score}', MAX_SCORE.toString())}</p>
                        <p className="text-white/50 mb-8 text-sm">{t('pong.instructions')}</p>
                        <button
                            onClick={togglePlay}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
                        >
                            {t('pong.start')}
                        </button>
                    </div>
                )}

                {gameState.status === 'paused' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-bold text-white mb-6 tracking-widest">{t('pong.paused')}</h2>
                        <button
                            onClick={togglePlay}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
                        >
                            {t('pong.resume')}
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center">
                        <h2 className={`text-4xl font-extrabold mb-2 ${gameState.winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                            {gameState.winner === 'player' ? t('pong.win') : t('pong.game_over')}
                        </h2>
                        <p className="text-white/80 mb-8 font-medium">{t('pong.final_score')}: {gameState.playerScore} - {gameState.aiScore}</p>
                        <button
                            onClick={togglePlay}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
                        >
                            {t('pong.play_again')}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-6 text-os-text/50 text-xs font-medium">
                {gameState.status === 'playing' ? (
                    <button onClick={togglePlay} className="hover:text-os-text px-4 py-2 border border-os-border rounded-lg bg-os-panel">
                        {t('pong.pause_game')}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
