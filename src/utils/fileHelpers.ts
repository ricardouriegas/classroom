/**
 * Ensures a file URL is a complete URL by adding the base API URL if necessary
 */
export const getFullFileUrl = (fileUrl: string): string => {
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    
    // Get the base API URL from environment variables
    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Add the base URL to relative paths
    return fileUrl.startsWith('/') 
      ? `${baseApiUrl}${fileUrl}`
      : `${baseApiUrl}/${fileUrl}`;
  };
  
  /**
   * Format file size into a human-readable format
   */
  export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  