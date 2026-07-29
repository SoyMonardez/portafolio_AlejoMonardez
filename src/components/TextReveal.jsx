import React, { useRef } from 'react';
import { motion as Motion, useInView } from 'framer-motion';

export default function TextReveal({ children, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  // Split text by lines or words if possible, but simplest high-impact is per-line block reveal.
  // Ideally we wrap each line in overflow-hidden. For dynamic text, word-by-word is safer.
  
  const words = typeof children === 'string' ? children.split(" ") : [];

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20, // Keep movement subtle but visible
    },
  };

  if (typeof children !== 'string') {
      return <div className={className}>{children}</div>;
  }

  return (
    <Motion.div
      ref={ref}
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <Motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
          {word}
        </Motion.span>
      ))}
    </Motion.div>
  );
}
