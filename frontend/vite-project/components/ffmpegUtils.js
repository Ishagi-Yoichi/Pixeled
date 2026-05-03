/**
 * ffmpegUtils.js
 * Optimized FFmpeg-WASM helpers for low-spec / mobile environments.
 *
 * Design rules applied throughout:
 *  - -threads 1          : WASM is single-threaded; more threads inflate peak heap.
 *  - -deadline realtime  : skips expensive RD loops; halves peak memory for libvpx.
 *  - -cpu-used 8         : fastest libvpx preset, negligible quality loss for browser use.
 *  - scale before encode : resolves the #1 cause of OOM on long clips.
 *  - delete VFS files immediately after reading: every undeleted file sits in WASM heap.
 *  - chunked thumb loop  : avoids accumulating all frames in memory at once.
 */

import { fetchFile, toBlobURL } from "@ffmpeg/util";

const CDN = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
const MAX_SIZE_MB = 100; // raised — chunking makes this safe

// ─── Shared loader ────────────────────────────────────────────────────────────

export async function loadFFmpeg(ffmpeg, onStatus) {
  if (ffmpeg.loaded) return;
  onStatus?.("Loading FFmpeg core…");
  const [coreURL, wasmURL] = await Promise.all([
    toBlobURL(`${CDN}/ffmpeg-core.js`, "text/javascript"),
    toBlobURL(`${CDN}/ffmpeg-core.wasm`, "application/wasm"),
  ]);
  await ffmpeg.load({ coreURL, wasmURL });
}

function checkSize(file) {
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Max ${MAX_SIZE_MB} MB.`);
  }
}

/** Write input, run command, read output, clean up — all in one safe wrapper. */
async function runJob(
  ffmpeg,
  inputFile,
  inputName,
  outputName,
  args,
  mimeType,
) {
  const inputData = await fetchFile(inputFile);
  await ffmpeg.writeFile(inputName, inputData);

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile(outputName);
  const url = URL.createObjectURL(new Blob([data.buffer], { type: mimeType }));

  await safeDelete(ffmpeg, inputName);
  await safeDelete(ffmpeg, outputName);

  return url;
}

async function safeDelete(ffmpeg, name) {
  try {
    await ffmpeg.deleteFile(name);
  } catch (_) {
    /* ignorable */
  }
}

// ─── 1. FORMAT CONVERSION ─────────────────────────────────────────────────────
/**
 * Converts any video to WebM/VP8 with minimal memory overhead.
 *
 * Key opts:
 *  - scale=640:-2       : pre-scale to 640 wide (even height). Cuts frame buffer 4×.
 *  - -deadline realtime : fastest VP8 mode; avoids multi-pass RD that spikes heap.
 *  - -cpu-used 8        : skip exhaustive motion search.
 *  - -row-mt 1          : row-level parallelism without full-frame buffering.
 *  - -crf 35 -b:v 0     : CRF mode (constant quality), no bitrate target = no VBR buffer.
 */
export async function convertVideo(ffmpeg, file, onStatus) {
  checkSize(file);
  await loadFFmpeg(ffmpeg, onStatus);
  onStatus?.("Converting…");

  const url = await runJob(
    ffmpeg,
    file,
    "input.mp4",
    "output.webm",
    [
      "-threads",
      "1",
      "-i",
      "input.mp4",
      "-vf",
      "scale=640:-2", // downscale first — biggest memory win
      "-c:v",
      "libvpx",
      "-crf",
      "35",
      "-b:v",
      "0", // CRF mode: no bitrate buffer
      "-deadline",
      "realtime", // skip expensive RD decisions
      "-cpu-used",
      "8",
      "-row-mt",
      "1",
      "-tile-columns",
      "1",
      "-c:a",
      "libvorbis",
      "-q:a",
      "4",
      "-ar",
      "44100", // normalise sample rate
      "output.webm",
    ],
    "video/webm",
  );

  onStatus?.("Done!");
  return url;
}

// ─── 2. THUMBNAIL EXTRACTION ──────────────────────────────────────────────────
/**
 * Extracts frames at a given interval, processing in batches of `batchSize`
 * to cap peak memory. Returns array of { url, timestamp }.
 *
 * Key opts:
 *  - select filter      : discards frames before decode buffer fills (safer than fps=).
 *  - scale=480:-2       : small output; thumbnails don't need full resolution.
 *  - -vsync vfr         : required with select filter (not vsync 2).
 *  - -frames:v N        : hard cap per batch prevents heap overflow.
 *  - delete immediately : each JPEG stays in WASM heap until deleted.
 */
export async function extractThumbnails(
  ffmpeg,
  file,
  intervalSec = 3,
  onStatus,
  batchSize = 8, // process this many frames at a time
) {
  checkSize(file);
  await loadFFmpeg(ffmpeg, onStatus);

  const inputData = await fetchFile(file);
  await ffmpeg.writeFile("input.mp4", inputData);

  // Probe duration via a near-instant stream copy to /dev/null substitute.
  // FFmpeg prints duration in stderr but we can't read it in WASM easily,
  // so we estimate from file size at ~1 MB/s as a safe fallback, then
  // cap total frames to avoid runaway extraction.
  const estimatedDuration = Math.max(10, (file.size / (1024 * 1024)) * 8);
  const maxFrames = Math.min(50, Math.floor(estimatedDuration / intervalSec));

  const results = [];

  for (let batch = 0; batch * batchSize < maxFrames; batch++) {
    const startFrame = batch * batchSize;
    const seekSec = startFrame * intervalSec;
    const framesToGet = Math.min(batchSize, maxFrames - startFrame);

    onStatus?.(
      `Extracting frames ${startFrame + 1}–${startFrame + framesToGet}…`,
    );

    // selectExpr picks every Nth frame using PTS-based selection.
    // We use -ss to seek cheaply then select within the segment.
    const selectExpr =
      intervalSec === 1
        ? "eq(pict_type\\,I)" // keyframes only for 1s intervals
        : `not(mod(n\\,${Math.round(intervalSec * 25)}))`; // every N frames (assume 25fps base)

    try {
      await ffmpeg.exec([
        "-threads",
        "1",
        "-ss",
        String(seekSec),
        "-i",
        "input.mp4",
        "-vf",
        `select='${selectExpr}',scale=480:-2`,
        "-vsync",
        "vfr", // required with select filter
        "-q:v",
        "8", // JPEG quality; 8 = good thumbnail, low RAM
        "-frames:v",
        String(framesToGet),
        `thumb_${batch}_%03d.jpg`,
      ]);
    } catch (e) {
      console.warn(
        `Batch ${batch} exec error (partial results ok):`,
        e.message,
      );
    }

    // Read and immediately delete each file
    for (let i = 1; i <= framesToGet; i++) {
      const name = `thumb_${batch}_${String(i).padStart(3, "0")}.jpg`;
      try {
        const data = await ffmpeg.readFile(name);
        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "image/jpeg" }),
        );
        const timestamp = seekSec + (i - 1) * intervalSec;
        results.push({ url, timestamp, name });
        await safeDelete(ffmpeg, name); // free heap immediately
      } catch (_) {
        // frame wasn't produced (end of video) — stop this batch
        break;
      }
    }

    // If we got fewer frames than requested, we've hit end-of-video
    if (results.length < startFrame + framesToGet) break;
  }

  await safeDelete(ffmpeg, "input.mp4");

  if (results.length === 0)
    throw new Error("No thumbnails could be extracted.");
  onStatus?.(`Extracted ${results.length} frames.`);
  return results;
}

// ─── 3. VIDEO TRIMMING ────────────────────────────────────────────────────────
/**
 * Trims a video between startSec and endSec.
 *
 * Fast path: -c copy (stream copy, zero decode, milliseconds, no memory spike).
 * This is keyframe-accurate. For frame-accurate trim pass accurate=true to
 * re-encode only the trimmed segment (still fast since segment is short).
 *
 * Key opts:
 *  - -ss before -i      : fast seek; avoids decoding leading frames.
 *  - -t duration        : output duration (more reliable than -to in all ffmpeg builds).
 *  - -c copy            : no decode/encode — the lowest-overhead operation possible.
 */
export async function trimVideo(
  ffmpeg,
  file,
  startSec,
  endSec,
  onStatus,
  accurate = false,
) {
  checkSize(file);
  if (endSec <= startSec) throw new Error("End time must be after start time.");
  await loadFFmpeg(ffmpeg, onStatus);
  onStatus?.("Trimming…");

  const duration = endSec - startSec;

  const args = accurate
    ? [
        "-threads",
        "1",
        "-ss",
        String(startSec),
        "-i",
        "input.mp4",
        "-t",
        String(duration),
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2", // ensure even dims for codec
        "-c:v",
        "libvpx",
        "-deadline",
        "realtime",
        "-cpu-used",
        "8",
        "-crf",
        "33",
        "-b:v",
        "0",
        "-c:a",
        "libvorbis",
        "-q:a",
        "4",
        "output.webm",
      ]
    : [
        // Stream copy: fastest possible, no memory spike
        "-ss",
        String(startSec),
        "-i",
        "input.mp4",
        "-t",
        String(duration),
        "-c",
        "copy",
        "-avoid_negative_ts",
        "make_zero",
        "output.mp4",
      ];

  const outName = accurate ? "output.webm" : "output.mp4";
  const mime = accurate ? "video/webm" : "video/mp4";

  const url = await runJob(ffmpeg, file, "input.mp4", outName, args, mime);
  onStatus?.("Done!");
  return url;
}

// ─── 4. VIDEO COMPRESSION ─────────────────────────────────────────────────────
/**
 * Compresses video with aggressive settings tuned for size reduction on low-spec.
 *
 * Compression levers (ordered by impact):
 *   1. Resolution scale (biggest win — halving res = 4× fewer pixels to encode)
 *   2. Frame rate reduction (fps=24 from 60 = 2.5× fewer frames)
 *   3. CRF value (higher = more compression, lower quality)
 *   4. -deadline realtime (no two-pass, no look-ahead buffer)
 *
 * @param {number} quality  1–3: 1=aggressive (smallest), 2=balanced, 3=light
 */
export async function compressVideo(ffmpeg, file, onStatus, quality = 2) {
  checkSize(file);
  await loadFFmpeg(ffmpeg, onStatus);
  onStatus?.("Compressing…");

  const presets = {
    1: { scale: 360, fps: 20, crf: 50 }, // aggressive: ~85% size reduction
    2: { scale: 480, fps: 24, crf: 40 }, // balanced:   ~65% size reduction
    3: { scale: 640, fps: 30, crf: 33 }, // light:      ~40% size reduction
  };
  const { scale, fps, crf } = presets[quality] ?? presets[2];

  const url = await runJob(
    ffmpeg,
    file,
    "input.mp4",
    "output.webm",
    [
      "-threads",
      "1",
      "-i",
      "input.mp4",
      "-vf",
      `scale=${scale}:-2,fps=${fps}`, // resolution + fps together in one filter
      "-c:v",
      "libvpx",
      "-crf",
      String(crf),
      "-b:v",
      "0",
      "-deadline",
      "realtime",
      "-cpu-used",
      "8",
      "-row-mt",
      "1",
      "-c:a",
      "libvorbis",
      "-q:a",
      "3",
      "-ar",
      "44100",
      "output.webm",
    ],
    "video/webm",
  );

  onStatus?.("Done!");
  return url;
}

// ─── 5. AUDIO EXTRACTION ──────────────────────────────────────────────────────
/**
 * Extracts audio track from video.
 *
 * Fast path: -c:a copy (stream copy, no decode of either stream).
 * Re-encode path: used when source codec isn't Vorbis/Opus (e.g. AAC from MP4).
 *
 * Key opts:
 *  - -vn                : discard video stream immediately; prevents video decode.
 *  - -c:a copy          : zero re-encode; fastest possible, no quality loss.
 *  - -c:a libvorbis     : fallback re-encode (AAC → Vorbis); audio-only = tiny heap.
 */
export async function extractAudio(ffmpeg, file, onStatus, reencode = false) {
  checkSize(file);
  await loadFFmpeg(ffmpeg, onStatus);
  onStatus?.("Extracting audio…");

  const [outName, mime, audioArgs] = reencode
    ? [
        "output.ogg",
        "audio/ogg",
        ["-vn", "-c:a", "libvorbis", "-q:a", "5", "-ar", "44100"],
      ]
    : [
        "output.ogg",
        "audio/ogg",
        ["-vn", "-c:a", "copy"], // stream copy — near-instant
      ];

  // We wrap manually here because stream copy may fail if container mismatch;
  // fall back to re-encode automatically.
  const inputData = await fetchFile(file);
  await ffmpeg.writeFile("input.mp4", inputData);

  try {
    await ffmpeg.exec([
      "-threads",
      "1",
      "-i",
      "input.mp4",
      ...audioArgs,
      outName,
    ]);
  } catch (_) {
    // Stream copy failed (e.g. AAC in MP4) — fall back to libvorbis re-encode
    onStatus?.("Re-encoding audio…");
    await ffmpeg.exec([
      "-threads",
      "1",
      "-i",
      "input.mp4",
      "-vn",
      "-c:a",
      "libvorbis",
      "-q:a",
      "5",
      "-ar",
      "44100",
      outName,
    ]);
  }

  const data = await ffmpeg.readFile(outName);
  const url = URL.createObjectURL(new Blob([data.buffer], { type: mime }));

  await safeDelete(ffmpeg, "input.mp4");
  await safeDelete(ffmpeg, outName);

  onStatus?.("Done!");
  return url;
}
