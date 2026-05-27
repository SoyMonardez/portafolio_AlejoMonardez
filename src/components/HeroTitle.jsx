import React from 'react';
import { motion } from 'framer-motion';

export default function HeroTitle() {
  const text = "ALEJO MONARDEZ";
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.8, // Elegant delay before typing starts
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }, // Elegant easing
    },
  };

  return (
    <h1 className="text-[14vw] sm:text-[12vw] md:text-[8.5vw] lg:text-[8vw] xl:text-[7.5vw] font-serif leading-[0.85] uppercase tracking-tighter text-white mix-blend-difference relative z-20">
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="block"
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={charVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 && (
              <span className="inline-block w-[0.2em]">&nbsp;</span>
            )}
          </span>
        ))}
      </motion.span>
    </h1>
  );
}

