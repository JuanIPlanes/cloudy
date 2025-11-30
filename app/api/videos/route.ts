import { NextRequest, NextResponse } from 'next/server';
import { getTeraboxService } from '@/lib/terabox';
import { createVideoMetadata } from '@/lib/video-metadata';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const directory = searchParams.get('directory') || process.env.UPLOAD_DIRECTORY || '/movies';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        const terabox = getTeraboxService();
        const videos = await terabox.listVideos(directory);

        // Create metadata for all videos
        const videosWithMetadata = videos.map(createVideoMetadata);

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedVideos = videosWithMetadata.slice(startIndex, endIndex);

        return NextResponse.json({
            success: true,
            videos: paginatedVideos,
            pagination: {
                page,
                limit,
                total: videosWithMetadata.length,
                totalPages: Math.ceil(videosWithMetadata.length / limit),
            },
        });
    } catch (error: any) {
        console.error('List videos error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to list videos' },
            { status: 500 }
        );
    }
}
