'use client';

import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactWindow() {
    const [email, setEmail] = useState('');
    const [source, setSource] = useState('');
    const [message, setMessage] = useState('');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !message) {
            alert(t('contact.error_uncomplete'));
            return;
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            // Usamos un alert temporal o el estado de error
            alert(t('contact.error_invalid_email'));
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
                    email: email,
                    source: source || 'No especificado',
                    message: message,
                    subject: `Nuevo mensaje en J.OS de: ${email}`,
                    from_name: 'J.OS Portfolio'
                })
            });

            const result = await response.json();

            if (result.success) {
                setStatus('success');
                setEmail('');
                setSource('');
                setMessage('');

                // Mantenemos el mensaje de éxito por 5 segundos antes de volver a 'idle'
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 4000);
            }
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 4000);
        }
    };

    const inputClass = `flex-1 px-3 py-2 border border-os-border rounded focus:outline-none focus:ring-2 focus:ring-[#f0a92b] transition-all text-[13px]
        group-data-[theme='xp']:bg-white group-data-[theme='xp']:text-black group-data-[theme='xp']:placeholder:text-gray-500
        group-data-[theme!='xp']:bg-os-panel group-data-[theme!='xp']:text-os-panel-text group-data-[theme!='xp']:placeholder:text-os-panel-text/50
        disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <div className="flex flex-col w-full h-full bg-os-bg text-os-text font-sans text-sm transition-colors relative">

            {/* Barra superior */}
            <div className="flex items-center px-4 py-3 bg-os-panel border-b border-os-border transition-colors z-10">
                <button
                    onClick={handleSubmit}
                    disabled={status === 'loading' || status === 'success'}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#f0a92b] hover:bg-[#eab308] text-black font-bold text-[13px] border-2 border-black rounded-md shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all disabled:opacity-70 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0px_#000] disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? (
                        <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
                    ) : status === 'success' ? (
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                    ) : (
                        <Send size={14} strokeWidth={2.5} />
                    )}

                    {status === 'loading' ? '...' : status === 'success' ? 'OK' : t('contact.send')}
                </button>
            </div>

            {/* Mensajes de Estado (Notificaciones de Sistema) */}
            <div className="absolute top-[52px] left-0 w-full overflow-hidden z-20 pointer-events-none">
                <AnimatePresence mode="wait">
                    {(status === 'success' || status === 'error') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 48, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="w-full flex items-center justify-center"
                        >
                            {status === 'success' ? (
                                <div className="flex items-center justify-center gap-2 w-full h-full bg-green-500/20 text-green-600 border-b border-green-500/30 font-bold text-[12px]">
                                    <CheckCircle2 size={16} />
                                    {t('contact.success_message')}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 w-full h-full bg-red-500/20 text-red-600 border-b border-red-500/30 font-bold text-[12px]">
                                    <XCircle size={16} />
                                    {t('contact.error_message')}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Formulario */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-os-bg transition-colors">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-4">
                    {/* Campos del formulario (sin cambios) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="w-full sm:w-48 font-bold text-os-text text-[13px]">{t('contact.to')}</label>
                        <div className="flex-1 text-[13px] text-os-text/70 font-medium">hello@jjaroll.dev</div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="w-full sm:w-48 font-bold text-os-text text-[13px]">
                            {t('contact.your_email')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            disabled={status === 'loading'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('contact.email_placeholder')}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="w-full sm:w-48 font-bold text-os-text text-[13px]">
                            {t('contact.source')}
                        </label>
                        <input
                            type="text"
                            disabled={status === 'loading'}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder={t('contact.source_placeholder')}
                            className={inputClass}
                        />
                    </div>

                    <div className="pt-2">
                        <textarea
                            required
                            disabled={status === 'loading'}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('contact.write_message')}
                            className={`w-full h-48 px-4 py-3 border border-os-border rounded focus:outline-none focus:ring-2 focus:ring-[#f0a92b] transition-all text-[13px] resize-y
                            group-data-[theme='xp']:bg-white group-data-[theme='xp']:text-black group-data-[theme='xp']:placeholder:text-gray-500
                            group-data-[theme!='xp']:bg-os-panel group-data-[theme!='xp']:text-os-panel-text group-data-[theme!='xp']:placeholder:text-os-panel-text/50
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                        ></textarea>
                    </div>
                </form>
            </div>
        </div>
    );
}
