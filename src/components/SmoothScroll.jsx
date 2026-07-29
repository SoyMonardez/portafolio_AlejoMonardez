import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4x87
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expone la instancia (útil para debug / anchors programáticos).
    window.__lenis = lenis;

    // Expone la posición de scroll como clase en <html> para efectos dependientes
    // del scroll (ej. blur del nav), de forma confiable con el smooth-scroll.
    lenis.on('scroll', ({ scroll }) => {
      document.documentElement.classList.toggle('is-scrolled', scroll > 40);
    });

    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('is-scrolled');
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);

  return children;
}
