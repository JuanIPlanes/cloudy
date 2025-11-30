const TeraboxUploader = require('terabox-upload-tool');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function testTeraboxIntegration() {
    console.log('🧪 Testing Terabox Integration...\n');

    // Check if credentials are set
    const credentials = {
        ndus: process.env.TERABOX_NDUS,
        appId: process.env.TERABOX_APP_ID,
        uploadId: process.env.TERABOX_UPLOAD_ID,
        jsToken: process.env.TERABOX_JS_TOKEN,
        browserId: process.env.TERABOX_BROWSER_ID,
    };

    const missing = Object.entries(credentials)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error('❌ Missing credentials:', missing.join(', '));
        console.error('\nPlease set these environment variables in your .env file.');
        console.error('See docs/TERABOX_CREDENTIALS.md for instructions.\n');
        process.exit(1);
    }

    console.log('✅ All credentials found\n');

    try {
        // Initialize uploader
        console.log('📦 Initializing Terabox uploader...');
        const uploader = new TeraboxUploader(credentials);
        console.log('✅ Uploader initialized\n');

        // Test: List files
        console.log('📋 Testing file list...');
        const directory = process.env.UPLOAD_DIRECTORY || '/videos';
        const fileList = await uploader.fetchFileList(directory);
        console.log(`✅ Found ${fileList.length} files in ${directory}\n`);

        if (fileList.length > 0) {
            console.log('📁 Sample files:');
            fileList.slice(0, 3).forEach((file) => {
                console.log(`  - ${file.server_filename} (${formatFileSize(file.size)})`);
            });
            console.log('');

            // Test: Get download URL for first video
            const videoFiles = fileList.filter((file) => {
                const ext = file.server_filename.toLowerCase().match(/\.[^.]+$/)?.[0];
                return ext && ['.mp4', '.mkv', '.avi', '.mov'].includes(ext);
            });

            if (videoFiles.length > 0) {
                console.log('🎬 Testing video download URL...');
                const testVideo = videoFiles[0];
                const downloadInfo = await uploader.downloadFile(testVideo.fs_id);

                if (downloadInfo && downloadInfo.dlink) {
                    console.log(`✅ Got download URL for: ${testVideo.server_filename}`);
                    console.log(`   URL: ${downloadInfo.dlink.substring(0, 50)}...\n`);
                } else {
                    console.log('⚠️  No download URL returned\n');
                }
            }
        }

        console.log('✅ All tests passed!\n');
        console.log('🚀 Your Terabox integration is working correctly.');
        console.log('   You can now run: npm run dev\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('\nPossible issues:');
        console.error('  1. Credentials may have expired - extract fresh ones');
        console.error('  2. Network connection issues');
        console.error('  3. Terabox API changes\n');
        process.exit(1);
    }
}

function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run tests
testTeraboxIntegration().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
