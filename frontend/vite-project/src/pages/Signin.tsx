"use client";

import { useAuth, useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react";
import heroSky from "../../src/assets/GoldenSky.png";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const token = await getToken();
        const response = await fetch("http://localhost:3000/signin", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const dbUser = await response.json();
        console.log("User from postgres:", dbUser);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/*Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroSky}
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8"
      >
        {/*Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome Back
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Continue building with clarity
          </p>
        </div>

        {/*Error */}
        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/*Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
            />
          </div>

          {/*Button */}
          <button
            type="submit"
            className="w-full mt-2 rounded-full px-6 py-3 font-semibold text-black 
            bg-gradient-to-r from-amber-300 to-amber-500 
            shadow-[0_10px_30px_rgba(245,158,11,0.4)] 
            hover:scale-[1.03] hover:brightness-110 
            transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        {/*Footer */}
        <div className="mt-6 text-center text-sm text-zinc-400">
          Don’t have an account?{" "}
          <span className="text-amber-300 hover:underline cursor-pointer">
            Sign up
          </span>
        </div>
      </motion.div>
    </div>
  );
}
