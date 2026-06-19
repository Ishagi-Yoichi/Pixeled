"use client";

import { useSignUp, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react";
import heroSky from "../../src/assets/GoldenSky.png";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setIsSigningUp(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleVerify = async (e: any) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError("");
    setIsVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        navigate("/editor");

        void (async () => {
          const token = await getToken();
          if (!token) {
            console.error("Session token was not ready for post-signup sync.");
            return;
          }

          await fetch("https://pixeled.onrender.com/signup", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });
        })().catch((err) => {
          console.error("Post-signup sync failed:", err);
        });
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroSky}
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-8"
      >
        {!pendingVerification ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-extrabold text-white">
                Create Account
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">
                Start building with clarity
              </p>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningUp}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningUp}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full rounded-full px-6 py-3 font-semibold text-black
                bg-gradient-to-r from-amber-300 to-amber-500
                shadow-[0_10px_30px_rgba(245,158,11,0.4)]
                hover:scale-[1.03] transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSigningUp ? "Sending Code..." : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white">Verify Email</h1>
              <p className="text-zinc-400 mt-2 text-sm">
                Enter the code sent to your email
              </p>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <input
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isVerifying}
                className="w-full text-center tracking-widest text-lg rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full rounded-full px-6 py-3 font-semibold text-black
                bg-gradient-to-r from-amber-300 to-amber-500
                shadow-[0_10px_30px_rgba(245,158,11,0.4)]
                hover:scale-[1.03] transition disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
