import { useState, useCallback, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import heroSky from "../src/assets/GoldenSky.png";
import {
  convertVideo,
  extractThumbnails,
  trimVideo,
  compressVideo,
  extractAudio,
} from "./ffmpegUtils";

//tiny shared status hook

function useStatus() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  return { status, loading, setStatus, setLoading };
}

//Sub-feature components

function FormatConvertor({ video, ffmpeg }) {
  const { status, loading, setStatus, setLoading } = useStatus();
  const [outputUrl, setOutputUrl] = useState("");

  const run = async () => {
    setLoading(true);
    setOutputUrl("");
    try {
      const url = await convertVideo(ffmpeg, video, setStatus);
      setOutputUrl(url);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={run} disabled={loading}>
        {loading ? status || "Working…" : "Convert to WebM"}
      </button>
      {outputUrl && (
        <a href={outputUrl} download="converted.webm">
          Download WebM
        </a>
      )}
      {status && !loading && <p>{status}</p>}
    </div>
  );
}

function ThumbnailExtractor({ video, ffmpeg }) {
  const { status, loading, setStatus, setLoading } = useStatus();
  const [thumbnails, setThumbnails] = useState([]);
  const [interval, setInterval] = useState(3);
  // keep track of blob URLs so we can revoke on re-run
  const prevUrls = useRef([]);

  const run = async () => {
    // Revoke old thumbnail blobs
    prevUrls.current.forEach((u) => URL.revokeObjectURL(u));
    setThumbnails([]);
    setLoading(true);
    try {
      const frames = await extractThumbnails(
        ffmpeg,
        video,
        interval,
        setStatus,
      );
      prevUrls.current = frames.map((f) => f.url);
      setThumbnails(frames);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        Interval (s):
        <input
          type="number"
          min="1"
          max="60"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />
      </label>
      <button onClick={run} disabled={loading}>
        {loading ? status || "Extracting…" : "Extract Thumbnails"}
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {thumbnails.map(({ url, timestamp }, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <img
              src={url}
              alt={`frame at ${timestamp}s`}
              style={{ width: 120 }}
            />
            <div style={{ fontSize: 11 }}>{timestamp.toFixed(1)}s</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoTrimmer({ video, ffmpeg, previewUrl }) {
  const { status, loading, setStatus, setLoading } = useStatus();
  const [outputUrl, setOutputUrl] = useState("");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [accurate, setAccurate] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutputUrl("");
    try {
      const url = await trimVideo(
        ffmpeg,
        video,
        start,
        end,
        setStatus,
        accurate,
      );
      setOutputUrl(url);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        Start (s):{" "}
        <input
          type="number"
          min="0"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
        />
      </label>
      <label>
        End (s):{" "}
        <input
          type="number"
          min="1"
          value={end}
          onChange={(e) => setEnd(Number(e.target.value))}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={accurate}
          onChange={(e) => setAccurate(e.target.checked)}
        />
        Frame-accurate (slower, re-encodes)
      </label>
      <button onClick={run} disabled={loading}>
        {loading ? status || "Trimming…" : "Trim Video"}
      </button>
      {outputUrl && (
        <>
          <video
            src={outputUrl}
            controls
            style={{ width: "100%", marginTop: 8 }}
          />
          <a
            href={outputUrl}
            download={accurate ? "trimmed.webm" : "trimmed.mp4"}
          >
            Download
          </a>
        </>
      )}
    </div>
  );
}

function VideoCompressor({ video, ffmpeg }) {
  const { status, loading, setStatus, setLoading } = useStatus();
  const [outputUrl, setOutputUrl] = useState("");
  const [quality, setQuality] = useState(2);

  const labels = { 1: "Aggressive (smallest)", 2: "Balanced", 3: "Light" };

  const run = async () => {
    setLoading(true);
    setOutputUrl("");
    try {
      const url = await compressVideo(ffmpeg, video, setStatus, quality);
      setOutputUrl(url);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        Quality preset:
        <select
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
        >
          {[1, 2, 3].map((q) => (
            <option key={q} value={q}>
              {labels[q]}
            </option>
          ))}
        </select>
      </label>
      <button onClick={run} disabled={loading}>
        {loading ? status || "Compressing…" : "Compress Video"}
      </button>
      {outputUrl && (
        <>
          <video
            src={outputUrl}
            controls
            style={{ width: "100%", marginTop: 8 }}
          />
          <a href={outputUrl} download="compressed.webm">
            Download
          </a>
        </>
      )}
    </div>
  );
}

function AudioExtractor({ video, ffmpeg }) {
  const { status, loading, setStatus, setLoading } = useStatus();
  const [outputUrl, setOutputUrl] = useState("");
  const [reencode, setReencode] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutputUrl("");
    try {
      const url = await extractAudio(ffmpeg, video, setStatus, reencode);
      setOutputUrl(url);
    } catch (e) {
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={reencode}
          onChange={(e) => setReencode(e.target.checked)}
        />
        Force re-encode to Vorbis (use if stream copy fails)
      </label>
      <button onClick={run} disabled={loading}>
        {loading ? status || "Extracting…" : "Extract Audio"}
      </button>
      {outputUrl && (
        <>
          <audio src={outputUrl} controls style={{ marginTop: 8 }} />
          <a href={outputUrl} download="audio.ogg">
            Download OGG
          </a>
        </>
      )}
    </div>
  );
}

// Main component

const FEATURES = [
  { id: "convert", label: "Convert Format" },
  { id: "thumbnails", label: "Extract Frames" },
  { id: "trim", label: "Trim Video" },
  { id: "compress", label: "Compress Video" },
  { id: "audio", label: "Extract Audio" },
];

export default function VideoArena() {
  // Single shared FFmpeg instance — loaded once, reused across all features.
  const [ffmpeg] = useState(() => new FFmpeg({ log: true }));

  const [inputFile, setInputFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleFileChange = useCallback((fileOrEvent) => {
    const file = fileOrEvent?.target?.files?.[0] ?? fileOrEvent ?? null;

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : "";
    });

    setInputFile(file);
    setSelectedFeature(null);
  }, []);

  const handleReset = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setInputFile(null);
    setSelectedFeature(null);
  }, []);

  const renderFeature = () => {
    if (!inputFile) return null;
    const props = { video: inputFile, ffmpeg, previewUrl };
    switch (selectedFeature) {
      case "convert":
        return <FormatConvertor {...props} />;
      case "thumbnails":
        return <ThumbnailExtractor {...props} />;
      case "trim":
        return <VideoTrimmer {...props} />;
      case "compress":
        return <VideoCompressor {...props} />;
      case "audio":
        return <AudioExtractor {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src={heroSky} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Video Editor
          </h1>
          <p className="text-zinc-400 mt-3 text-base">
            Simple tools. Clean workflow.
          </p>
        </div>

        {!inputFile ? (
          <div className="flex justify-center pt-20">
            <div
              className="
              w-full max-w-md
              border border-white/10
              bg-white/5 backdrop-blur-xl
              rounded-2xl p-8
            "
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-medium
                file:bg-gradient-to-r file:from-amber-300 file:to-amber-500
                file:text-black
                hover:file:brightness-110 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Video Preview */}
            <div
              className="
              border border-white/10
              bg-white/5 backdrop-blur-xl
              rounded-2xl p-5
            "
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-zinc-400">Preview</p>

                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-400 hover:text-white transition"
                >
                  Change file
                </button>
              </div>

              <video src={previewUrl} controls className="w-full rounded-xl" />
            </div>

            {/* Features */}
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 text-center">
                Choose a feature
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {FEATURES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedFeature(id)}
                    className={`
                      px-4 py-2 text-sm rounded-full border transition
                      ${
                        selectedFeature === id
                          ? "bg-amber-400 text-black border-transparent"
                          : "border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Output */}
            {selectedFeature && (
              <div
                className="
                border border-white/10
                bg-white/5 backdrop-blur-xl
                rounded-2xl p-6
              "
              >
                {renderFeature()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
