"use client";

import React, { useState, useRef } from "react";
import { Upload, Video } from "lucide-react";

function VideoUploader({ onVideoUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      onVideoUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-md mx-auto
        flex flex-col items-center text-center gap-6
        border rounded-2xl px-8 py-10
        backdrop-blur-xl transition-all duration-300

        ${
          isDragging
            ? "border-amber-400/60 bg-amber-400/10 scale-[1.01]"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }
      `}
    >
      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full" />
        <div className="relative bg-white/10 border border-white/10 p-5 rounded-xl">
          <Video className="w-10 h-10 text-amber-300" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Upload your video</h2>
        <p className="text-sm text-zinc-400">Drag & drop or click to browse</p>
      </div>

      {/* Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="
          px-6 py-2.5
          rounded-full
          text-sm font-medium
          text-black
          bg-gradient-to-r from-amber-300 to-amber-500
          shadow-[0_8px_25px_rgba(245,158,11,0.35)]
          hover:scale-[1.04] hover:brightness-110
          transition-all duration-200
        "
      >
        Select file
      </button>

      {/* Formats */}
      <div className="flex gap-2 text-xs text-zinc-500">
        {["MP4", "WEBM", "MOV", "AVI"].map((f) => (
          <span
            key={f}
            className="px-2 py-1 rounded-md bg-white/5 border border-white/10"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export default VideoUploader;
