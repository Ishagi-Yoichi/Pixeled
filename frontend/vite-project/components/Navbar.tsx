"use client";
import { motion } from "framer-motion";
import React from "react";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const navLinks = ["Features", "How It Works", "Pricing", "Testimonials"];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-xl border-b"
      style={{
        backgroundColor: "rgba(0,0,0,0.25)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-8">
        {/* Logo */}
        <span className="text-xl font-bold tracking-tight text-white">
          Pixeled
        </span>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`${link.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link to="/auth/signin">
              <button className="px-4 py-2 text-sm rounded-full text-zinc-300 hover:text-white transition">
                Sign In
              </button>
            </Link>

            <Link to="/auth/signup">
              <button
                className="px-5 py-2 text-sm font-medium rounded-full text-black
                bg-gradient-to-r from-amber-300 to-amber-500
                shadow-[0_8px_25px_rgba(245,158,11,0.35)]
                hover:scale-[1.05] hover:brightness-110 transition-all duration-200"
              >
                Create Account
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link to="/editor">
              <button
                className="px-5 py-2 text-sm font-medium rounded-full text-black
                bg-gradient-to-r from-amber-300 to-amber-500
                shadow-[0_8px_25px_rgba(245,158,11,0.35)]
                hover:scale-[1.05] hover:brightness-110 transition-all duration-200"
              >
                Go to Editor
              </button>
            </Link>

            <SignOutButton>
              <button
                className="px-4 py-2 text-sm rounded-full border border-white/10
                text-zinc-400 hover:text-red-300 hover:border-red-400/30
                transition-all duration-200"
              >
                Log Out
              </button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
