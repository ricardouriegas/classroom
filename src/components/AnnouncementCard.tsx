import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Image, FileText, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Updated interface to match the backend response structure
interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId?: string; // Make optional
  authorName?: string; // Make optional
  authorAvatar?: string;
  attachments?: Attachment[]; // Make optional with proper type
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  // Add default values and safeguards with optional chaining
  const { 
    title = "Untitled Announcement", 
    content = "", 
    authorName = "Unknown", 
    authorAvatar, 
    createdAt, 
    attachments = [] // Default to empty array if undefined
  } = announcement || {};
  
  const { apiBaseUrl } = useAuth();
  
  // Handle case where createdAt might be missing or invalid
  const formattedDate = createdAt ? 
    formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 
    'recently';
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0] || '')
      .join('')
      .toUpperCase();
  };
  
  // Format file size with safeguards
  const formatFileSize = (bytes: number): string => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon with type safety
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <File className="h-5 w-5 text-gray-500" />;
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle URL construction with checks
  const getFullFileUrl = (fileUrl: string | undefined): string => {
    if (!fileUrl) return '';
    
    // If the URL already is absolute, return as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // Make sure apiBaseUrl exists before trying to use it
    if (!apiBaseUrl) return fileUrl;
    
    // Combine base URL and file path safely
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const relativePath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${baseUrl}${relativePath}`;
  };

  // Improved file download with error handling
  const handleDownload = async (fileUrl: string | undefined, fileName: string | undefined, fileType: string | undefined) => {
    if (!fileUrl || !fileName) {
      console.error('Missing file information for download');
      return;
    }
    
    try {
      // Get the full URL of the file
      const fullUrl = getFullFileUrl(fileUrl);
      
      // For images and PDFs, open in new tab
      if (fileType?.startsWith('image/') || fileType === 'application/pdf') {
        window.open(fullUrl, '_blank');
        return;
      }
      
      console.log('Downloading file from:', fullUrl);
      
      // For other file types, handle download
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: fileType || 'application/octet-stream' });
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Failed to download: ${fileName}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="font-medium">{authorName}</div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 whitespace-pre-line mb-4">{content}</p>
        
        {/* Only render attachments section if there are attachments */}
        {attachments && attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos:</h4>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2">
                    {getFileIcon(attachment.fileType)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 ml-2"
                    onClick={() => handleDownload(attachment.fileUrl, attachment.fileName, attachment.fileType)}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Descargar</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
