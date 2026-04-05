import { motion } from "framer-motion";
import React from "react";

const FinalCTA = () => {
  return (
    <section className="relative z-20 py-32 px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
      >
        Start building with clarity.
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        viewport={{ once: true }}
        className="mt-10"
      >
        <a
          href="#get-started"
          className="inline-flex items-center rounded-full px-10 py-4 text-base font-semibold text-primary-foreground bg-gradient-to-b from-gold-soft to-gold transition-transform duration-200 hover:scale-105 hover:brightness-110 glow-gold"
        >
          Get Started Free
        </a>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
