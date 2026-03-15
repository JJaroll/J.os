'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Lightbulb } from 'lucide-react';
import { useGameSound } from '@/hooks/useGameSound';
import { useLanguage } from '@/context/LanguageContext';

// --- Types ---
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface CardDef {
    id: string;
    suit: Suit;
    rank: Rank;
    value: number; // 1–13
    color: 'red' | 'black';
    isFaceUp: boolean;
}

interface HintMove {
    cardId: string;               // card to highlight as "from"
    destCardId?: string;          // top card of destination (highlight as "to")
    destCol?: number;             // tableau dest column (for empty col)
    destFoundation?: number;      // foundation index
    label: string;                // human-readable description
}

// --- Constants & helpers ---
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_SYMBOL: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

const getCardColor = (suit: Suit): 'red' | 'black' =>
    suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';

const createDeck = (): CardDef[] => {
    const deck: CardDef[] = [];
    let idCounter = 0;
    for (const suit of SUITS) {
        for (let i = 0; i < RANKS.length; i++) {
            deck.push({ id: `card-${idCounter++}`, suit, rank: RANKS[i], value: i + 1, color: getCardColor(suit), isFaceUp: false });
        }
    }
    return deck;
};

const shuffle = (array: CardDef[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// --- Componente de carta ---
const CardComponent = ({
    card, onClick, className = '', style, highlighted
}: {
    card: CardDef; onClick?: () => void; className?: string; style?: React.CSSProperties; highlighted?: boolean;
}) => {
    const isRed = card.color === 'red';
    const suitSymbol = SUIT_SYMBOL[card.suit];

    const highlightRing = highlighted ? 'ring-4 ring-green-400 ring-offset-1 z-[100]' : '';

    if (!card.isFaceUp) {
        return (
            <div
                onClick={onClick}
                className={`w-16 h-24 rounded shadow-md border-2 border-white bg-blue-800 flex items-center justify-center cursor-pointer select-none ${highlightRing} ${className}`}
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)',
                    ...style
                }}
            />
        );
    }

    return (
        <div
            onClick={onClick}
            className={`w-16 h-24 rounded shadow-md border border-gray-300 bg-white flex flex-col justify-between p-1.5 cursor-pointer select-none ${isRed ? 'text-red-500' : 'text-black'} ${highlightRing} ${className}`}
            style={style}
        >
            <div className="text-sm font-bold leading-none">{card.rank}</div>
            <div className="text-2xl text-center flex-1 flex items-center justify-center -mt-2">{suitSymbol}</div>
            <div className="text-sm font-bold leading-none self-end rotate-180">{card.rank}</div>
        </div>
    );
};

// --- Overlay de celebración de victoria ---
const WinOverlay = ({ onNewGame, label, playAgain }: { onNewGame: () => void; label: string; playAgain: string }) => {
    const cards = ['♠', '♥', '♦', '♣'];

    return (
        <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden">
            {/* Lluvia de cartas en cascada */}
            {Array.from({ length: 20 }).map((_, i) => (
                <span
                    key={i}
                    className="absolute text-2xl select-none pointer-events-none animate-[fall_linear_infinite]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${1.5 + Math.random() * 2}s`,
                        animationDelay: `${Math.random() * 2}s`,
                        color: i % 2 === 0 ? '#f87171' : 'white',
                    }}
                >
                    {cards[i % 4]}
                </span>
            ))}

            {/* Mensaje de victoria */}
            <div className="relative z-10 flex flex-col items-center gap-6 animate-in zoom-in fade-in duration-500">
                <div className="text-6xl animate-bounce">🏆</div>
                <h2 className="text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-widest text-center">
                    {label}
                </h2>
                <button
                    onClick={onNewGame}
                    className="mt-4 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-full shadow-[0_4px_0_#b45309] active:shadow-none active:translate-y-1 transition-all text-lg"
                >
                    {playAgain}
                </button>
            </div>

            <style>{`
                @keyframes fall {
                    0%   { transform: translateY(-40px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg);  opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

// ============================================================
// Main component
// ============================================================
export default function SolitaireGame() {
    const [stock, setStock] = useState<CardDef[]>([]);
    const [waste, setWaste] = useState<CardDef[]>([]);
    const [foundations, setFoundations] = useState<CardDef[][]>([[], [], [], []]);
    const [tableau, setTableau] = useState<CardDef[][]>([[], [], [], [], [], [], []]);
    const [selectedCard, setSelectedCard] = useState<{ src: 'waste' | 'foundation' | 'tableau'; colIndex?: number; cardIndex: number; card: CardDef } | null>(null);
    const [hint, setHint] = useState<HintMove | null>(null);
    const [hintMsg, setHintMsg] = useState<string>('');
    const [hasWon, setHasWon] = useState(false);

    const sounds = useGameSound();
    const { t } = useLanguage();

    // --- Inicialización ---
    const startNewGame = useCallback(() => {
        const deck = shuffle(createDeck());
        const newTableau: CardDef[][] = [[], [], [], [], [], [], []];
        let cardIndex = 0;
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = { ...deck[cardIndex++] };
                if (row === col) card.isFaceUp = true;
                newTableau[col].push(card);
            }
        }
        setTableau(newTableau);
        setStock(deck.slice(cardIndex));
        setWaste([]);
        setFoundations([[], [], [], []]);
        setSelectedCard(null);
        setHint(null);
        setHintMsg('');
        setHasWon(false);
    }, []);

    useEffect(() => { startNewGame(); }, [startNewGame]);

    // --- Detección de victoria ---
    useEffect(() => {
        const totalInFoundations = foundations.reduce((sum, f) => sum + f.length, 0);
        if (totalInFoundations === 52) {
            sounds.playCoin();
            setHasWon(true);
        }
    }, [foundations, sounds]);

    // --- Motor de pistas ---
    const computeHint = useCallback((): HintMove | null => {
        // Recopilar todas las cartas visibles y movibles: top of waste & all face-up in tableau
        const candidates: Array<{ card: CardDef; src: 'waste' | 'tableau'; colIndex?: number; cardIndex?: number }> = [];

        if (waste.length > 0) candidates.push({ card: waste[waste.length - 1], src: 'waste' });

        for (let col = 0; col < tableau.length; col++) {
            for (let ci = 0; ci < tableau[col].length; ci++) {
                if (tableau[col][ci].isFaceUp) {
                    candidates.push({ card: tableau[col][ci], src: 'tableau', colIndex: col, cardIndex: ci });
                }
            }
        }

        // Prioridad 1: mover a fundación
        for (const { card, src, colIndex } of candidates) {
            // Solo la carta superior puede ir a la fundación
            const isTop = src === 'waste' || (src === 'tableau' && tableau[colIndex!][tableau[colIndex!].length - 1].id === card.id);
            if (!isTop) continue;

            for (let fi = 0; fi < 4; fi++) {
                const top = foundations[fi];
                const valid = top.length === 0 ? card.value === 1 : (card.suit === top[top.length - 1].suit && card.value === top[top.length - 1].value + 1);
                if (valid) {
                    return { cardId: card.id, destFoundation: fi, label: `${card.rank}${SUIT_SYMBOL[card.suit]}` };
                }
            }
        }

        // Prioridad 2: mover entre columnas del tablero
        for (const { card, src, colIndex, cardIndex } of candidates) {
            if (src !== 'tableau') continue;
            for (let destCol = 0; destCol < tableau.length; destCol++) {
                if (destCol === colIndex) continue;
                const destTop = tableau[destCol].length > 0 ? tableau[destCol][tableau[destCol].length - 1] : null;
                const valid = destTop === null ? card.value === 13 : (card.color !== destTop.color && card.value === destTop.value - 1);
                if (valid) {
                    // Avoid moving a king to an empty column if it's already alone (no benefit)
                    if (!destTop && card.value === 13 && cardIndex === 0 && tableau[colIndex!].length === 1) continue;
                    return {
                        cardId: card.id,
                        destCardId: destTop?.id,
                        destCol: destTop ? undefined : destCol,
                        label: `${card.rank}${SUIT_SYMBOL[card.suit]}`,
                    };
                }
            }
        }

        // Prioridad 3: pila de descarte → tablero
        if (waste.length > 0) {
            const card = waste[waste.length - 1];
            for (let destCol = 0; destCol < tableau.length; destCol++) {
                const destTop = tableau[destCol].length > 0 ? tableau[destCol][tableau[destCol].length - 1] : null;
                const valid = destTop === null ? card.value === 13 : (card.color !== destTop.color && card.value === destTop.value - 1);
                if (valid) {
                    return { cardId: card.id, destCardId: destTop?.id, destCol: destTop ? undefined : destCol, label: `${card.rank}${SUIT_SYMBOL[card.suit]}` };
                }
            }
        }

        return null; // no se encontró pista
    }, [waste, tableau, foundations]);

    const handleHint = () => {
        setSelectedCard(null);
        const move = computeHint();
        if (!move) {
            setHint(null);
            setHintMsg(t('solitaire.no_hint'));
            setTimeout(() => setHintMsg(''), 2500);
            return;
        }

        // Construir la carta destino para la etiqueta
        let destCard: CardDef | undefined;
        if (move.destCardId) {
            // find it in tableau or foundation
            for (const col of tableau) {
                const f = col.find(c => c.id === move.destCardId);
                if (f) { destCard = f; break; }
            }
        }

        const label = t('solitaire.hint')
            .replace('{rank}', move.label.slice(0, -1))
            .replace('{suit}', move.label.slice(-1))
            .replace('{destRank}', destCard ? destCard.rank : 'K')
            .replace('{destSuit}', destCard ? SUIT_SYMBOL[destCard.suit] : '');

        setHint(move);
        setHintMsg(label);

        // Limpiar pista después de 2.5 segundos
        setTimeout(() => {
            setHint(null);
            setHintMsg('');
        }, 2500);
    };

    // Helpers para verificar si una carta está resaltada por la pista
    const isHintFrom = (cardId: string) => hint?.cardId === cardId;
    const isHintTo = (cardId: string) => hint?.destCardId === cardId;

    // --- Acciones del juego) ---
    const handleStockClick = () => {
        setSelectedCard(null);
        setHint(null);
        sounds.playBlip();
        if (stock.length > 0) {
            const newStock = [...stock];
            const drawnCard = newStock.pop()!;
            drawnCard.isFaceUp = true;
            setStock(newStock);
            setWaste([...waste, drawnCard]);
        } else if (waste.length > 0) {
            const newStock = [...waste].reverse().map(c => ({ ...c, isFaceUp: false }));
            setStock(newStock);
            setWaste([]);
        }
    };

    const handleWasteClick = () => {
        if (waste.length === 0) return;
        const topWasteCard = waste[waste.length - 1];
        if (selectedCard?.card.id === topWasteCard.id) {
            setSelectedCard(null);
        } else {
            sounds.playBlip();
            setSelectedCard({ src: 'waste', cardIndex: waste.length - 1, card: topWasteCard });
        }
    };

    const handleFoundationClick = (fIndex: number) => {
        const foundation = foundations[fIndex];
        const topFoundationCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;

        if (selectedCard) {
            const cardToPlace = selectedCard.card;
            const isSingleCardMoved =
                selectedCard.src === 'waste' ||
                (selectedCard.src === 'tableau' && selectedCard.colIndex !== undefined && selectedCard.cardIndex === tableau[selectedCard.colIndex].length - 1);

            let isValid = false;
            if (isSingleCardMoved) {
                if (topFoundationCard === null) isValid = cardToPlace.value === 1;
                else isValid = cardToPlace.suit === topFoundationCard.suit && cardToPlace.value === topFoundationCard.value + 1;
            }

            if (isValid) {
                sounds.playCoin();
                const newFoundations = [...foundations];
                newFoundations[fIndex] = [...foundation, cardToPlace];
                setFoundations(newFoundations);

                if (selectedCard.src === 'waste') {
                    setWaste(waste.slice(0, -1));
                } else if (selectedCard.src === 'tableau' && selectedCard.colIndex !== undefined) {
                    const newTableau = [...tableau];
                    newTableau[selectedCard.colIndex] = newTableau[selectedCard.colIndex].slice(0, -1);
                    if (newTableau[selectedCard.colIndex].length > 0) {
                        newTableau[selectedCard.colIndex][newTableau[selectedCard.colIndex].length - 1].isFaceUp = true;
                    }
                    setTableau(newTableau);
                }
                setSelectedCard(null);
                setHint(null);
                return;
            }
        }

        if (topFoundationCard && !selectedCard) {
            sounds.playBlip();
            setSelectedCard({ src: 'foundation', colIndex: fIndex, cardIndex: foundation.length - 1, card: topFoundationCard });
        } else {
            setSelectedCard(null);
        }
    };

    const handleTableauClick = (colIndex: number, clickedCardIndex: number) => {
        const col = tableau[colIndex];
        const clickedCard = col[clickedCardIndex];

        if (selectedCard) {
            const destTopCard = col.length > 0 ? col[col.length - 1] : null;

            if (clickedCardIndex !== col.length - 1 && col.length !== 0) {
                if (clickedCard?.isFaceUp) {
                    setSelectedCard({ src: 'tableau', colIndex, cardIndex: clickedCardIndex, card: clickedCard });
                }
                return;
            }

            let isValid = false;
            if (destTopCard === null) isValid = selectedCard.card.value === 13;
            else isValid = selectedCard.card.color !== destTopCard.color && selectedCard.card.value === destTopCard.value - 1;

            if (isValid) {
                sounds.playPing();
                const newTableau = [...tableau];
                let cardsToMove: CardDef[] = [];

                if (selectedCard.src === 'waste') {
                    cardsToMove = [selectedCard.card];
                    setWaste(waste.slice(0, -1));
                } else if (selectedCard.src === 'foundation' && selectedCard.colIndex !== undefined) {
                    cardsToMove = [selectedCard.card];
                    const newFoundations = [...foundations];
                    newFoundations[selectedCard.colIndex] = newFoundations[selectedCard.colIndex].slice(0, -1);
                    setFoundations(newFoundations);
                } else if (selectedCard.src === 'tableau' && selectedCard.colIndex !== undefined) {
                    cardsToMove = tableau[selectedCard.colIndex].slice(selectedCard.cardIndex);
                    newTableau[selectedCard.colIndex] = newTableau[selectedCard.colIndex].slice(0, selectedCard.cardIndex);
                    if (newTableau[selectedCard.colIndex].length > 0) {
                        newTableau[selectedCard.colIndex][newTableau[selectedCard.colIndex].length - 1].isFaceUp = true;
                    }
                }

                newTableau[colIndex] = [...col, ...cardsToMove];
                setTableau(newTableau);
                setSelectedCard(null);
                setHint(null);
                return;
            }
        }

        if (clickedCard) {
            if (!clickedCard.isFaceUp) {
                if (clickedCardIndex === col.length - 1) {
                    sounds.playBlip();
                    const newTableau = [...tableau];
                    newTableau[colIndex][clickedCardIndex].isFaceUp = true;
                    setTableau(newTableau);
                }
                setSelectedCard(null);
            } else {
                if (selectedCard?.card.id === clickedCard.id) {
                    setSelectedCard(null);
                } else {
                    sounds.playBlip();
                    setSelectedCard({ src: 'tableau', colIndex, cardIndex: clickedCardIndex, card: clickedCard });
                }
            }
        } else {
            setSelectedCard(null);
        }
    };

    return (
        <div className="w-full h-full bg-[#007F2E] flex flex-col p-4 select-none overflow-hidden font-sans relative">

            {/* Win overlay */}
            {hasWon && (
                <WinOverlay
                    onNewGame={startNewGame}
                    label={t('solitaire.you_win')}
                    playAgain={t('solitaire.play_again')}
                />
            )}

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={startNewGame}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        <RefreshCcw size={16} />
                        {t('solitaire.new_game')}
                    </button>
                    <button
                        onClick={handleHint}
                        className="flex items-center gap-2 bg-yellow-400/80 hover:bg-yellow-400 text-gray-900 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        <Lightbulb size={16} />
                        Hint
                    </button>
                </div>
                <div className="text-white font-bold opacity-50 pointer-events-none tracking-widest">
                    {t('solitaire.title')}
                </div>
            </div>

            {/* Top row: Stock, Waste, Foundations */}
            <div className="flex justify-between items-start mb-8 h-24">
                <div className="flex gap-4">
                    {/* Stock */}
                    <div
                        className={`w-16 h-24 rounded border-2 border-dashed ${stock.length === 0 ? 'border-white/30 cursor-pointer flex items-center justify-center hover:bg-white/10' : 'border-transparent'} relative`}
                        onClick={handleStockClick}
                    >
                        {stock.length > 0 ? (
                            <div className="absolute inset-0">
                                {stock.slice(-3).map((card, i) => (
                                    <CardComponent key={card.id} card={card} className="absolute" style={{ top: -i * 1, left: -i * 1 }} />
                                ))}
                            </div>
                        ) : (
                            <RefreshCcw size={24} className="text-white/50" />
                        )}
                    </div>

                    {/* Waste */}
                    <div className="w-16 h-24 relative">
                        {waste.length > 0 && (
                            <div className={`absolute inset-0 ${selectedCard?.card.id === waste[waste.length - 1].id ? 'ring-4 ring-yellow-400 rounded' : ''} transition-all`}>
                                <CardComponent
                                    card={waste[waste.length - 1]}
                                    onClick={handleWasteClick}
                                    highlighted={isHintFrom(waste[waste.length - 1].id)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Foundations */}
                <div className="flex gap-4">
                    {foundations.map((foundation, i) => {
                        const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null;
                        const isHintDest = hint?.destFoundation === i;
                        return (
                            <div
                                key={`f-${i}`}
                                className={`w-16 h-24 rounded border-2 border-dashed ${isHintDest ? 'border-green-400 bg-green-900/20' : 'border-white/30'} flex items-center justify-center relative cursor-pointer transition-colors`}
                                onClick={() => handleFoundationClick(i)}
                            >
                                {topCard ? (
                                    <div className={`absolute inset-0 ${selectedCard?.card.id === topCard.id ? 'ring-4 ring-yellow-400 rounded' : ''}`}>
                                        <CardComponent card={topCard} highlighted={isHintTo(topCard.id)} />
                                    </div>
                                ) : (
                                    <div className="text-white/20 text-4xl font-serif">A</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tableau */}
            <div className="flex justify-between flex-1 overflow-x-auto min-w-0 pb-4">
                {tableau.map((col, colIndex) => {
                    // Check if this empty column is the hint destination
                    const isHintEmptyDest = hint?.destCol === colIndex && col.length === 0;
                    return (
                        <div
                            key={`col-${colIndex}`}
                            className="w-16 relative flex-shrink-0"
                            onClick={() => col.length === 0 && handleTableauClick(colIndex, -1)}
                        >
                            {col.length === 0 ? (
                                <div className={`w-16 h-24 rounded border-2 border-dashed ${isHintEmptyDest ? 'border-green-400 bg-green-900/20' : 'border-white/30'} transition-colors`} />
                            ) : (
                                col.map((card, cardIndex) => {
                                    const isSelected = selectedCard?.card.id === card.id ||
                                        (selectedCard?.src === 'tableau' && selectedCard.colIndex === colIndex && cardIndex >= selectedCard.cardIndex);
                                    return (
                                        <div
                                            key={card.id}
                                            className={`absolute w-full ${isSelected ? 'ring-4 ring-yellow-400 z-50 rounded shadow-2xl' : ''}`}
                                            style={{ top: cardIndex * 24, zIndex: cardIndex }}
                                            onClick={(e) => { e.stopPropagation(); handleTableauClick(colIndex, cardIndex); }}
                                        >
                                            <CardComponent
                                                card={card}
                                                highlighted={isHintFrom(card.id) || isHintTo(card.id)}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Toast de estado: instrucción de carta seleccionada o mensaje de pista */}
            {(selectedCard || hintMsg) && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-50 shadow-xl pointer-events-none text-center max-w-xs
                    bg-black/70 text-white animate-pulse">
                    {hintMsg
                        ? hintMsg
                        : selectedCard
                            ? t('solitaire.instruction')
                                .replace('{rank}', selectedCard.card.rank)
                                .replace('{suit}', selectedCard.card.color === 'red' ? '♥♦' : '♣♠')
                            : ''}
                </div>
            )}
        </div>
    );
}
