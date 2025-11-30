const TeraboxUploader = require('terabox-upload-tool');

export interface TeraboxCredentials {
    ndus: string;
    appId: string;
    uploadId: string;
    jsToken: string;
    browserId: string;
}

export interface VideoFile {
    fs_id: string;
    path: string;
    server_filename: string;
    size: number;
    server_mtime: number;
    category: number;
    isdir: number;
}

export interface UploadResult {
    success: boolean;
    message?: string;
    fileDetails?: VideoFile;
}

class TeraboxService {
    private uploader: any;
    private credentials: TeraboxCredentials;

    constructor() {
        this.credentials = {
            ndus: process.env.TERABOX_NDUS || '',
            appId: process.env.TERABOX_APP_ID || '',
            uploadId: process.env.TERABOX_UPLOAD_ID || '',
            jsToken: process.env.TERABOX_JS_TOKEN || '',
            browserId: process.env.TERABOX_BROWSER_ID || '',
        };

        this.validateCredentials();
        this.uploader = new TeraboxUploader(this.credentials);
    }

    private validateCredentials() {
        const missing = Object.entries(this.credentials)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new Error(
                `Missing Terabox credentials: ${missing.join(', ')}. Please check your .env file.`
            );
        }
    }

    async uploadVideo(
        filePath: string,
        directory: string = process.env.UPLOAD_DIRECTORY || '/videos',
        showProgress: boolean = false
    ): Promise<UploadResult> {
        try {
            const result = await this.uploader.uploadFile(
                filePath,
                showProgress,
                directory
            );
            return result;
        } catch (error: any) {
            console.error('Terabox upload error:', error);
            throw new Error(`Failed to upload video: ${error.message}`);
        }
    }

    async getVideoUrl(fileId: string): Promise<string> {
        try {
            const result = await this.uploader.downloadFile(fileId);

            if (result && result.dlink) {
                return result.dlink;
            }

            throw new Error('No download link returned from Terabox');
        } catch (error: any) {
            console.error('Terabox download URL error:', error);
            throw new Error(`Failed to get video URL: ${error.message}`);
        }
    }

    async listVideos(directory: string = process.env.UPLOAD_DIRECTORY || '/videos'): Promise<VideoFile[]> {
        try {
            console.log('📁 Fetching files from directory:', directory);
            const response = await this.uploader.fetchFileList(directory);

            console.log('📦 Raw response:', JSON.stringify(response, null, 2));

            // The terabox-upload-tool wraps the response in a data object
            // Structure: { success: true, data: { list: [...] } }
            let fileList: VideoFile[] = [];

            if (Array.isArray(response)) {
                fileList = response;
            } else if (response.data && response.data.list) {
                fileList = response.data.list;
            } else if (response.list) {
                fileList = response.list;
            }

            console.log('📋 Total files found:', fileList.length);
            if (fileList.length > 0) {
                console.log('📄 Sample file:', fileList[0]);
            }

            // Filter only video files
            const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
            const videos = fileList.filter((file: VideoFile) => {
                const ext = file.server_filename.toLowerCase().match(/\.[^.]+$/)?.[0];
                const isVideo = ext && videoExtensions.includes(ext);
                if (!isVideo && fileList.length < 10) {
                    console.log(`⏭️  Skipping non-video: ${file.server_filename}`);
                }
                return isVideo;
            });

            console.log('🎬 Video files found:', videos.length);

            return videos;
        } catch (error: any) {
            console.error('❌ Terabox list videos error:', error);
            throw new Error(`Failed to list videos: ${error.message}`);
        }
    }

    async deleteVideo(filePath: string): Promise<boolean> {
        try {
            const result = await this.uploader.deleteFiles([filePath]);
            return result.success || false;
        } catch (error: any) {
            console.error('Terabox delete error:', error);
            throw new Error(`Failed to delete video: ${error.message}`);
        }
    }

    async moveVideo(
        oldPath: string,
        newDirectory: string,
        newName: string
    ): Promise<boolean> {
        try {
            const result = await this.uploader.moveFiles(oldPath, newDirectory, newName);
            return result.success || false;
        } catch (error: any) {
            console.error('Terabox move error:', error);
            throw new Error(`Failed to move video: ${error.message}`);
        }
    }
}

// Singleton instance
let teraboxInstance: TeraboxService | null = null;

export function getTeraboxService(): TeraboxService {
    if (!teraboxInstance) {
        teraboxInstance = new TeraboxService();
    }
    return teraboxInstance;
}

export default TeraboxService;
