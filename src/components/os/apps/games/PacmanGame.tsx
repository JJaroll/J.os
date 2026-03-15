'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const TILE_SIZE = 20;
const ROWS = 21;
const COLS = 19;

// 0: Vacío, 1: Pared, 2: Punto, 3: Píldora de Poder, 4: Puerta de Fantasmas
const INITIAL_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0], // Fila del túnel
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
    [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface Entity {
    pos: Position;
    dir: Direction;
    nextDir: Direction;
    speed: number;
}

interface Ghost extends Entity {
    color: string;
    state: 'CHASE' | 'SCATTER' | 'SCARED' | 'EATEN';
    startX: number;
    startY: number;
    lastGridX?: number;
    lastGridY?: number;
}

const dirToVec = (dir: Direction): Position => {
    switch (dir) {
        case 'UP': return { x: 0, y: -1 };
        case 'DOWN': return { x: 0, y: 1 };
        case 'LEFT': return { x: -1, y: 0 };
        case 'RIGHT': return { x: 1, y: 0 };
        case 'NONE': return { x: 0, y: 0 };
    }
};

const getCenter = (val: number) => val * TILE_SIZE + TILE_SIZE / 2;

export default function PacmanGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const sounds = useGameSound();
    const { t } = useLanguage();

    const gameState = useRef({
        map: INITIAL_MAP.map(row => [...row]),
        dotsRemaining: INITIAL_MAP.flat().filter(cell => cell === 2 || cell === 3).length,
        pacman: {
            pos: { x: getCenter(9), y: getCenter(15) },
            dir: 'NONE' as Direction,
            nextDir: 'NONE' as Direction,
            speed: 2,
            mouthOpen: 0
        },
        ghosts: [
            { pos: { x: getCenter(9), y: getCenter(7) }, dir: 'LEFT', nextDir: 'LEFT', speed: 1.5, color: '#FF0000', state: 'CHASE', startX: 9, startY: 7 }, // Blinky (Red)
            { pos: { x: getCenter(8), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#FFB8FF', state: 'CHASE', startX: 8, startY: 9 }, // Pinky (Pink)
            { pos: { x: getCenter(9), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#00FFFF', state: 'CHASE', startX: 9, startY: 9 }, // Inky (Cyan)
            { pos: { x: getCenter(10), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#FFB852', state: 'CHASE', startX: 10, startY: 9 } // Clyde (Orange)
        ] as Ghost[],
        scaredTimer: 0,
        frameCount: 0
    });

    const initGame = useCallback(() => {
        gameState.current = {
            map: INITIAL_MAP.map(row => [...row]),
            dotsRemaining: INITIAL_MAP.flat().filter(cell => cell === 2 || cell === 3).length,
            pacman: {
                pos: { x: getCenter(9), y: getCenter(15) },
                dir: 'NONE',
                nextDir: 'NONE',
                speed: 2,
                mouthOpen: 0
            },
            ghosts: [
                { pos: { x: getCenter(9), y: getCenter(7) }, dir: 'LEFT', nextDir: 'LEFT', speed: 1.5, color: '#FF0000', state: 'CHASE', startX: 9, startY: 7 }, // Blinky
                { pos: { x: getCenter(8), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#FFB8FF', state: 'CHASE', startX: 8, startY: 9 }, // Pinky
                { pos: { x: getCenter(9), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#00FFFF', state: 'CHASE', startX: 9, startY: 9 }, // Inky
                { pos: { x: getCenter(10), y: getCenter(9) }, dir: 'UP', nextDir: 'UP', speed: 1.5, color: '#FFB852', state: 'CHASE', startX: 10, startY: 9 } // Clyde
            ],
            scaredTimer: 0,
            frameCount: 0
        };
        setScore(0);
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

        const checkCollision = (x: number, y: number, radius = TILE_SIZE / 2 - 2, isGhost = false) => {
            const map = gameState.current.map;
            const points = [
                { x, y: y - radius },
                { x, y: y + radius },
                { x: x - radius, y },
                { x: x + radius, y },
            ];

            for (const p of points) {
                const col = Math.floor(p.x / TILE_SIZE);
                const row = Math.floor(p.y / TILE_SIZE);

                if (col < 0 || col >= COLS) continue;

                if (map[row] && (map[row][col] === 1 || (!isGhost && map[row][col] === 4))) {
                    return true;
                }
            }
            return false;
        };

        const update = () => {
            const state = gameState.current;
            state.frameCount++;

            const pacman = state.pacman;

            if (pacman.nextDir !== pacman.dir && pacman.nextDir !== 'NONE') {
                const vec = dirToVec(pacman.nextDir);
                const gridX = Math.floor(pacman.pos.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
                const gridY = Math.floor(pacman.pos.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

                const snapThresh = 4;
                if (Math.abs(pacman.pos.x - gridX) < snapThresh && Math.abs(pacman.pos.y - gridY) < snapThresh) {
                    if (!checkCollision(gridX + vec.x * pacman.speed, gridY + vec.y * pacman.speed)) {
                        pacman.pos.x = gridX;
                        pacman.pos.y = gridY;
                        pacman.dir = pacman.nextDir;
                    }
                }
            }

            const vec = dirToVec(pacman.dir);
            const nextX = pacman.pos.x + vec.x * pacman.speed;
            const nextY = pacman.pos.y + vec.y * pacman.speed;

            if (!checkCollision(nextX, nextY)) {
                pacman.pos.x = nextX;
                pacman.pos.y = nextY;
            } else {
                pacman.dir = 'NONE';
            }

            if (pacman.pos.x < -TILE_SIZE / 2) pacman.pos.x = COLS * TILE_SIZE + TILE_SIZE / 2;
            if (pacman.pos.x > COLS * TILE_SIZE + TILE_SIZE / 2) pacman.pos.x = -TILE_SIZE / 2;

            pacman.mouthOpen = (state.frameCount % 20 < 10) && pacman.dir !== 'NONE' ? 0.2 : 0.05;
            const pCol = Math.floor(pacman.pos.x / TILE_SIZE);
            const pRow = Math.floor(pacman.pos.y / TILE_SIZE);

            if (pCol >= 0 && pRow >= 0 && pCol < COLS && pRow < ROWS) {
                const tile = state.map[pRow][pCol];
                if (tile === 2) {
                    sounds.playBlip();
                    state.map[pRow][pCol] = 0;
                    setScore(s => s + 10);
                    state.dotsRemaining--;
                } else if (tile === 3) {
                    sounds.playCoin();
                    state.map[pRow][pCol] = 0;
                    setScore(s => s + 50);
                    state.dotsRemaining--;
                    state.scaredTimer = 600;
                    state.ghosts.forEach(g => {
                        if (g.state !== 'EATEN') g.state = 'SCARED';
                    });
                }
            }

            if (state.dotsRemaining === 0) {
                sounds.playWin();
                setGameWon(true);
            }

            if (state.scaredTimer > 0) {
                state.scaredTimer--;
                if (state.scaredTimer === 0) {
                    state.ghosts.forEach(g => {
                        if (g.state === 'SCARED') g.state = 'CHASE';
                    });
                }
            }

            state.ghosts.forEach((ghost, i) => {
                if (ghost.pos.x < -TILE_SIZE / 2) ghost.pos.x = COLS * TILE_SIZE + TILE_SIZE / 2;
                if (ghost.pos.x > COLS * TILE_SIZE + TILE_SIZE / 2) ghost.pos.x = -TILE_SIZE / 2;

                const gridX = Math.floor(ghost.pos.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
                const gridY = Math.floor(ghost.pos.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
                const distToCenter = Math.hypot(ghost.pos.x - gridX, ghost.pos.y - gridY);

                if ((distToCenter < 2 && (ghost.lastGridX !== gridX || ghost.lastGridY !== gridY)) || ghost.dir === 'NONE') {
                    ghost.lastGridX = gridX;
                    ghost.lastGridY = gridY;
                    ghost.pos.x = gridX;
                    ghost.pos.y = gridY;

                    const possibleDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
                    const validDirs = possibleDirs.filter(d => {
                        if (d === 'UP' && ghost.dir === 'DOWN') return false;
                        if (d === 'DOWN' && ghost.dir === 'UP') return false;
                        if (d === 'LEFT' && ghost.dir === 'RIGHT') return false;
                        if (d === 'RIGHT' && ghost.dir === 'LEFT') return false;

                        const v = dirToVec(d);
                        return !checkCollision(gridX + v.x * TILE_SIZE, gridY + v.y * TILE_SIZE, TILE_SIZE / 2 - 2, true);
                    });

                    if (validDirs.length === 0) {
                        if (ghost.dir === 'UP') validDirs.push('DOWN');
                        else if (ghost.dir === 'DOWN') validDirs.push('UP');
                        else if (ghost.dir === 'LEFT') validDirs.push('RIGHT');
                        else if (ghost.dir === 'RIGHT') validDirs.push('LEFT');
                    }

                    if (validDirs.length > 0) {
                        if (ghost.state === 'CHASE' && i === 0) {
                            let bestDir = validDirs[0];
                            let minDist = Infinity;
                            validDirs.forEach(d => {
                                const v = dirToVec(d);
                                const testX = gridX + v.x * TILE_SIZE;
                                const testY = gridY + v.y * TILE_SIZE;
                                const dist = Math.hypot(testX - pacman.pos.x, testY - pacman.pos.y);
                                if (dist < minDist) {
                                    minDist = dist;
                                    bestDir = d;
                                }
                            });
                            ghost.dir = bestDir;
                        } else if (ghost.state === 'SCARED') {
                            ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                        } else if (ghost.state === 'EATEN') {
                            let bestDir = validDirs[0];
                            let minDist = Infinity;
                            const targetX = getCenter(ghost.startX);
                            const targetY = getCenter(ghost.startY);
                            validDirs.forEach(d => {
                                const v = dirToVec(d);
                                const testX = gridX + v.x * TILE_SIZE;
                                const testY = gridY + v.y * TILE_SIZE;
                                const dist = Math.hypot(testX - targetX, testY - targetY);
                                if (dist < minDist) {
                                    minDist = dist;
                                    bestDir = d;
                                }
                            });
                            ghost.dir = bestDir;

                            if (Math.floor(ghost.pos.x / TILE_SIZE) === ghost.startX && Math.floor(ghost.pos.y / TILE_SIZE) === ghost.startY) {
                                ghost.state = 'CHASE';
                            }
                        } else {
                            ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                        }
                    } else {
                        ghost.dir = 'NONE';
                    }
                }

                // Mover fantasma
                const gVec = dirToVec(ghost.dir);
                const gSpeed = ghost.state === 'SCARED' ? ghost.speed * 0.6 : (ghost.state === 'EATEN' ? ghost.speed * 2 : ghost.speed);
                ghost.pos.x += gVec.x * gSpeed;
                ghost.pos.y += gVec.y * gSpeed;

                // Colisión con Pacman
                const distToPacman = Math.hypot(ghost.pos.x - pacman.pos.x, ghost.pos.y - pacman.pos.y);
                if (distToPacman < TILE_SIZE * 0.8) {
                    if (ghost.state === 'SCARED') {
                        sounds.playPing();
                        ghost.state = 'EATEN';
                        setScore(s => s + 200);
                    } else if (ghost.state === 'CHASE' || ghost.state === 'SCATTER') {
                        sounds.playCrash();
                        setGameOver(true);
                    }
                }
            });
        };

        const draw = () => {
            const state = gameState.current;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const tile = state.map[row]?.[col];
                    if (tile === 1) {
                        ctx.fillStyle = '#1e3a8a';
                        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        ctx.strokeStyle = '#3b82f6';
                        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    } else if (tile === 2) {
                        ctx.fillStyle = '#fef08a';
                        ctx.beginPath();
                        ctx.arc(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 2, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (tile === 3) {
                        ctx.fillStyle = '#fef08a';
                        if (state.frameCount % 30 < 15) {
                            ctx.beginPath();
                            ctx.arc(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 6, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    } else if (tile === 4) {
                        ctx.fillStyle = '#fdba74';
                        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
                    }
                }
            }
            // Dibujar Pacman
            const pacman = state.pacman;
            ctx.save();
            ctx.translate(pacman.pos.x, pacman.pos.y);

            if (pacman.dir === 'RIGHT' || pacman.dir === 'NONE') ctx.rotate(0);
            if (pacman.dir === 'DOWN') ctx.rotate(Math.PI / 2);
            if (pacman.dir === 'LEFT') ctx.rotate(Math.PI);
            if (pacman.dir === 'UP') ctx.rotate(-Math.PI / 2);

            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(0, 0, TILE_SIZE / 2 - 2, pacman.mouthOpen * Math.PI, (2 - pacman.mouthOpen) * Math.PI);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.restore();

            // Dibujar Fantasmas
            state.ghosts.forEach(ghost => {
                ctx.save();
                ctx.translate(ghost.pos.x, ghost.pos.y);

                if (ghost.state === 'EATEN') {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(-3, -2, 2, 0, Math.PI * 2);
                    ctx.arc(3, -2, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = 'blue';
                    ctx.beginPath();
                    ctx.arc(-3, -2, 1, 0, Math.PI * 2);
                    ctx.arc(3, -2, 1, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = ghost.state === 'SCARED' ? (state.scaredTimer < 120 && state.frameCount % 20 < 10 ? '#ffffff' : '#1d4ed8') : ghost.color;

                    ctx.beginPath();
                    ctx.arc(0, 0, TILE_SIZE / 2 - 2, Math.PI, 0);
                    ctx.lineTo(TILE_SIZE / 2 - 2, TILE_SIZE / 2 - 2);
                    ctx.lineTo(TILE_SIZE / 4, TILE_SIZE / 2 - 5);
                    ctx.lineTo(0, TILE_SIZE / 2 - 2);
                    ctx.lineTo(-TILE_SIZE / 4, TILE_SIZE / 2 - 5);

                    ctx.lineTo(-TILE_SIZE / 2 + 2, TILE_SIZE / 2 - 2);
                    ctx.closePath();
                    ctx.fill();

                    if (ghost.state !== 'SCARED') {
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
                        ctx.arc(3, -2, 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = 'blue';

                        let eX = 0, eY = 0;
                        if (ghost.dir === 'RIGHT') eX = 1;
                        if (ghost.dir === 'LEFT') eX = -1;
                        if (ghost.dir === 'UP') eY = -1;
                        if (ghost.dir === 'DOWN') eY = 1;

                        ctx.beginPath();
                        ctx.arc(-3 + eX, -2 + eY, 1, 0, Math.PI * 2);
                        ctx.arc(3 + eX, -2 + eY, 1, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.strokeStyle = '#fca5a5';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(-4, -2); ctx.lineTo(-2, -2);
                        ctx.moveTo(2, -2); ctx.lineTo(4, -2);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(-4, 3); ctx.lineTo(-2, 1); ctx.lineTo(0, 3); ctx.lineTo(2, 1); ctx.lineTo(4, 3);
                        ctx.stroke();
                    }
                }
                ctx.restore();
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
    }, [isPlaying, gameOver, gameWon]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const pacman = gameState.current.pacman;
            if (e.key === 'ArrowUp' || e.key === 'w') pacman.nextDir = 'UP';
            if (e.key === 'ArrowDown' || e.key === 's') pacman.nextDir = 'DOWN';
            if (e.key === 'ArrowLeft' || e.key === 'a') pacman.nextDir = 'LEFT';
            if (e.key === 'ArrowRight' || e.key === 'd') pacman.nextDir = 'RIGHT';

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 relative font-[monospace] overflow-hidden">

            {!isPlaying && !gameOver && !gameWon && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-yellow-400">
                    <h1 className="text-4xl font-bold tracking-widest mb-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">{t('pacman.title')}</h1>
                    <div className="space-y-4 text-center text-sm text-gray-300 mb-8">
                        <div className="flex items-center gap-4 text-red-500"><span className="w-6 h-6 bg-red-500 rounded-t-full rounded-b-sm"></span> <span>BLINKY</span></div>
                        <div className="flex items-center gap-4 text-pink-400"><span className="w-6 h-6 bg-pink-400 rounded-t-full rounded-b-sm"></span> <span>PINKY</span></div>
                        <div className="flex items-center gap-4 text-cyan-400"><span className="w-6 h-6 bg-cyan-400 rounded-t-full rounded-b-sm"></span> <span>INKY</span></div>
                        <div className="flex items-center gap-4 text-orange-400"><span className="w-6 h-6 bg-orange-400 rounded-t-full rounded-b-sm"></span> <span>CLYDE</span></div>
                    </div>
                    <p className="mb-8 text-center">{t('pacman.instructions')}</p>
                    <button
                        onClick={initGame}
                        className="px-8 py-3 bg-yellow-400 text-black font-bold uppercase rounded hover:bg-yellow-300 transition-colors"
                    >
                        {t('pacman.insert_coin')}
                    </button>
                </div>
            )}

            {(gameOver || gameWon) && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                    <h2 className={`text-4xl font-bold mb-4 ${gameWon ? 'text-green-400' : 'text-red-500'}`}>
                        {gameWon ? t('pacman.you_win') : t('pacman.game_over')}
                    </h2>
                    <p className="text-xl text-white mb-8">{t('pacman.final_score').replace('{score}', score.toString())}</p>
                    <button
                        onClick={initGame}
                        className="px-6 py-2 bg-yellow-400 text-black font-bold uppercase rounded hover:bg-yellow-300 transition-colors"
                    >
                        {t('pacman.play_again')}
                    </button>
                </div>
            )}

            <div className="w-full max-w-[380px] flex justify-between items-center mb-4 text-white uppercase px-2 font-bold z-0">
                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs">{t('pacman.score')}</span>
                    <span className="text-xl tracking-wider">{score}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-gray-400 text-xs text-yellow-400">{t('pacman.hi_score')}</span>
                    <span className="text-xl tracking-wider">10000</span>
                </div>
            </div>

            <div className="bg-black border-2 border-blue-800 rounded-lg p-1 shadow-[0_0_20px_rgba(30,58,138,0.3)] z-0">
                <canvas
                    ref={canvasRef}
                    width={COLS * TILE_SIZE}
                    height={ROWS * TILE_SIZE}
                    className="block shadow-inner"
                />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-48">
                <div className="col-start-2">
                    <button
                        className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 text-white flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); gameState.current.pacman.nextDir = 'UP'; }}
                        onMouseDown={() => gameState.current.pacman.nextDir = 'UP'}
                    >▲</button>
                </div>
                <div className="col-start-1 col-span-3 grid grid-cols-3 gap-2">
                    <button
                        className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 text-white flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); gameState.current.pacman.nextDir = 'LEFT'; }}
                        onMouseDown={() => gameState.current.pacman.nextDir = 'LEFT'}
                    >◀</button>
                    <button
                        className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 text-white flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); gameState.current.pacman.nextDir = 'DOWN'; }}
                        onMouseDown={() => gameState.current.pacman.nextDir = 'DOWN'}
                    >▼</button>
                    <button
                        className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 text-white flex items-center justify-center border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
                        onTouchStart={(e) => { e.preventDefault(); gameState.current.pacman.nextDir = 'RIGHT'; }}
                        onMouseDown={() => gameState.current.pacman.nextDir = 'RIGHT'}
                    >▶</button>
                </div>
            </div>
        </div>
    );
}
