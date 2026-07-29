/**
 * Skeletons de carga con la estética papel/tinta del sitio. Se muestran
 * mientras llegan los proyectos desde el backend, con las mismas proporciones
 * que el contenido real para que no haya salto de layout al reemplazarse.
 */

/** Ficha del archivo (/proyectos) — espeja ProjectCard de AllProjects. */
export function ProjectCardSkeleton() {
    return (
        <div className="h-full flex flex-col" aria-hidden="true">
            {/* Plancha de imagen */}
            <div className="skeleton aspect-[4/3] border border-brand-bg/15" />
            {/* Pie */}
            <div className="pt-4 flex-1 flex flex-col">
                <div className="skeleton h-2 w-24 rounded-full" />
                <div className="skeleton h-6 w-2/3 rounded mt-3" />
                <div className="skeleton h-3 w-full rounded mt-3.5" />
                <div className="skeleton h-3 w-4/5 rounded mt-2" />
                <div className="flex flex-wrap gap-1.5 mt-4">
                    {[14, 12, 16].map((w, i) => (
                        <div key={i} className="skeleton h-5 rounded-full" style={{ width: `${w * 4}px` }} />
                    ))}
                </div>
                <div className="mt-auto pt-4 border-t border-brand-bg/10 flex items-center justify-between">
                    <div className="skeleton h-3 w-24 rounded-full" />
                    <div className="skeleton h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}

/** Fila destacada (home) — espeja el spread imagen + descripción. */
export function FeaturedRowSkeleton({ imageRight = false }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center" aria-hidden="true">
            <div className={imageRight ? 'md:order-2' : 'md:order-1'}>
                <div className="md:border md:border-brand-bg/20 md:p-2 -mx-5 sm:-mx-8 md:mx-0">
                    <div className="skeleton aspect-[16/11] md:aspect-[4/3]" />
                </div>
                <div className="skeleton h-2 w-32 rounded-full mt-3" />
            </div>
            <div className={imageRight ? 'md:order-1' : 'md:order-2'}>
                <div className="skeleton h-2 w-28 rounded-full mb-3" />
                <div className="skeleton h-9 w-1/2 rounded" />
                <div className="skeleton h-px w-10 my-5" />
                <div className="skeleton h-3.5 w-full rounded" />
                <div className="skeleton h-3.5 w-11/12 rounded mt-2.5" />
                <div className="skeleton h-3.5 w-3/4 rounded mt-2.5" />
                <div className="flex flex-wrap gap-2 mt-5">
                    {[16, 12, 14, 10].map((w, i) => (
                        <div key={i} className="skeleton h-6 rounded-full" style={{ width: `${w * 5}px` }} />
                    ))}
                </div>
                <div className="skeleton h-11 w-40 rounded-full mt-6" />
            </div>
        </div>
    );
}
