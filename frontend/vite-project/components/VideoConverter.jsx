import React, { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

function VideoConverter() {
  const [inputFile, setInputFile] = useState(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setInputFile(e.target.files?.[0] || null);
    setOutputUrl('');
  };

  const convertVideo = async () => {
    setLoading(true);
    if (!ffmpeg.loaded) {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
      });
    }
    await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile));
    await ffmpeg.exec(['-i', 'input.mp4', 'output.webm']);
    const data = await ffmpeg.readFile('output.webm');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/webm' }));
    setOutputUrl(url);
    setLoading(false);
  };

  return (
    <div>
      <h1>Video Converter (MP4 to WebM)</h1>
      <input type="file" accept="video/mp4,video/*" onChange={handleFileChange} />
      <button onClick={convertVideo} disabled={!inputFile || loading}>
        Convert
      </button>
      {loading && <p>Processing...</p>}
      {outputUrl && (
        <video src={outputUrl} controls width="400" />
      )}
    </div>
  );
}

export default VideoConverter;


