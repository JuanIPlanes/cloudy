'use client';

import { useState, useRef, useEffect } from 'react';

interface Video {
    id: string;
    filename: string;
    size: number;
    uploadedAt: number;
    path: string;
    fs_id: string;
    mimeType?: string;
}

export default function Home() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const response = await fetch('/api/videos');
            const data = await response.json();
            if (data.success) {
                setVideos(data.videos);
            }
        } catch (error) {
            console.error('Failed to load videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('video/')) {
            alert('Please select a video file');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);

            const headers: HeadersInit = {};
            if (apiKey) {
                headers['x-api-key'] = apiKey;
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert('Video uploaded successfully!');
                loadVideos();
            } else {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload video');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (video: Video) => {
        if (!confirm(`Delete ${video.filename}?`)) return;

        try {
            const headers: HeadersInit = {};
            if (apiKey) {
                headers['x-api-key'] = apiKey;
            }

            const response = await fetch(`/api/videos/${video.fs_id}?path=${encodeURIComponent(video.path)}`, {
                method: 'DELETE',
                headers,
            });

            const data = await response.json();

            if (data.success) {
                alert('Video deleted successfully!');
                loadVideos();
            } else {
                alert(`Delete failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete video');
        }
    };

    const getVideoUrl = (video: Video) => {
        return `/api/videos/${video.fs_id}`;
    };

    const copyUrl = (video: Video) => {
        const url = `${window.location.origin}${getVideoUrl(video)}`;
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Nascent Glenn
                    </h1>
                    <p className="text-xl text-gray-400">
                        Serverless Video Delivery Platform
                    </p>
                </div>

                {/* API Key Input */}
                <div className="glass p-6 mb-8 animate-fade-in">
                    <label className="block text-sm font-medium mb-2">
                        API Key (Optional for viewing, required for upload/delete)
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Upload Area */}
                <div
                    className={`glass p-12 mb-8 text-center cursor-pointer transition-all duration-300 animate-fade-in ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : ''
                        } ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-500/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="text-6xl mb-4">🎬</div>

                    {uploading ? (
                        <div>
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
                            <p className="text-lg">Uploading video...</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-2xl font-semibold mb-2">
                                Drop your video here or click to browse
                            </p>
                            <p className="text-gray-400">
                                Supports MP4, MKV, AVI, MOV, and more
                            </p>
                        </div>
                    )}
                </div>

                {/* Videos Grid */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Your Videos</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="glass p-12 text-center">
                            <p className="text-xl text-gray-400">No videos yet. Upload your first video!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className="glass p-6 hover:border-indigo-500/50 transition-all duration-300 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="text-4xl">🎥</div>
                                        <button
                                            onClick={() => handleDelete(video)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                            title="Delete video"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-2 truncate" title={video.filename}>
                                        {video.filename}
                                    </h3>

                                    <div className="text-sm text-gray-400 space-y-1 mb-4">
                                        <p>Size: {formatFileSize(video.size)}</p>
                                        <p>Uploaded: {formatDate(video.uploadedAt)}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={getVideoUrl(video)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-center font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                                        >
                                            Watch
                                        </a>
                                        <button
                                            onClick={() => copyUrl(video)}
                                            className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                            title="Copy URL"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-gray-500 text-sm">
                    <p>Powered by Terabox • Deployed on Vercel</p>
                </div>
            </div>
        </main>
    );
}
