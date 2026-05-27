import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Galería de imágenes auto-rotativa para UN proyecto.
 * - Si hay 0 imágenes: muestra placeholder editorial.
 * - Si hay 1: muestra estática (sin controles).
 * - Si hay 2+: auto-rotación + dots + flechas + pausa en hover.
 *
 * @param {string[]} images       array de URLs
 * @param {string}   alt          texto alternativo / título del proyecto
 * @param {number}   interval     ms entre auto-rotaciones (default 4000)
 * @param {string}   href         si está, la imagen es un link al demo
 * @param {string}   cursorText   texto del cursor custom (ej "DEMO")
 */
export default function ProjectImageGallery({
    images = [],
    alt = '',
    interval = 4000,
    href,
    cursorText = 'DEMO'
}) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const timerRef = useRef(null);

    const valid = (images || []).filter(Boolean);
    const len = valid.length;

    useEffect(() => {
        if (paused || len <= 1 || isLightboxOpen) return;
        timerRef.current = setTimeout(() => {
            setIndex(i => (i + 1) % len);
        }, interval);
        return () => clearTimeout(timerRef.current);
    }, [index, paused, interval, len, isLightboxOpen]);

    // Handle lightbox key controls & body scroll lock
    useEffect(() => {
        if (!isLightboxOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsLightboxOpen(false);
            } else if (e.key === 'ArrowRight') {
                setIndex((i) => (i + 1) % len);
            } else if (e.key === 'ArrowLeft') {
                setIndex((i) => (i - 1 + len) % len);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isLightboxOpen, len]);

    // Si no hay imágenes — placeholder editorial
    if (len === 0) {
        return (
            <div className="relative w-full aspect-[16/10] bg-neutral-900/40 border border-white/5 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:20px_20px]" />
                <span className="text-white/20 text-xs uppercase tracking-[0.3em] font-sans relative z-10">
                    {alt || 'Sin imagen'}
                </span>
            </div>
        );
    }

    const next = () => setIndex(i => (i + 1) % len);
    const prev = () => setIndex(i => (i - 1 + len) % len);

    const ImageEl = (
        <AnimatePresence mode="wait">
            <motion.img
                key={index}
                src={valid[index]}
                alt={`${alt} ${index + 1}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 w-full h-full object-contain bg-black transition-[filter] duration-700"
                onError={(e) => { e.currentTarget.style.opacity = '0.15'; }}
            />
        </AnimatePresence>
    );

    return (
        <>
            <div
                className="relative w-full aspect-[16/10] overflow-hidden group bg-black flex items-center justify-center"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute inset-0 w-full h-full cursor-none focus:outline-none flex items-center justify-center bg-black"
                    data-cursor-text={cursorText}
                    aria-label={cursorText}
                >
                    {ImageEl}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </button>

                {/* Controles (sólo si hay 2+ imágenes) */}
                {len > 1 && (
                    <>
                        {/* Flechas */}
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Anterior"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 z-20"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Siguiente"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 z-20"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>

                        {/* Dots / barras */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {valid.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setIndex(i); }}
                                    aria-label={`Imagen ${i + 1}`}
                                    className={`h-[2px] rounded-full transition-all duration-500 ${
                                        i === index ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Contador */}
                        <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] text-white/80 border border-white/30 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm z-20">
                            {String(index + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9900] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none cursor-default"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        {/* Header/Close button area */}
                        <div className="absolute top-6 right-6 z-[9910] flex items-center gap-4">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                {String(index + 1).padStart(2, '0')} / {String(len).padStart(2, '0')}
                            </span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                                className="w-10 h-10 border border-white/20 bg-white/5 hover:bg-white hover:text-black rounded-full flex items-center justify-center text-white transition-all duration-300"
                                aria-label="Cerrar"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        {/* Image Container */}
                        <div 
                            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                key={index}
                                src={valid[index]}
                                alt={`${alt} ${index + 1} ampliada`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                                className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl border border-white/10 bg-black"
                            />

                            {/* Left/Right Controls inside Lightbox */}
                            {len > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); prev(); }}
                                        className="absolute left-6 w-12 h-12 border border-white/20 bg-black/40 hover:bg-white hover:text-black rounded-full flex items-center justify-center text-white transition-all duration-300 z-[9920]"
                                        aria-label="Anterior"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5"/></svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); next(); }}
                                        className="absolute right-6 w-12 h-12 border border-white/20 bg-black/40 hover:bg-white hover:text-black rounded-full flex items-center justify-center text-white transition-all duration-300 z-[9920]"
                                        aria-label="Siguiente"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5"/></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
