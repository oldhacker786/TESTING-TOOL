export default {
  async fetch(request) {
    const url = new URL(request.url);
    const youtubeUrl = url.searchParams.get('url');
    const videoId = url.searchParams.get('id');
    
    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Extract video ID from URL or use provided ID
    let finalVideoId = videoId;
    if (!finalVideoId && youtubeUrl) {
      finalVideoId = extractVideoId(youtubeUrl);
    }

    if (!finalVideoId) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'YouTube Video ID or URL is required',
          examples: [
            '?url=https://www.youtube.com/watch?v=VIDEO_ID',
            '?id=VIDEO_ID'
          ],
          channel: '@old_studio786'
        }, null, 2),
        { status: 400, headers }
      );
    }

    // Validate video ID format
    if (!isValidVideoId(finalVideoId)) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Invalid YouTube Video ID format',
          channel: '@old_studio786'
        }, null, 2),
        { status: 400, headers }
      );
    }

    try {
      // Get all available thumbnails
      const thumbnails = getAllThumbnails(finalVideoId);
      
      // Try to verify if thumbnail exists
      const thumbnailExists = await verifyThumbnailExists(thumbnails.hd);
      
      if (!thumbnailExists) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Video not found or thumbnails not available',
            videoId: finalVideoId,
            channel: '@old_studio786'
          }, null, 2),
          { status: 404, headers }
        );
      }

      return new Response(
        JSON.stringify({
          status: 'success',
          videoId: finalVideoId,
          thumbnails: thumbnails,
          download_links: getDownloadLinks(finalVideoId),
          channel: '@old_studio786'
        }, null, 2),
        { headers }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Failed to fetch thumbnails',
          videoId: finalVideoId,
          channel: '@old_studio786'
        }, null, 2),
        { status: 500, headers }
      );
    }
  }
};

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/,
    /youtube\.com\/embed\/([^&?#]+)/,
    /youtube\.com\/v\/([^&?#]+)/,
    /youtube\.com\/shorts\/([^&?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function isValidVideoId(videoId) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

function getAllThumbnails(videoId) {
  return {
    // High Quality Thumbnails
    maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    hd: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    sd: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    
    // Medium Quality
    medium: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    
    // Standard Quality
    standard: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    
    // Default Quality
    default: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
    
    // Small Quality
    small: `https://i.ytimg.com/vi/${videoId}/1.jpg`,
    
    // Thumbnail for Start (used in playlists)
    start: `https://i.ytimg.com/vi/${videoId}/0.jpg`,
    
    // Middle thumbnail
    middle: `https://i.ytimg.com/vi/${videoId}/2.jpg`,
    
    // End thumbnail
    end: `https://i.ytimg.com/vi/${videoId}/3.jpg`,
    
    // WebP format (modern)
    webp: `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
    
    // Different sizes
    '120x90': `https://i.ytimg.com/vi/${videoId}/1.jpg`,
    '120x60': `https://i.ytimg.com/vi/${videoId}/2.jpg`,
    '120x50': `https://i.ytimg.com/vi/${videoId}/3.jpg`
  };
}

function getDownloadLinks(videoId) {
  const baseUrl = `https://i.ytimg.com/vi/${videoId}`;
  
  return {
    maxres: `${baseUrl}/maxresdefault.jpg`,
    hd: `${baseUrl}/hqdefault.jpg`,
    sd: `${baseUrl}/sddefault.jpg`,
    medium: `${baseUrl}/mqdefault.jpg`,
    default: `${baseUrl}/default.jpg`
  };
}

async function verifyThumbnailExists(thumbnailUrl) {
  try {
    const response = await fetch(thumbnailUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return response.status === 200;
  } catch (err) {
    return false;
  }
}