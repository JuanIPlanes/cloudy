import crypto from 'crypto';

export interface VideoMetadata {
    id: string;
    filename: string;
    size: number;
    uploadedAt: number;
    path: string;
    fs_id: string;
    mimeType?: string;
    duration?: number;
    resolution?: {
        width: number;
        height: number;
    };
    codec?: string;
    bitrate?: number;
}

export function generateVideoId(filename: string, timestamp: number = Date.now()): string {
    const hash = crypto
        .createHash('md5')
        .update(`${filename}-${timestamp}`)
        .digest('hex');
    return hash.substring(0, 16);
}

export function getVideoMimeType(filename: string): string {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];

    const mimeTypes: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm',
        '.m4v': 'video/x-m4v',
    };

    return mimeTypes[ext || ''] || 'video/mp4';
}

export function isVideoFile(filename: string): boolean {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? videoExtensions.includes(ext) : false;
}

export function formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function createVideoMetadata(teraboxFile: any): VideoMetadata {
    const id = generateVideoId(teraboxFile.server_filename, teraboxFile.server_mtime);

    return {
        id,
        filename: teraboxFile.server_filename,
        size: teraboxFile.size,
        uploadedAt: teraboxFile.server_mtime * 1000, // Convert to milliseconds
        path: teraboxFile.path,
        fs_id: teraboxFile.fs_id,
        mimeType: getVideoMimeType(teraboxFile.server_filename),
    };
}
