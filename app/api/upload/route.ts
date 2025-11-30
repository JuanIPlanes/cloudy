import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { getTeraboxService } from '@/lib/terabox';
import { requireAuth, createAuthError } from '@/lib/auth';
import { createVideoMetadata } from '@/lib/video-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Authenticate request
        const auth = requireAuth(request);
        if (!auth.authorized) {
            return createAuthError(auth.error);
        }

        const formData = await request.formData();
        const file = formData.get('video') as File;
        const directory = (formData.get('directory') as string) || process.env.UPLOAD_DIRECTORY || '/videos';

        if (!file) {
            return NextResponse.json(
                { error: 'No video file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return NextResponse.json(
                { error: 'File must be a video' },
                { status: 400 }
            );
        }

        // Save file temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const tempFilePath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
        await writeFile(tempFilePath, buffer);

        try {
            // Upload to Terabox
            const terabox = getTeraboxService();
            const result = await terabox.uploadVideo(tempFilePath, directory, false);

            if (!result.success || !result.fileDetails) {
                throw new Error(result.message || 'Upload failed');
            }

            // Create metadata
            const metadata = createVideoMetadata(result.fileDetails);

            return NextResponse.json({
                success: true,
                video: metadata,
                message: 'Video uploaded successfully',
            });
        } finally {
            // Clean up temp file
            try {
                await unlink(tempFilePath);
            } catch (err) {
                console.error('Failed to delete temp file:', err);
            }
        }
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload video' },
            { status: 500 }
        );
    }
}
