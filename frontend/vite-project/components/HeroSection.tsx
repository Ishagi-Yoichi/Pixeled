import { motion } from "framer-motion";
import React from "react";
const blur = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.9,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const HeroSection = () => {
  return (
    <section className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
      <motion.h1
        custom={0}
        initial="hidden"
        animate="visible"
        variants={blur}
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-foreground leading-[1.05] tracking-[-0.02em] max-w-[920px] text-shadow-hero"
      >
        Clarity for Every Beautiful Idea You Have.
      </motion.h1>

      <motion.p
        custom={1}
        initial="hidden"
        animate="visible"
        variants={blur}
        className="mt-6 text-lg md:text-xl max-w-[620px] leading-relaxed"
        style={{ color: "hsl(var(--text-secondary))" }}
      >
        Edit your Images and Videos at lightning speed, full privacy, make
        reality of your thoughts, and turn ideas into execution with clarity and
        confidence.
      </motion.p>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={blur}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href="#get-started"
          className="inline-flex items-center rounded-full px-10 py-4 text-base font-semibold text-primary-foreground bg-gradient-to-b from-gold-soft to-gold transition-transform duration-200 hover:scale-105 hover:brightness-110 glow-gold"
        >
          Get Started
        </a>
        <a
          href="#how-it-works"
          className="inline-flex items-center px-4 py-4 text-base font-medium transition-colors duration-200 hover:text-foreground"
          style={{ color: "hsl(var(--text-secondary))" }}
        >
          <span className="border-b border-gold/40">See How It Works</span>
        </a>
      </motion.div>

      <motion.p
        custom={3}
        initial="hidden"
        animate="visible"
        variants={blur}
        className="mt-5 text-xs"
        style={{ color: "hsl(var(--text-muted))" }}
      >
        No credit card required · Free forever plan available
      </motion.p>
    </section>
  );
};

export default HeroSection;
