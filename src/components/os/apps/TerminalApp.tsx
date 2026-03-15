'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CommandOutput {
    type: 'input' | 'output' | 'error';
    content: string;
}

const NEOFETCH_OUTPUT = `    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║      ██╗     ██╗  █████╗ ██████╗  ██████╗ ██╗     ██╗         ║
    ║      ██║     ██║ ██╔══██╗██╔══██╗██╔═══██╗██║     ██║         ║
    ║      ██║     ██║ ███████║██████╔╝██║   ██║██║     ██║         ║
    ║ ██╗  ██║██╗  ██║ ██╔══██║██╔══██╗██║   ██║██║     ██║         ║
    ║ ╚█████╔╝╚█████╔╝ ██║  ██║██║  ██║╚██████╔╝███████╗███████╗    ║
    ║  ╚════╝  ╚════╝  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝    ║
    ║                                                               ║
    ║   J.OS v1.0.0 - "Dando vida a los píxeles."                   ║
    ║   GitHub: github.com/JJaroll                                  ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝`;

export default function TerminalApp() {
    const [history, setHistory] = useState<CommandOutput[]>([
        { type: 'output', content: 'Bienvenido a (AI)terego OS v1.0.0.' },
        { type: 'output', content: 'Escribe "help" para ver los comandos disponibles.' },
    ]);
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('~');
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    const handleWrapperClick = () => {
        inputRef.current?.focus();
    };

    const handleCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        const newHistory: CommandOutput[] = [...history, { type: 'input', content: `jjaroll@aiterego:${cwd}$ ${trimmedCmd}` }];

        setCmdHistory(prev => [...prev, trimmedCmd]);
        setHistoryIndex(-1);

        const args = trimmedCmd.split(' ');
        const mainCmd = args[0].toLowerCase();

        switch (mainCmd) {
            case 'help':
                newHistory.push({ type: 'output', content: 'Comandos disponibles: help, clear, echo, whoami, date, ls, pwd, cd, cat, sudo, history, neofetch' });
                break;
            case 'neofetch':
                newHistory.push({ type: 'output', content: NEOFETCH_OUTPUT });
                break;
            case 'clear':
                setHistory([]);
                setInput('');
                return;
            case 'echo':
                newHistory.push({ type: 'output', content: args.slice(1).join(' ') });
                break;
            case 'whoami':
                newHistory.push({ type: 'output', content: 'jjaroll' });
                break;
            case 'date':
                newHistory.push({ type: 'output', content: new Date().toString() });
                break;
            case 'pwd':
                newHistory.push({ type: 'output', content: cwd === '~' ? '/home/jjaroll' : `/home/jjaroll/${cwd.replace('~/', '')}` });
                break;
            case 'cd':
                const dir = args[1] || '~';
                if (dir === '..') {
                    if (cwd !== '~' && cwd !== '/') {
                        const parts = cwd.split('/');
                        parts.pop();
                        setCwd(parts.length > 0 ? parts.join('/') : '~');
                    }
                } else if (dir === '~') {
                    setCwd('~');
                } else {
                    let safeDir = dir.replace(/\\/g, '/');
                    setCwd(cwd === '~' ? `~/${safeDir}` : `${cwd}/${safeDir}`);
                }
                break;
            case 'ls':
                newHistory.push({ type: 'output', content: 'README.md   Escritorio/   Documentos/   Descargas/   Imagenes/' });
                break;
            case 'cat':
                if (args[1] === 'README.md') {
                    newHistory.push({ type: 'output', content: '# (AI)terego OS\nEsta es una simulación de sistema operativo basada en la web construida con Next.js y Tailwind CSS.\n\n¡Disfruta explorando!' });
                } else {
                    newHistory.push({ type: 'error', content: `cat: ${args[1] || ''}: No existe el archivo o directorio` });
                }
                break;
            case 'sudo':
                newHistory.push({ type: 'error', content: 'jjaroll no está en el archivo sudoers. Este incidente será reportado a Santa.' });
                break;
            case 'history':
                const historyList = cmdHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
                newHistory.push({ type: 'output', content: historyList + (historyList ? '\n' : '') + `  ${cmdHistory.length + 1}  history` });
                break;
            default:
                newHistory.push({ type: 'error', content: `bash: ${mainCmd}: orden no encontrada` });
                break;
        }

        setHistory(newHistory);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const nextIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(nextIndex);
                setInput(cmdHistory[nextIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const nextIndex = historyIndex + 1;
                if (nextIndex >= cmdHistory.length) {
                    setHistoryIndex(-1);
                    setInput('');
                } else {
                    setHistoryIndex(nextIndex);
                    setInput(cmdHistory[nextIndex]);
                }
            }
        }
    };

    return (
        <div
            className="w-full h-full bg-os-terminal-bg text-os-terminal-text text-[13px] p-4 overflow-y-auto cursor-text select-text transition-colors tracking-wide leading-relaxed"
            style={{ fontFamily: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
            onClick={handleWrapperClick}
        >
            <div className="flex flex-col gap-1">
                {history.map((line, index) => (
                    <div
                        key={index}
                        className={`whitespace-pre-wrap break-words ${line.type === 'error' ? 'text-red-400' : ''} ${line.type === 'input' ? 'text-os-terminal-text' : 'text-os-terminal-text'}`}
                    >
                        {line.content}
                    </div>
                ))}
            </div>

            <div className="flex items-center mt-1">
                <span className="text-os-accent mr-2 whitespace-nowrap">jjaroll@dev:~$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none border-none text-os-terminal-text caret-os-terminal-text"
                    style={{ fontFamily: 'inherit' }}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
            <div ref={endRef} />
        </div>
    );
}
