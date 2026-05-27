import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorText = textRef.current;
    
    // Move cursor with mouse
    const moveCursor = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2, // smoother lag
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', moveCursor);

    // Hover effects using event delegation
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .cursor-hover, input, textarea, [data-cursor-text]');
      
      if (target) {
        const text = target.getAttribute('data-cursor-text');
        
        if (text) {
             // Text Mode (Explorer)
             cursorText.innerText = text;
             gsap.to(cursor, { 
                 width: 100, 
                 height: 100, 
                 backgroundColor: '#fff', 
                 mixBlendMode: 'difference',
                 duration: 0.3 
             });
             gsap.to(cursorText, { opacity: 1, duration: 0.3 });
        } else {
             // Standard Hover
             gsap.to(cursor, { scale: 3, opacity: 0.5, mixBlendMode: 'difference', duration: 0.3 });
             cursorText.innerText = "";
             gsap.to(cursorText, { opacity: 0, duration: 0.1 });
        }
      }
    };

    const handleMouseOut = (e) => {
       const target = e.target.closest('a, button, .cursor-hover, input, textarea, [data-cursor-text]');
       if (target) {
        gsap.to(cursor, { 
            width: 16, 
            height: 16, 
            scale: 1, 
            opacity: 1, 
            backgroundColor: 'white',
            mixBlendMode: 'difference', 
            duration: 0.3 
        });
        gsap.to(cursorText, { opacity: 0, duration: 0.2 });
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:flex items-center justify-center overflow-hidden"
    >
        <span ref={textRef} className="text-black text-[8px] font-sans font-bold uppercase tracking-widest opacity-0 whitespace-nowrap"></span>
    </div>
  );
}
