import { NextRequest, NextResponse } from 'next/server';
import { getTeraboxService } from '@/lib/terabox';
import { requireAuth, createAuthError } from '@/lib/auth';
import cache from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
    params: {
        id: string;
    };
}

export async function GET(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);

        // Check cache first
        const cacheKey = `video-url-${id}`;
        const cachedUrl = cache.get<string>(cacheKey);

        if (cachedUrl) {
            // Return cached URL as redirect
            return NextResponse.redirect(cachedUrl);
        }

        // Get video URL from Terabox
        const terabox = getTeraboxService();
        const videoUrl = await terabox.getVideoUrl(id);

        // Cache the URL for 1 hour
        cache.set(cacheKey, videoUrl, 3600);

        // Check if client wants JSON response
        const format = searchParams.get('format');
        if (format === 'json') {
            return NextResponse.json({
                success: true,
                url: videoUrl,
                id,
            });
        }

        // Redirect to video URL
        return NextResponse.redirect(videoUrl);
    } catch (error: any) {
        console.error('Get video URL error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get video URL' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        // Authenticate request
        const auth = requireAuth(request);
        if (!auth.authorized) {
            return createAuthError(auth.error);
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json(
                { error: 'Video path is required' },
                { status: 400 }
            );
        }

        const terabox = getTeraboxService();
        const success = await terabox.deleteVideo(path);

        if (!success) {
            throw new Error('Delete operation failed');
        }

        // Clear cache
        cache.delete(`video-url-${id}`);

        return NextResponse.json({
            success: true,
            message: 'Video deleted successfully',
            id,
        });
    } catch (error: any) {
        console.error('Delete video error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete video' },
            { status: 500 }
        );
    }
}
