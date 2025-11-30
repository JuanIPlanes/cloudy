import { NextRequest } from 'next/server';

const API_KEYS = (process.env.API_KEYS || '').split(',').filter(Boolean);

export function validateApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
        return false;
    }

    return API_KEYS.includes(apiKey);
}

export function requireAuth(request: NextRequest): { authorized: boolean; error?: string } {
    if (API_KEYS.length === 0) {
        // If no API keys configured, allow all requests (development mode)
        console.warn('⚠️  No API keys configured. All requests will be allowed.');
        return { authorized: true };
    }

    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
        return {
            authorized: false,
            error: 'Missing API key. Please provide x-api-key header.',
        };
    }

    if (!API_KEYS.includes(apiKey)) {
        return {
            authorized: false,
            error: 'Invalid API key.',
        };
    }

    return { authorized: true };
}

export function createAuthError(message: string = 'Unauthorized') {
    return Response.json(
        { error: message },
        { status: 401 }
    );
}
