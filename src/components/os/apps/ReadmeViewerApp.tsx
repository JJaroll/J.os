'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ReadmeViewerApp() {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();

    const fileUrl = language === 'en' ? '/J.OS_en.md' : language === 'ja' ? '/J.OS_ja.md' : '/J.OS.md';

    useEffect(() => {
        setLoading(true);
        fetch(fileUrl)
            .then(res => res.text())
            .then(text => {
                setContent(text);
                setLoading(false);
            })
            .catch(() => {
                setContent(`# ${t('readme_viewer.error_title')}\n${t('readme_viewer.error_loading')}`);
                setLoading(false);
            });
    }, [fileUrl]);

    return (
        <div className="flex flex-col w-full h-full bg-os-panel text-os-panel-text overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-os-border bg-os-panel/50 backdrop-blur">
                <div className="font-semibold text-sm pl-2">J.OS.md</div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-os-accent w-8 h-8" />
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto pb-12">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b border-os-border pb-2 text-os-panel-text" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b border-os-border pb-2 text-os-panel-text" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-os-panel-text" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-bold mt-6 mb-3 text-os-panel-text" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-os-text" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-os-text space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-os-text space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                a: ({ node, ...props }) => <a className="text-os-accent hover:underline decoration-os-accent/50 underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-os-accent/30 pl-4 py-1 italic my-4 bg-os-accent/5 rounded-r" {...props} />,
                                code: ({ node, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match && !className?.includes('language-');
                                    return isInline ? (
                                        <code className="bg-os-hover/50 text-os-panel-text px-1.5 py-0.5 rounded font-mono text-[0.9em] border border-os-border" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <div className="relative my-6 rounded-lg overflow-hidden border border-os-border bg-[#1E1E1E]">
                                            <div className="flex items-center px-4 py-2 bg-[#2D2D2D] border-b border-[#404040]">
                                                <div className="flex space-x-2">
                                                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                                                </div>
                                                {match && <span className="ml-4 text-xs text-gray-400 font-mono">{match[1]}</span>}
                                            </div>
                                            <div className="p-4 overflow-x-auto">
                                                <code className="text-gray-300 font-mono text-sm leading-relaxed" {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        </div>
                                    );
                                },
                                pre: ({ node, ...props }) => <pre className="m-0 p-0 bg-transparent" {...props} />,
                                table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto mb-6 border border-os-border rounded-lg">
                                        <table className="w-full text-left border-collapse" {...props} />
                                    </div>
                                ),
                                th: ({ node, ...props }) => <th className="border-b border-os-border bg-os-hover px-4 py-2 font-semibold text-os-panel-text" {...props} />,
                                td: ({ node, ...props }) => <td className="border-b border-os-border px-4 py-2 text-os-text" {...props} />,
                                hr: ({ node, ...props }) => <hr className="my-8 border-os-border" {...props} />,
                                img: ({ node, ...props }) => <img className="rounded-lg border border-os-border max-w-full h-auto my-6 shadow-sm" {...props} />
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
