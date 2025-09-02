/**
 * Sanitizes a filename for safe storage by removing special characters and accents
 */
export const sanitizeFileName = (fileName: string): string => {
  // Get the file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex >= 0 ? fileName.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex >= 0 ? fileName.substring(0, lastDotIndex) : fileName;
  
  // Remove accents and diacritics using NFKD normalization
  const normalized = nameWithoutExt
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks
  
  // Replace any character that's not alphanumeric, dot, underscore, or hyphen with a hyphen
  const sanitized = normalized
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Limit the length to 120 characters (excluding extension)
  const maxLength = 120;
  const truncated = sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength).replace(/-+$/, '') 
    : sanitized;
  
  return `${truncated}${extension}`;
};

/**
 * Builds a safe video path for Supabase storage
 */
export const buildSafeVideoPath = (courseId: string, fileName: string): string => {
  const safeName = sanitizeFileName(fileName);
  return `${courseId}/${Date.now()}-${safeName}`;
};

/**
 * Creates an even more restrictive filename for fallback retry
 */
export const createRestrictiveFileName = (originalName: string): string => {
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex >= 0 ? originalName.substring(lastDotIndex) : '.video';
  
  // Create a very simple name with timestamp
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `video-${timestamp}-${randomSuffix}${extension}`;
};