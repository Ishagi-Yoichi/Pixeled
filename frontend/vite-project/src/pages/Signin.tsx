"use client";

import { useAuth, useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import React from "react";
import heroSky from "../../src/assets/GoldenSky.png";

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await completeSignIn(result);
      } else if (result.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setShowOtpInput(true);
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!signIn || !setActive) return;
    setError("");
    setIsVerifyingOtp(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: otpCode,
      });

      if (result.status === "complete") {
        await completeSignIn(result);
      } else {
        setError("Verification failed. Try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const completeSignIn = async (result: any) => {
    if (!setActive) return;
    await setActive({ session: result.createdSessionId });

    navigate("/editor");

    void (async () => {
      let token: string | null = null;
      for (let i = 0; i < 5; i++) {
        token = await getToken();
        if (token) break;
        await new Promise((res) => setTimeout(res, 300));
      }

      if (!token) {
        console.error("Session token was not ready for post-signin sync.");
        return;
      }

      await fetch("https://pixeled.onrender.com/signin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    })().catch((err) => {
      console.error("Post-signin sync failed:", err);
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome Back
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Continue building with clarity
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isVerifyingOtp}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || isVerifyingOtp}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {showOtpInput && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-300">
                Check your email for a verification code
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isVerifyingOtp}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                disabled={isVerifyingOtp}
                onClick={handleOtpSubmit}
                className="w-full rounded-full px-6 py-3 font-semibold text-black
                bg-gradient-to-r from-amber-300 to-amber-500
                shadow-[0_10px_30px_rgba(245,158,11,0.4)]
                hover:scale-[1.03] hover:brightness-110
                transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify"}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isVerifyingOtp}
            className="w-full mt-2 rounded-full px-6 py-3 font-semibold text-black
            bg-gradient-to-r from-amber-300 to-amber-500
            shadow-[0_10px_30px_rgba(245,158,11,0.4)]
            hover:scale-[1.03] hover:brightness-110
            transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-amber-300 hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
