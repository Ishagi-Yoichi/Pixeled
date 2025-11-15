import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";


const ffmpeg = new FFmpeg({ log: true });

function VideoConverter() {
  const [inputFile, setInputFile] = useState(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setInputFile(e.target.files?.[0] || null);
    setOutputUrl("");
    setStatus("");
  };

  const convertVideo = async () => {
    if (!inputFile) return;

    setLoading(true);

    const env = checkEnvironment();
    console.log('Environment check:' , env);
    if (!env.crossOriginIsolated) {
      setStatus("Error: Cross-origin isolation not enabled. Check vite.config.js headers.");
      setLoading(false);
      return;
    }

    setStatus("Initializing FFmpeg...");

    try {
      //  Load FFmpeg from /public/ffmpeg/ (local)
      
      if (!ffmpeg.loaded) {
        setStatus("Loading FFmpeg core...");
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
        console.log('Fetching from:', baseURL);
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        console.log("FFmpeg loaded successfully");
      }

      //  Write input file to FFmpeg virtual FS
      setStatus("Writing input file...");
      await ffmpeg.writeFile("input.mp4", await fetchFile(inputFile));

      //  Execute FFmpeg command
      setStatus("Converting video...");
      await ffmpeg.exec(["-i", "input.mp4", "output.webm"]);

      //  Read the converted file
      const data = await ffmpeg.readFile("output.webm");

      //  Create Blob URL for preview
      const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/webm" }));
      setOutputUrl(url);
      setStatus("Conversion complete!");
    } catch (err) {
      console.error("FFmpeg error:", err);
      setStatus(" Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1> Video Converter (MP4 → WebM)</h1>

      <input type="file" accept="video/mp4,video/*" onChange={handleFileChange} />
      <button
        onClick={convertVideo}
        disabled={!inputFile || loading}
        style={{ marginLeft: 10, padding: "6px 10px" }}
      >
        {loading ? "Processing..." : "Convert"}
      </button>

      <p>{status}</p>

      {outputUrl && (
        <video src={outputUrl} controls width="400" style={{ marginTop: 10 }} />
      )}
    </div>
  );
}

export default VideoConverter;
