import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function VideoConverter() {
  // Initialize FFmpeg instance
  const [ffmpeg] = useState(() => new FFmpeg({ log: true }));
  
  // Component state
  const [inputFile, setInputFile] = useState(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setInputFile(e.target.files?.[0] || null);
    setOutputUrl("");
    setStatus("");
  };

  // Main conversion function
  const convertVideo = async () => {
    if (!inputFile) return;

    // Check file size limit (50MB max for WASM memory)
    if (inputFile.size > 50 * 1024 * 1024) {
      setStatus("Error: File too large. Please use a file smaller than 50MB.");
      return;
    }

    setLoading(true);
    setStatus("Initializing FFmpeg...");

    try {
      // Load FFmpeg core files from CDN if not already loaded
      if (!ffmpeg.loaded) {
        setStatus("Loading FFmpeg core...");
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
        
        // Convert CDN URLs to blob URLs for cross-origin isolation
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
        
        await ffmpeg.load({ coreURL, wasmURL });
      }

      // Write input file to FFmpeg virtual file system
      setStatus("Writing input file...");
      const inputData = await fetchFile(inputFile);
      await ffmpeg.writeFile("input.mp4", inputData);

      // Execute FFmpeg conversion command
      setStatus("Converting video...");
      await ffmpeg.exec([
        "-i", "input.mp4",           // Input file
        "-c:v", "libvpx",            // Video codec
        "-b:v", "1M",                // Video bitrate
        "-c:a", "libvorbis",         // Audio codec
        "output.webm"                // Output file
      ]);

      // Read converted file from virtual file system
      const data = await ffmpeg.readFile("output.webm");

      // Create downloadable blob URL
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/webm" }));
      setOutputUrl(url);
      setStatus("Conversion complete!");
      
    } catch (err) {
      console.error("FFmpeg error:", err);
      setStatus("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="p-5 font-sans bg-zinc-900 h-screen text-white">
      <h1 className="text-7xl p-4 font-semibold mb-2 ">Video Transformations</h1>
  
      {/* File input */}
      <input
        type="file"
        accept="video/mp4,video/*"
        onChange={handleFileChange}
        name="Import Video"
        className="text-white bg-zinc-800 p-2 rounded-md h-[100px] text-center cursor-pointer"
      />

      <p className="text-white p-4 mt-4 text-xl">Choose your Service</p>
      
  
      {/* Convert button */}
      <button
        onClick={convertVideo}
        disabled={!inputFile || loading}
        className="ml-2.5 py-1.5 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Convert"}
      </button>
  
      {/* Status message */}
      {status && <p className="mt-2.5">{status}</p>}
  
      {/* Output video preview and download */}
      {outputUrl && (
        <div className="mt-5">
          <video src={outputUrl} controls className="block w-[400px]" />
          <a
            href={outputUrl}
            download="converted.webm"
            className="inline-block mt-2.5 px-3 py-2 bg-blue-600 text-white no-underline rounded hover:bg-blue-700"
          >
            Download WebM
          </a>
        </div>
      )}
    </div>
  </>
  
  );
}

export default VideoConverter;