/**
 * Gets the file extension from a URL or filename
 */
export const getFileExtension = (url: string): string => {
  return url.split('.').pop()?.toLowerCase() || '';
};

/**
 * Maps file extensions to MIME types for video elements
 */
export const getMimeFromExtension = (url: string): string => {
  const extension = getFileExtension(url);
  
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    ogv: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    m4v: 'video/mp4',
    '3gp': 'video/3gpp',
  };
  
  return mimeTypes[extension] || 'video/mp4'; // Default to mp4
};

/**
 * @deprecated Use direct video rendering with error handling instead
 * This function is kept for backward compatibility but should not be used
 */
export const canBrowserPlayVideo = (videoUrl: string): boolean => {
  console.warn('canBrowserPlayVideo is deprecated. Use direct video rendering with error handling instead.');
  return true; // Always return true, let the browser handle it
};

export const getVideoFileName = (videoUrl: string): string => {
  return videoUrl.split('/').pop() || 'video';
};

export const isVideoFile = (file: File): boolean => {
  // Accept any file that starts with "video/" or has video-like extensions
  return file.type.startsWith('video/') || 
         /\.(mp4|webm|ogg|avi|mov|mkv|wmv|flv|m4v|3gp|asf)$/i.test(file.name);
};