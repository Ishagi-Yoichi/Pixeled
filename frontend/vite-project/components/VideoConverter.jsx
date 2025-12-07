import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function VideoConverter() {
  // Initialize FFmpeg instance
  const [ffmpeg] = useState(() => new FFmpeg({ log: true }));
  
  // Component state
  const [inputFile, setInputFile] = useState(null);
  const [outputUrl, setOutputUrl] = useState("");
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(3);

  // Handle file selection
  const handleFileChange = (e) => {
    setInputFile(e.target.files?.[0] || null);
    setOutputUrl("");
    setThumbnails([]);
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

  // Extract thumbnails at specific intervals
  const extractThumbnails = async () => {
    if (!inputFile) return;
  
    if (inputFile.size > 50 * 1024 * 1024) {
      setStatus("Error: File too large. Please use a file smaller than 50MB.");
      return;
    }
  
    setLoading(true);
    setThumbnails([]);
    setStatus("Initializing FFmpeg...");
  
    try {
      if (!ffmpeg.loaded) {
        setStatus("Loading FFmpeg core...");
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
        
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
        
        await ffmpeg.load({ coreURL, wasmURL });
      }
  
      setStatus("Writing input file...");
      const inputData = await fetchFile(inputFile);
      console.log('Input file size:', inputData.length, 'bytes');
      await ffmpeg.writeFile("input.mp4", inputData);
  
      setStatus("Extracting thumbnails every " + intervalSeconds + " seconds");
      console.log(`Extracting thumbnails every ${intervalSeconds} seconds`);
      
      const thumbnailUrls = [];
      
      // Use the original fps filter approach but with more conservative settings
      try {
        // Extract with fps filter - this is more reliable
        await ffmpeg.exec([
          "-i", "input.mp4",
          "-vf", `fps=1/${intervalSeconds},scale=320:-1`,  // Scale down + extract at interval
          "-q:v", "8",                      // Lower quality = less memory
          "-frames:v", "20",                // Maximum 20 frames to prevent overflow
          "thumb_%03d.jpg"
        ]);
      } catch (execError) {
        console.log("FFmpeg exec error:", execError.message);
        // If it fails, try to continue and see what files we got
      }
      
      // Read whatever thumbnails were created
      setStatus("Reading thumbnails...");
      const files = await ffmpeg.listDir("/");
      console.log("All files:", files.map(f => f.name));
      
      const thumbFiles = files.filter(file => 
        file.name.startsWith("thumb_") && file.name.endsWith(".jpg")
      ).sort();
      
      console.log(`Found ${thumbFiles.length} thumbnails`);
      
      for (let i = 0; i < thumbFiles.length; i++) {
        const file = thumbFiles[i];
        try {
          const data = await ffmpeg.readFile(file.name);
          const url = URL.createObjectURL(new Blob([data.buffer], { type: "image/jpeg" }));
          const timestamp = i * intervalSeconds;
          thumbnailUrls.push({ name: file.name, url, timestamp });
          console.log(`Read thumbnail ${i + 1} at ${timestamp}s`);
          
          // Delete immediately after reading
          await ffmpeg.deleteFile(file.name);
        } catch (err) {
          console.log(`Could not read ${file.name}:`, err.message);
        }
      }
      
      // Clean up
      setStatus("Cleaning up...");
      try {
        await ffmpeg.deleteFile("input.mp4");
      } catch (e) {
        console.log("Cleanup error (ignorable):", e.message);
      }
  
      if (thumbnailUrls.length === 0) {
        setStatus("Error: Could not extract any thumbnails");
      } else {
        console.log(`Extraction completed - ${thumbnailUrls.length} thumbnails`);
        setThumbnails(thumbnailUrls);
        setStatus(`Extracted ${thumbnailUrls.length} thumbnails!`);
      }
      
    } catch (err) {
      console.error("FFmpeg error:", err);
      setStatus("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 className="text-6xl font-mono text-center mt-3.5">Video Arena</h1>

      {/* File input */}
      <input className="border p-4 mt-4 font-sans hover:cursor-pointer hover:font-bold"
        type="file" 
        accept="video/mp4,video/*" 
        onChange={handleFileChange} 
      />

      <h1 className="p-4 text-3xl font-mono">Select Your Modifications</h1>

      <div style={{ marginTop: 15 }}>
        {/* Convert button */}
        <button
          onClick={convertVideo}
          disabled={!inputFile || loading}
          className="p-3 bg-gray-100 rounded-2xl text-zinc-900 cursor-pointer font-semibold "
        >
          {loading ? "Processing..." : "Convert to WebM"}
        </button>
        <br/>

        {/* Extract thumbnails button */}
        <button
          onClick={extractThumbnails}
          disabled={!inputFile || loading}
          className="p-3 bg-gray-100 rounded-2xl text-zinc-900 cursor-pointer font-semibold"
        >
          {loading ? "Processing..." : "Extract Thumbnails"}
        </button><br/>

        {/* Interval input */}
        <label style={{ marginLeft: 15 }}>
          Interval (seconds): 
          <input 
            type="number" 
            min="1" 
            value={intervalSeconds}
            onChange={(e) => setIntervalSeconds(Number(e.target.value))}
            className="p-3 bg-gray-100 rounded-2xl text-zinc-900 text-center cursor-pointer font-semibold"
          />
        </label>
      </div>

      {/* Status message */}
      {status && <p style={{ marginTop: 10 }}>{status}</p>}

      {/* Thumbnails display */}
      {thumbnails.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Extracted Thumbnails</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {thumbnails.map((thumb, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <img 
                  src={thumb.url} 
                  alt={`Thumbnail ${index + 1}`}
                  style={{ width: 200, height: 'auto', border: '1px solid #ddd' }}
                />
                <div style={{ fontSize: 12, marginTop: 5 }}>
                  {thumb.timestamp ? `${thumb.timestamp.toFixed(1)}s` : `${index * intervalSeconds}s`}
                </div>
                <a 
                  href={thumb.url} 
                  download={`thumbnail_${index + 1}.jpg`}
                  style={{ fontSize: 12, color: '#007bff' }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output video preview and download */}
      {outputUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Converted Video</h3>
          <video 
            src={outputUrl} 
            controls 
            width="400" 
            style={{ display: 'block' }} 
          />
          <a 
            href={outputUrl} 
            download="converted.webm"
            style={{ 
              display: 'inline-block', 
              marginTop: 10, 
              padding: '8px 12px', 
              background: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 4 
            }}
          >
            Download WebM
          </a>
        </div>
      )}
    </div>
    </div>
  );
}

export default VideoConverter;