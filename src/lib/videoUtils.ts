export const canBrowserPlayVideo = (videoUrl: string): boolean => {
  const video = document.createElement('video');
  
  // Extract file extension from URL
  const extension = videoUrl.split('.').pop()?.toLowerCase();
  
  // Check if browser can play common video formats
  const formatSupport = {
    mp4: video.canPlayType('video/mp4') !== '',
    webm: video.canPlayType('video/webm') !== '',
    ogg: video.canPlayType('video/ogg') !== '',
    mov: video.canPlayType('video/quicktime') !== '',
    avi: false, // Generally not supported in browsers
    mkv: false, // Generally not supported in browsers
    wmv: false, // Generally not supported in browsers
    flv: false, // Generally not supported in browsers
  };
  
  // Return true for supported formats, false for unsupported
  return formatSupport[extension as keyof typeof formatSupport] ?? false;
};

export const getVideoFileName = (videoUrl: string): string => {
  return videoUrl.split('/').pop() || 'video';
};

export const isVideoFile = (file: File): boolean => {
  // Accept any file that starts with "video/" or has video-like extensions
  return file.type.startsWith('video/') || 
         /\.(mp4|webm|ogg|avi|mov|mkv|wmv|flv|m4v|3gp|asf)$/i.test(file.name);
};