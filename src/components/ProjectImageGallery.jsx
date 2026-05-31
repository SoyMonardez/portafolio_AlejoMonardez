import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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
    const [isZoomed, setIsZoomed] = useState(false); // si hay zoom > 1, suspendemos swipes
    const timerRef = useRef(null);
    const transformRef = useRef(null);

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

    // Swipe handler horizontal: cambia de slide.
    const SWIPE_THRESHOLD = 50;
    const SWIPE_VELOCITY = 300;
    const handleDragEnd = (_e, info) => {
        const dx  = info.offset.x;
        const vx  = info.velocity.x;
        const fast  = Math.abs(vx) > SWIPE_VELOCITY;
        const wide  = Math.abs(dx) > SWIPE_THRESHOLD;
        if (!fast && !wide) return;
        if (dx < 0) next(); else prev();
    };

    // Swipe handler para el LIGHTBOX: detecta horizontal (cambia slide) y vertical (cierra).
    // SOLO se usa cuando NO hay zoom activo — si hay zoom, el wrapper de pinch maneja el pan.
    const LIGHTBOX_DISMISS_DISTANCE = 100;
    const LIGHTBOX_DISMISS_VELOCITY = 500;
    const handleLightboxDragEnd = (_e, info) => {
        if (isZoomed) return; // mientras hay zoom, el pan toma prioridad
        const dx = info.offset.x;
        const dy = info.offset.y;
        const vy = info.velocity.y;

        if (Math.abs(dy) > Math.abs(dx)) {
            if (dy > LIGHTBOX_DISMISS_DISTANCE || vy > LIGHTBOX_DISMISS_VELOCITY) {
                setIsLightboxOpen(false);
                return;
            }
        } else {
            handleDragEnd(_e, info);
        }
    };

    // Reset del zoom al cambiar de slide o al cerrar
    const resetZoom = () => {
        if (transformRef.current) {
            transformRef.current.resetTransform(0);
        }
        setIsZoomed(false);
    };
    useEffect(() => { resetZoom(); }, [index]);
    useEffect(() => { if (!isLightboxOpen) resetZoom(); }, [isLightboxOpen]);

    return (
        <>
            <div
                className="relative w-full aspect-[16/10] overflow-hidden group bg-black flex items-center justify-center select-none"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={() => setPaused(true)}
            >
                {/* Layer interactiva: drag horizontal en mobile / click en desktop para abrir lightbox */}
                <motion.div
                    drag={len > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.25}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 w-full h-full cursor-none touch-pan-y"
                    data-cursor-text={cursorText}
                    aria-label={cursorText}
                >
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={index}
                            src={valid[index]}
                            alt={`${alt} ${index + 1}`}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                            className="absolute inset-0 w-full h-full object-contain bg-black pointer-events-none"
                            draggable={false}
                            onError={(e) => { e.currentTarget.style.opacity = '0.15'; }}
                        />
                    </AnimatePresence>
                    {/* Click para lightbox (solo dispara si NO fue drag) */}
                    <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute inset-0 w-full h-full focus:outline-none"
                        aria-label={cursorText}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* Controles (sólo si hay 2+ imágenes) */}
                {len > 1 && (
                    <>
                        {/* Flechas — escondidas en mobile (use swipe), visibles en hover desktop */}
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Anterior"
                            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-black/40 backdrop-blur-sm rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 z-20"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Siguiente"
                            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-black/40 backdrop-blur-sm rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all duration-300 z-20"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>

                        {/* Hint de swipe — solo visible al inicio en mobile */}
                        <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-white/50 bg-black/40 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full z-20 pointer-events-none animate-pulse">
                            ← Deslizá →
                        </div>

                        {/* Dots / barras — tappables en mobile */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {valid.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setIndex(i); }}
                                    aria-label={`Imagen ${i + 1}`}
                                    className={`h-[3px] md:h-[2px] rounded-full transition-all duration-500 ${
                                        i === index ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Contador */}
                        <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] text-white/80 border border-white/30 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm z-20 pointer-events-none">
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

                        {/* Image Container — con pinch/double-tap zoom (react-zoom-pan-pinch) */}
                        <div
                            className="relative w-full h-full flex items-center justify-center p-4 md:p-12 select-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Hint visual de gestos — desaparece al zoom-in */}
                            {!isZoomed && (
                                <div className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.25em] text-white/50 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full pointer-events-none text-center leading-relaxed">
                                    ↓ Cerrar · ← → Cambiar<br/>
                                    Doble-tap o pellizcá para zoom
                                </div>
                            )}

                            {/* Capa OUTER: framer-motion drag para dismiss/cambiar-slide (solo cuando scale=1) */}
                            <motion.div
                                key={index}
                                drag={!isZoomed}
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={{ left: 0.25, right: 0.25, top: 0.1, bottom: 0.35 }}
                                onDragEnd={handleLightboxDragEnd}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                                className="touch-pan-y"
                                style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
                            >
                                {/* Capa INNER: zoom/pinch/double-tap (react-zoom-pan-pinch) */}
                                <TransformWrapper
                                    ref={transformRef}
                                    initialScale={1}
                                    minScale={1}
                                    maxScale={5}
                                    centerOnInit
                                    doubleClick={{ mode: 'toggle', step: 1.5 }}
                                    wheel={{ step: 0.2 }}
                                    pinch={{ step: 5 }}
                                    panning={{ disabled: false, velocityDisabled: true }}
                                    limitToBounds
                                    onZoom={(ref) => setIsZoomed(ref.state.scale > 1.02)}
                                    onZoomStop={(ref) => setIsZoomed(ref.state.scale > 1.02)}
                                >
                                    <TransformComponent
                                        wrapperStyle={{ width: 'auto', height: 'auto', overflow: 'visible' }}
                                        contentStyle={{ width: 'auto', height: 'auto' }}
                                    >
                                        <img
                                            src={valid[index]}
                                            alt={`${alt} ${index + 1} ampliada`}
                                            className="max-w-[90vw] max-h-[80vh] object-contain shadow-2xl border border-white/10 bg-black"
                                            draggable={false}
                                        />
                                    </TransformComponent>
                                </TransformWrapper>
                            </motion.div>

                            {/* Botón reset zoom — solo aparece cuando hay zoom activo */}
                            {isZoomed && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-all z-[9930] shadow-lg"
                                    aria-label="Reset zoom"
                                >
                                    ⊙ Reset zoom
                                </button>
                            )}

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
