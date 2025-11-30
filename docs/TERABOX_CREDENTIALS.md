# How to Extract Terabox Credentials

This guide will help you extract the required credentials from your Terabox session.

## Prerequisites

- A Terabox account (sign up at [terabox.com](https://www.terabox.com))
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Steps

### 1. Log into Terabox

1. Open your browser and go to [https://www.terabox.com](https://www.terabox.com)
2. Log in with your credentials
3. Make sure you're on the main file management page

### 2. Open Browser DevTools

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari**: Enable Developer menu first (Safari → Preferences → Advanced → Show Develop menu), then press `Cmd+Option+I`

### 3. Go to the Network Tab

1. Click on the **Network** tab in DevTools
2. Make sure recording is enabled (red circle button should be active)
3. Filter by **XHR** or **Fetch** requests

### 4. Trigger a Request

1. In Terabox, navigate to any folder or refresh the page
2. Look for requests to `api.terabox.com` or similar domains in the Network tab
3. Click on one of these requests

### 5. Extract Credentials from Cookies

1. In the request details, find the **Headers** section
2. Scroll down to **Request Headers**
3. Look for the **Cookie** header
4. Extract the following values from the cookie string:

   - **ndus**: Look for `ndus=XXXXX;` in the cookie string
   - **browserId**: Look for `browserid=XXXXX;` or similar

### 6. Extract Credentials from Request Payload

1. Still in the Network tab, look for a request to an upload or file operation endpoint
2. Check the **Payload** or **Request** tab
3. Look for these parameters:

   - **appId**: Usually a numeric value
   - **uploadId**: A unique identifier for uploads
   - **jsToken**: A token string

### Alternative Method: Using Console

You can also extract some values using the browser console:

1. Open the **Console** tab in DevTools
2. Run the following commands:

```javascript
// Get cookies
document.cookie.split(';').forEach(c => console.log(c.trim()));

// Look for ndus and browserId in the output
```

### 7. Copy Values to .env File

Once you have all the values, update your `.env` file:

```env
TERABOX_NDUS=your_extracted_ndus_value
TERABOX_APP_ID=your_extracted_app_id
TERABOX_UPLOAD_ID=your_extracted_upload_id
TERABOX_JS_TOKEN=your_extracted_js_token
TERABOX_BROWSER_ID=your_extracted_browser_id
```

## Important Notes

⚠️ **Security Warning**: These credentials are sensitive! Never share them publicly or commit them to version control.

⚠️ **Expiration**: Terabox credentials may expire after some time. If you encounter authentication errors, extract fresh credentials.

⚠️ **Session-Based**: These credentials are tied to your browser session. Logging out of Terabox may invalidate them.

## Troubleshooting

### Can't Find Specific Values

If you can't find all the values:

1. Try uploading a small file in Terabox
2. Monitor the Network tab during the upload
3. Look at the request headers and payload for upload-related endpoints

### Values Not Working

1. Make sure you're logged into Terabox
2. Extract fresh credentials
3. Check that you copied the entire value (no truncation)
4. Ensure there are no extra spaces or quotes

### Still Having Issues?

1. Clear your browser cache and cookies
2. Log out and log back into Terabox
3. Try a different browser
4. Check the [terabox-upload-tool](https://github.com/Pahadi10/terabox-upload-tool) repository for updates

## Example Screenshot Locations

When looking in DevTools:

```
DevTools
├── Network Tab
│   ├── XHR/Fetch filter
│   ├── Request to api.terabox.com
│   │   ├── Headers
│   │   │   ├── Request Headers
│   │   │   │   └── Cookie: ndus=...; browserid=...
│   │   └── Payload
│   │       ├── appId
│   │       ├── uploadId
│   │       └── jsToken
```

## Need Help?

If you're still having trouble extracting credentials, please:

1. Check the [terabox-upload-tool documentation](https://github.com/Pahadi10/terabox-upload-tool)
2. Open an issue on the repository
3. Make sure you're using the latest version of the library
