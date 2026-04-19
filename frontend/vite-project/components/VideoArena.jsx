"use client";

import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { motion } from "framer-motion";
import heroSky from "../src/assets/GoldenSky.png";

function VideoArena() {
  const [ffmpeg] = useState(() => new FFmpeg({ log: true }));

  const [inputFile, setInputFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(3);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setStatus("Only video files are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setStatus("Please upload video smaller than 50MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setInputFile(file);
    setOutputUrl("");
    setThumbnails([]);
    setStatus("");
  };

  const handleReset = () => {
    setInputFile(null);
    setPreviewUrl("");
    setOutputUrl("");
    setThumbnails([]);
    setSelectedFeature(null);
  };

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (!ffmpeg.loaded) {
      const baseURL =
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript",
      );
      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      );

      await ffmpeg.load({ coreURL, wasmURL });
    }
  };

  // 🎬 Thumbnail extraction
  const extractThumbnails = async () => {
    setLoading(true);
    setStatus("Extracting thumbnails...");

    try {
      await loadFFmpeg();

      await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-vf",
        `fps=1/${intervalSeconds}`,
        "thumb_%03d.jpg",
      ]);

      const files = await ffmpeg.listDir("/");
      const thumbs = files.filter((f) => f.name.includes("thumb"));

      const urls = [];

      for (let file of thumbs) {
        const data = await ffmpeg.readFile(file.name);
        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "image/jpeg" }),
        );
        urls.push(url);
      }

      setThumbnails(urls);
      setStatus("Thumbnails extracted!");
    } catch (err) {
      setStatus("Error processing video.");
    } finally {
      setLoading(false);
    }
  };

  // ✂️ Trim
  const trimVideo = async () => {
    setLoading(true);
    setStatus("Trimming video...");

    try {
      await loadFFmpeg();

      await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-ss",
        "00:00:02",
        "-to",
        "00:00:06",
        "-c",
        "copy",
        "output.mp4",
      ]);

      const data = await ffmpeg.readFile("output.mp4");

      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" }),
      );

      setOutputUrl(url);
      setStatus("Trim complete!");
    } catch (err) {
      setStatus("Error trimming video.");
    } finally {
      setLoading(false);
    }
  };

  // 📐 Aspect ratio
  const changeAspectRatio = async () => {
    setLoading(true);
    setStatus("Changing aspect ratio...");

    try {
      await loadFFmpeg();

      await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));

      await ffmpeg.exec([
        "-i",
        "input.mp4",
        "-vf",
        "scale=720:720",
        "output.mp4",
      ]);

      const data = await ffmpeg.readFile("output.mp4");

      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" }),
      );

      setOutputUrl(url);
      setStatus("Aspect ratio updated!");
    } catch (err) {
      setStatus("Error processing video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* 🌇 Background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroSky} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-extrabold">Video Editor</h1>
          <p className="text-zinc-400 mt-3">
            Edit videos directly in your browser
          </p>
        </motion.div>

        {/* Upload */}
        {!inputFile && (
          <div className="flex justify-center">
            <label className="cursor-pointer border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl px-10 py-12 text-center hover:bg-white/10 transition">
              <input type="file" hidden onChange={handleFileChange} />
              <p className="text-lg text-zinc-300">Click to upload video</p>
              <p className="text-sm text-zinc-500 mt-2">Max size: 50MB</p>
            </label>
          </div>
        )}

        {/* Workspace */}
        {inputFile && (
          <div className="space-y-6">
            {/* Video */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <video
                src={outputUrl || previewUrl}
                controls
                className="w-full rounded-xl"
              />
            </div>

            {/* Feature Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={extractThumbnails} className="btn-gold">
                Extract Thumbnails
              </button>

              <button onClick={trimVideo} className="btn-gold">
                Trim Video
              </button>

              <button onClick={changeAspectRatio} className="btn-gold">
                Change Ratio
              </button>

              <button onClick={handleReset} className="btn-secondary">
                Upload New
              </button>
            </div>

            {/* Status */}
            {status && (
              <p className="text-center text-sm text-zinc-400">{status}</p>
            )}

            {/* Loader */}
            {loading && (
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 animate-pulse w-1/2" />
              </div>
            )}

            {/* Thumbnails */}
            {thumbnails.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {thumbnails.map((src, i) => (
                  <img key={i} src={src} className="rounded-lg" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .btn-gold {
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 600;
          background: linear-gradient(to right, #fcd34d, #f59e0b);
          color: black;
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
          transition: all 0.2s;
        }

        .btn-gold:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .btn-secondary {
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #aaa;
        }
      `}</style>
    </div>
  );
}

export default VideoArena;
