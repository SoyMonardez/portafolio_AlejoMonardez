import { useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

/**
 * Carrusel coverflow: tarjeta central en foco + laterales abiertas en abanico
 * con perspectiva 3D. Reutilizable para las capturas de un proyecto (modal) o
 * para las fichas del archivo (/proyectos).
 *
 * Posiciona cada tarjeta con un `transform` CSS estático (translateX + rotateY +
 * escala) + `transition`, en vez de una animación JS: así el abanico se ve aun
 * si el timeline de animación está pausado (pestaña en segundo plano) y no
 * depende del ciclo de montaje. El swipe se maneja con pointer events.
 *
 * Auto-rotación con cortesía: cualquier uso manual (flechas, arrastre, click en
 * una lateral, teclado) PAUSA la rotación; tras `resumeDelay` ms de inactividad
 * se reanuda sola. Se remonta con `key` para resetear índice/timers.
 *
 * El componente posiciona las tarjetas; el CONTENIDO lo provee el padre por
 * `renderItem(index, { isActive, offset })`.
 */
export default function Coverflow({
    count,
    renderItem,
    onActiveChange,
    autoRotate = true,
    interval = 4500,
    resumeDelay = 5000,
    stageClassName = 'h-[clamp(240px,44vh,440px)]',
    cardClassName = 'w-[74%] max-w-[540px] aspect-[16/10]',
    spread = 46,
    ariaLabel = 'Carrusel',
    className = '',
}) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const resumeTimer = useRef(null);
    const drag = useRef({ x: 0, active: false });
    const mounted = useRef(new Set()); // índices cuyo contenido ya se montó

    const next = useCallback(() => setActive(c => (c + 1) % count), [count]);
    const prev = useCallback(() => setActive(c => (c - 1 + count) % count), [count]);

    // Notifica al padre (para sincronizar detalle activo, contadores, etc.)
    useEffect(() => { onActiveChange?.(active); }, [active, onActiveChange]);

    // Uso manual → pausa; se reanuda tras `resumeDelay` de inactividad total.
    const registerInteraction = useCallback(() => {
        setPaused(true);
        clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(() => setPaused(false), resumeDelay);
    }, [resumeDelay]);

    // Bucle de auto-rotación (se apaga mientras `paused`).
    useEffect(() => {
        if (!autoRotate || paused || count <= 1) return;
        const id = setInterval(() => setActive(c => (c + 1) % count), interval);
        return () => clearInterval(id);
    }, [autoRotate, paused, count, interval]);

    useEffect(() => () => clearTimeout(resumeTimer.current), []);

    const handlePrev = () => { registerInteraction(); prev(); };
    const handleNext = () => { registerInteraction(); next(); };
    const handleSelect = (i) => { registerInteraction(); setActive(i); };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
    };

    // Swipe con pointer events: un desplazamiento neto > umbral cambia de tarjeta.
    const onPointerDown = (e) => { drag.current = { x: e.clientX, active: true }; };
    const onPointerUp = (e) => {
        if (!drag.current.active) return;
        const dx = e.clientX - drag.current.x;
        drag.current.active = false;
        if (Math.abs(dx) < 45) return; // fue un click, no un arrastre
        registerInteraction();
        if (dx < 0) next(); else prev();
    };

    if (!count) return null;

    return (
        <div className={className} role="group" aria-roledescription="carrusel" aria-label={ariaLabel}>
            <div
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerLeave={() => { drag.current.active = false; }}
                className={`relative w-full flex items-center justify-center outline-none select-none touch-pan-y [perspective:1500px] ${stageClassName}`}
            >
                {Array.from({ length: count }).map((_, i) => {
                    // Offset circular en [-count/2, count/2] para que el abanico
                    // envuelva por ambos lados sin saltos.
                    let offset = i - active;
                    if (offset > count / 2) offset -= count;
                    if (offset < -count / 2) offset += count;
                    const abs = Math.abs(offset);
                    const isActive = offset === 0;
                    const visible = abs <= 3; // 3 a cada lado (perf + prolijidad)

                    // Montaje diferido del CONTENIDO: al abrir, decodificar todas
                    // las imágenes de golpe produce un tirón en mobile. Solo se
                    // monta lo cercano (activa + 2 por lado); una vez montada,
                    // queda montada (mountedRef) para no re-decodificar al rotar.
                    if (abs <= 2) mounted.current.add(i);
                    const renderContent = mounted.current.has(i);

                    const rotateY = isActive ? 0 : (offset > 0 ? -34 : 34);
                    const scale = isActive ? 1 : Math.max(0.68, 1 - abs * 0.14);
                    const opacity = visible ? (isActive ? 1 : Math.max(0.25, 0.62 - (abs - 1) * 0.2)) : 0;

                    return (
                        <div
                            key={i}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ zIndex: 100 - abs, pointerEvents: visible ? 'auto' : 'none' }}
                        >
                            <div
                                className={`relative ${cardClassName} ${isActive ? '' : 'cursor-hover'}`}
                                style={{
                                    transform: `translateX(${offset * spread}%) scale(${scale}) rotateY(${rotateY}deg)`,
                                    opacity,
                                    filter: isActive ? 'grayscale(0)' : 'grayscale(0.45)',
                                    transition: 'transform 0.55s cubic-bezier(0.2,0.65,0.3,0.9), opacity 0.55s ease, filter 0.55s ease',
                                    transformStyle: 'preserve-3d',
                                    willChange: 'transform',
                                }}
                                onClick={() => { if (!isActive) handleSelect(i); }}
                            >
                                {renderContent ? renderItem(i, { isActive, offset }) : null}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controles — flechas + contador, debajo (como la referencia) */}
            {count > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Anterior"
                        className="cursor-hover w-10 h-10 rounded-full border border-brand-bg/25 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-brand-bg hover:text-white hover:border-brand-bg hover:scale-105 transition-all duration-300"
                    >
                        <IoChevronBack className="text-base" />
                    </button>
                    <span className="font-sans text-[11px] tracking-[0.25em] tabular-nums text-brand-bg/55 select-none w-14 text-center">
                        {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                    </span>
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Siguiente"
                        className="cursor-hover w-10 h-10 rounded-full border border-brand-bg/25 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-brand-bg hover:text-white hover:border-brand-bg hover:scale-105 transition-all duration-300"
                    >
                        <IoChevronForward className="text-base" />
                    </button>
                </div>
            )}
        </div>
    );
}
