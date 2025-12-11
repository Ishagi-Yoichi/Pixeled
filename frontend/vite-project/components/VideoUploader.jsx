import React, { useState,useRef } from "react";
import { Upload, Video } from 'lucide-react';


function VideoUploader({ onVideoUpload }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e)=>{
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave =()=>{
        setIsDragging(false);
    }

    const handleDrop =(e)=>{
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if(file && file.type.startsWith('video/')){
            onVideoUpload(file);
        }
    };

    const handleFileSelect = (e)=>{
        const file = e.target.files?.[0];
        if(file){
            onVideoUpload(file);
        }
    };

    return(
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative mt-5 w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-10 border border-dashed rounded-3xl px-20 py-14 transition-all duration-300
                ${
                    isDragging
                    ? 'border-cyan-400 bg-cyan-400/10 scale-[1.02]'
                    : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                }
            `}
        >
            <input
                ref={fileInputRef} type='file' accept='video/mp4,video/*' onChange={handleFileSelect} className="hidden"
            />
             <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full" />
                        <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-7 rounded-2xl">
                         <Video className="w-20 h-20 text-white" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

            <div className="space-y-2">
                <h2 className="text-4xl font-extrabold text-white tracking-tight">Upload Your Video</h2>
                <p className="text-gray-200 max-w-3xl text-lg">
                Drag and drop your video file here, or click to browse
                </p>
            </div>

            <button
          onClick={() => fileInputRef.current?.click()}
          className="group relative px-14 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white text-xl transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/50 hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-7 h-7" />
            <span>Select Video File</span>
          </div>
        </button>
        <div className="flex gap-3 text-sm text-gray-300">
          <span className="px-4 py-1.5 bg-gray-700/50 rounded-full">MP4</span>
          <span className="px-4 py-1.5 bg-gray-700/50 rounded-full">WebM</span>
          <span className="px-4 py-1.5 bg-gray-700/50 rounded-full">MOV</span>
          <span className="px-4 py-1.5 bg-gray-700/50 rounded-full">AVI</span>
        </div>
      </div>
    
        
        
            

            
    )

}

export default VideoUploader;