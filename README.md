# Nascent Glenn - Serverless Video Delivery Service

A Cloudinary-like serverless video delivery platform using Terabox as storage backend, deployable on Vercel's free tier.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JuanIPlanes/cloudy)

## Features

- 🎬 **Video Upload**: Upload videos to Terabox (1TB free storage)
- 🌐 **Streaming URLs**: Get direct streaming URLs for your videos
- 📋 **Video Management**: List, view, and delete videos
- 🔐 **API Key Authentication**: Secure your API endpoints
- ⚡ **Serverless**: Deploy on Vercel with zero infrastructure management
- 💾 **Smart Caching**: In-memory caching for improved performance
- 🎨 **Modern UI**: Beautiful glassmorphic interface with drag-and-drop upload

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Storage**: Terabox (via terabox-upload-tool)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

1. **Node.js** 18+ installed
2. **Terabox Account** with valid credentials
3. **Vercel Account** (for deployment)

## Getting Started

### 1. Install Dependencies

Due to PowerShell execution policy restrictions, you may need to run:

```bash
# Using cmd.exe or Git Bash
npm install
```

Or manually enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install:
```bash
npm install
```

### 2. Configure Terabox Credentials

Copy the example environment file:
```bash
cp .env.example .env
```

Follow the guide in [docs/TERABOX_CREDENTIALS.md](./docs/TERABOX_CREDENTIALS.md) to extract your Terabox credentials, then update `.env`:

```env
TERABOX_NDUS=your_ndus_value
TERABOX_APP_ID=your_app_id
TERABOX_UPLOAD_ID=your_upload_id
TERABOX_JS_TOKEN=your_js_token
TERABOX_BROWSER_ID=your_browser_id

API_KEYS=your-secret-key-1,your-secret-key-2
UPLOAD_DIRECTORY=/videos
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Upload Video

**Endpoint**: `POST /api/upload`

**Headers**:
- `x-api-key`: Your API key (required)

**Body** (multipart/form-data):
- `video`: Video file
- `directory`: Target directory (optional, defaults to `/videos`)

**Example**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "x-api-key: your-secret-key" \
  -F "video=@/path/to/video.mp4"
```

**Response**:
```json
{
  "success": true,
  "video": {
    "id": "abc123def456",
    "filename": "video.mp4",
    "size": 10485760,
    "uploadedAt": 1701360000000,
    "path": "/videos/video.mp4",
    "fs_id": "123456789",
    "mimeType": "video/mp4"
  },
  "message": "Video uploaded successfully"
}
```

### Get Video URL

**Endpoint**: `GET /api/videos/:id`

**Query Parameters**:
- `format`: Set to `json` to get JSON response instead of redirect

**Example**:
```bash
# Redirect to video
curl http://localhost:3000/api/videos/123456789

# Get JSON response
curl http://localhost:3000/api/videos/123456789?format=json
```

**Response** (with `format=json`):
```json
{
  "success": true,
  "url": "https://terabox.com/...",
  "id": "123456789"
}
```

### List Videos

**Endpoint**: `GET /api/videos`

**Query Parameters**:
- `directory`: Directory to list (optional, defaults to `/videos`)
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 50)

**Example**:
```bash
curl http://localhost:3000/api/videos?page=1&limit=10
```

**Response**:
```json
{
  "success": true,
  "videos": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Delete Video

**Endpoint**: `DELETE /api/videos/:id`

**Headers**:
- `x-api-key`: Your API key (required)

**Query Parameters**:
- `path`: Full path to the video (required)

**Example**:
```bash
curl -X DELETE "http://localhost:3000/api/videos/123456789?path=/videos/video.mp4" \
  -H "x-api-key: your-secret-key"
```

**Response**:
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "id": "123456789"
}
```

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Set Environment Variables

In your Vercel dashboard, add all environment variables from `.env`:
- `TERABOX_NDUS`
- `TERABOX_APP_ID`
- `TERABOX_UPLOAD_ID`
- `TERABOX_JS_TOKEN`
- `TERABOX_BROWSER_ID`
- `API_KEYS`
- `UPLOAD_DIRECTORY`

### 4. Redeploy

```bash
vercel --prod
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Upload video
const formData = new FormData();
formData.append('video', videoFile);

const response = await fetch('https://your-app.vercel.app/api/upload', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-secret-key',
  },
  body: formData,
});

const data = await response.json();
console.log('Video ID:', data.video.id);

// Get streaming URL
const videoUrl = `https://your-app.vercel.app/api/videos/${data.video.fs_id}`;
```

### HTML Video Player

```html
<video controls width="640">
  <source src="https://your-app.vercel.app/api/videos/123456789" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

## Limitations

- **Vercel Free Tier**: 10-second function timeout, 50MB deployment size
- **Large Uploads**: Files >100MB may timeout; consider client-side chunking
- **Video Processing**: No transcoding/transformation (use external services if needed)
- **Terabox URLs**: Download URLs expire after some time (cached for 1 hour)

## Troubleshooting

### PowerShell Script Execution Error

If you see "execution of scripts is disabled", run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Terabox Credentials Invalid

Make sure you're logged into Terabox and extract fresh credentials. They may expire periodically.

### Upload Timeout

For large files, consider:
1. Compressing the video before upload
2. Using a smaller test file first
3. Implementing chunked uploads (future enhancement)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [terabox-upload-tool](https://github.com/Pahadi10/terabox-upload-tool) for Terabox integration
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for serverless hosting
