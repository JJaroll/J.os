'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RefreshCw, Trophy, Skull } from 'lucide-react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

const ROWS = 10;
const COLS = 10;
const MINES = 10;

interface CellState {
    row: number;
    col: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
}

type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export default function MinesweeperGame() {
    const [grid, setGrid] = useState<CellState[][]>([]);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [minesLeft, setMinesLeft] = useState(MINES);
    const [time, setTime] = useState(0);
    const sounds = useGameSound();
    const { t } = useLanguage();

    // Inicializar el tablero
    const initializeBoard = useCallback(() => {
        // Paso 1: Crear cuadrícula vacía
        let newGrid: CellState[][] = [];
        for (let r = 0; r < ROWS; r++) {
            const row: CellState[] = [];
            for (let c = 0; c < COLS; c++) {
                row.push({
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            newGrid.push(row);
        }

        // Paso 2: Colocar minas aleatoriamente
        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (!newGrid[r][c].isMine) {
                newGrid[r][c].isMine = true;
                minesPlaced++;
            }
        }

        // Paso 3: Calcular minas vecinas
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!newGrid[r][c].isMine) {
                    let count = 0;
                    // Comprobar los 8 vecinos
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const nr = r + i;
                            const nc = c + j;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                                if (newGrid[nr][nc].isMine) count++;
                            }
                        }
                    }
                    newGrid[r][c].neighborMines = count;
                }
            }
        }

        setGrid(newGrid);
        setStatus('playing');
        setMinesLeft(MINES);
        setTime(0);
    }, []);

    // Iniciar temporizador
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'playing') {
            timer = setInterval(() => {
                setTime(prev => Math.min(prev + 1, 999));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    // Carga inicial
    useEffect(() => {
        initializeBoard();
    }, [initializeBoard]);

    const revealCell = (r: number, c: number) => {
        if (status !== 'playing' || grid[r][c].isRevealed || grid[r][c].isFlagged) {
            return;
        }

        const newGrid = [...grid.map(row => [...row])];
        const cell = newGrid[r][c];

        if (cell.isMine) {
            // Fin del juego.
            sounds.playCrash();
            cell.isRevealed = true;
            // Revelar todas las demás minas
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (newGrid[i][j].isMine) {
                        newGrid[i][j].isRevealed = true;
                    }
                }
            }
            setGrid(newGrid);
            setStatus('lost');
            return;
        }

        // Revelar celdas vacías en cascada
        const queue: [number, number][] = [[r, c]];
        let revealedCount = 0;

        // Contar celdas ya reveladas para comprobar condición de victoria
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                if (grid[i][j].isRevealed) revealedCount++;
            }
        }

        sounds.playBlip();

        while (queue.length > 0) {
            const [currR, currC] = queue.shift()!;
            const currCell = newGrid[currR][currC];

            if (!currCell.isRevealed && !currCell.isFlagged) {
                currCell.isRevealed = true;
                revealedCount++;

                if (currCell.neighborMines === 0) {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const nr = currR + i;
                            const nc = currC + j;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                                if (!newGrid[nr][nc].isRevealed) {
                                    queue.push([nr, nc]);
                                }
                            }
                        }
                    }
                }
            }
        }

        setGrid(newGrid);

        // Comprobar Condición de Victoria
        if (revealedCount === ROWS * COLS - MINES) {
            sounds.playWin();
            setStatus('won');
            // Marcar minas restantes automáticamente
            setMinesLeft(0);
        }
    };

    const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        if (status !== 'playing' || grid[r][c].isRevealed) {
            return;
        }

        const newGrid = [...grid.map(row => [...row])];
        const cell = newGrid[r][c];

        sounds.playPong();

        if (!cell.isFlagged && minesLeft > 0) {
            cell.isFlagged = true;
            setMinesLeft(prev => prev - 1);
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            setMinesLeft(prev => prev + 1);
        }

        setGrid(newGrid);
    };

    const getNumberColor = (num: number) => {
        switch (num) {
            case 1: return 'text-blue-500';
            case 2: return 'text-green-600';
            case 3: return 'text-red-500';
            case 4: return 'text-purple-600';
            case 5: return 'text-red-800';
            case 6: return 'text-cyan-600';
            case 7: return 'text-black';
            case 8: return 'text-gray-600';
            default: return '';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-os-bg p-6 overflow-hidden select-none">

            <div className="bg-[#c0c0c0] p-4 rounded shadow-[inset_2px_2px_0_white,inset_-2px_-2px_0_#808080] border-2 border-[#dfdfdf] inline-block">

                <div className="flex justify-between items-center bg-[#c0c0c0] shadow-[inset_-2px_-2px_0_white,inset_2px_2px_0_#808080] p-2 mb-4">
                    <div className="bg-black text-red-500 font-mono text-2xl px-2 py-1 min-w-[3.5rem] text-right font-bold tracking-widest shadow-[inset_2px_2px_0_#808080]">
                        {minesLeft.toString().padStart(3, '0')}
                    </div>

                    <button
                        onClick={initializeBoard}
                        className="w-10 h-10 flex items-center justify-center bg-[#c0c0c0] shadow-[inset_2px_2px_0_white,inset_-2px_-2px_0_#808080] hover:shadow-[inset_-1px_-1px_0_white,inset_1px_1px_0_#808080] active:bg-[#dfdfdf] transition-shadow"
                    >
                        {status === 'playing' || status === 'idle' ? (
                            <span className="text-xl">🙂</span>
                        ) : status === 'won' ? (
                            <span className="text-xl flex items-center justify-center text-yellow-600"><Trophy size={20} /></span>
                        ) : (
                            <span className="text-xl flex items-center justify-center text-red-600"><Skull size={20} /></span>
                        )}
                    </button>

                    <div className="bg-black text-red-500 font-mono text-2xl px-2 py-1 min-w-[3.5rem] text-right font-bold tracking-widest shadow-[inset_2px_2px_0_#808080]">
                        {time.toString().padStart(3, '0')}
                    </div>
                </div>

                <div className="bg-[#808080] shadow-[inset_3px_3px_0_#808080,inset_-3px_-3px_0_white] p-1 border-t-2 border-l-2 border-[#808080]">
                    <div
                        className="grid gap-[1px] bg-[#808080]"
                        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                    >
                        {grid.map((row, r) => (
                            row.map((cell, c) => (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => revealCell(r, c)}
                                    onContextMenu={(e) => toggleFlag(e, r, c)}
                                    className={`
                                w-8 h-8 flex items-center justify-center font-bold text-lg font-mono leading-none
                                ${cell.isRevealed
                                            ? 'bg-[#c0c0c0] shadow-[inset_-0.5px_-0.5px_0_white,inset_0.5px_0.5px_0_#808080]'
                                            : 'bg-[#c0c0c0] shadow-[inset_2px_2px_0_white,inset_-2px_-2px_0_#808080] hover:bg-[#dfdfdf]'}
                                ${cell.isRevealed && cell.isMine && status === 'lost' ? 'bg-red-500' : ''}
                                                `}
                                >
                                    {cell.isRevealed && cell.isMine && <Bomb size={18} className="text-black" />}
                                    {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
                                        <span className={getNumberColor(cell.neighborMines)}>
                                            {cell.neighborMines}
                                        </span>
                                    )}
                                    {!cell.isRevealed && cell.isFlagged && <Flag size={16} className="text-red-600 fill-red-600" />}
                                    {!cell.isRevealed && status === 'won' && cell.isMine && !cell.isFlagged && <Flag size={16} className="text-red-600" />}
                                </button>
                            ))
                        ))}
                    </div>
                </div>

            </div >

            {
                status === 'won' && (
                    <div className="mt-6 text-green-500 font-bold text-xl animate-bounce tracking-widest drop-shadow-md">
                        {t('minesweeper.you_win')}
                    </div>
                )
            }
            {
                status === 'lost' && (
                    <div className="mt-6 text-red-500 font-bold text-xl tracking-widest drop-shadow-md">
                        {t('minesweeper.game_over')}
                    </div>
                )
            }

        </div >
    );
}
