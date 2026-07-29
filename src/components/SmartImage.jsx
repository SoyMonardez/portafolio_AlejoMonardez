import { useEffect, useRef, useState } from 'react';

/**
 * Imagen de proyecto con revelado premium: mientras la imagen descarga se ve
 * un skeleton (barrido de luz); al cargar, el skeleton se desvanece y la foto
 * entra con un fade — nunca aparece "de golpe".
 *
 * Mantiene el tratamiento paspartú del sitio (fondo desenfocado a sangre +
 * imagen completa en `object-contain`) para que verticales y horizontales
 * convivan en el mismo marco sin recorte. El componente renderiza SOLO las
 * capas internas: el marco (aspect-ratio, borde, overflow) lo pone el padre.
 *
 * Depende de un ancestro con la clase `group` para el hover b&n -> color.
 */
export default function SmartImage({ src, alt = '', eager = false, cover = false, fit = 'cover', className = '' }) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    // Imágenes cacheadas pueden completar antes de que React ate el onLoad;
    // chequeamos el estado real al montar/cambiar de src para no dejar el
    // skeleton colgado.
    useEffect(() => {
        setLoaded(false);
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
    }, [src]);

    if (!src) return null;

    // Modo `cover`: imagen "plana" sin paspartú ni grayscale propio — pensado
    // para el coverflow, donde el foco b&n->color lo controla el carrusel.
    // `fit` elige object-cover (fichas del archivo) u object-contain (capturas
    // del modal, que no deben recortarse). Modo normal: paspartú + b&n->color.
    // El skeleton se DESMONTA al cargar (no se desvanece por transición): las
    // transiciones CSS se congelan en pestañas en segundo plano, y una imagen
    // cuya visibilidad depende de una transición puede quedar invisible. La
    // imagen nunca se oculta — mientras no tiene datos, no pinta nada igual.
    if (cover) {
        return (
            <>
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    loading={eager ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                    className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
                />
                {!loaded && <div aria-hidden="true" className="skeleton absolute inset-0 z-10" />}
            </>
        );
    }

    return (
        <>
            {/* Fondo desenfocado — llena el marco detrás de la imagen contain */}
            <img
                src={src}
                alt=""
                aria-hidden="true"
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
            />

            {/* Imagen real — visible siempre (sin datos no pinta nada); el
                skeleton de arriba cubre el hueco hasta que carga */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                className={`relative w-full h-full object-contain grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-[filter,transform] duration-700 ${className}`}
            />

            {/* Skeleton — se desmonta al cargar (ver nota arriba) */}
            {!loaded && <div aria-hidden="true" className="skeleton absolute inset-0 z-10" />}
        </>
    );
}
