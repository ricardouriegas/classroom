import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { File, FileText, Calendar } from 'lucide-react';

// Define the announcement type
interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

interface RelatedItem {
  type: 'assignment' | 'material';
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  topicName: string;
  attachments: Attachment[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  attachments: Attachment[];
  relatedItem?: RelatedItem;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const navigate = useNavigate();
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <File className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return "Fecha desconocida";
    }
  };

  const getRelatedItemBadge = () => {
    if (!announcement.relatedItem) return null;
    
    if (announcement.relatedItem.type === 'assignment') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Tarea</Badge>;
    } else {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Material</Badge>;
    }
  };

  // Helper function to ensure file URLs are properly formatted
  const getFullFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) {
      return fileUrl;
    }
    // Add the base API URL to relative paths
    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return fileUrl.startsWith('/') 
      ? `${baseApiUrl}${fileUrl}`
      : `${baseApiUrl}/${fileUrl}`;
  };

  return (
    <Card className="mb-4 bg-[#1E1E2F]/80 border border-[#4c4c6d] text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <Avatar className="h-10 w-10">
              {announcement.authorAvatar ? (
                <AvatarImage src={announcement.authorAvatar} alt={announcement.authorName} />
              ) : (
                <AvatarFallback>{announcement.authorName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg text-white">{announcement.title}</CardTitle>
              <p className="text-sm text-gray-400">
                {announcement.authorName} • {formatCreatedDate(announcement.createdAt)}
              </p>
            </div>
          </div>
          {getRelatedItemBadge()}
        </div>
      </CardHeader>
      <CardContent className="py-3">
        <div className="whitespace-pre-wrap mb-4 text-gray-300">{announcement.content}</div>
        
        {/* Related item (assignment or material) */}
        {announcement.relatedItem && (
          <div className="border border-[#4c4c6d] rounded-md p-4 mt-4 bg-[#252538]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-[#00ffc3]">
                {announcement.relatedItem.type === 'assignment' ? 'Tarea:' : 'Material:'}
                {' '}{announcement.relatedItem.title}
              </h3>
              <Badge variant="outline" className="border-[#4c4c6d] bg-[#1E1E2F] text-gray-300">{announcement.relatedItem.topicName}</Badge>
            </div>
            
            {announcement.relatedItem.description && (
              <p className="text-sm text-gray-300 mb-3">{announcement.relatedItem.description}</p>
            )}
            
            {announcement.relatedItem.type === 'assignment' && announcement.relatedItem.dueDate && (
              <div className="flex items-center text-sm text-gray-300 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Fecha de entrega: {new Date(announcement.relatedItem.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {announcement.relatedItem.attachments && announcement.relatedItem.attachments.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-200 mb-2">Archivos adjuntos:</h4>
                <div className="space-y-2">
                  {announcement.relatedItem.attachments.map((attachment) => (
                    <a 
                      key={attachment.id}
                      href={getFullFileUrl(attachment.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 border border-[#4c4c6d] rounded bg-[#1E1E2F] hover:bg-[#2a2a3d] transition-colors"
                    >
                      {getFileIcon(attachment.fileType)}
                      <span className="ml-2 text-sm text-gray-300">{attachment.fileName}</span>
                      <span className="ml-auto text-xs text-gray-400">{formatFileSize(attachment.fileSize)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Regular announcement attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-200 mb-2">Archivos adjuntos:</h4>
            <div className="space-y-2">
              {announcement.attachments.map((attachment) => (
                <a 
                  key={attachment.id}
                  href={getFullFileUrl(attachment.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 border border-[#4c4c6d] rounded bg-[#252538] hover:bg-[#2a2a3d] transition-colors"
                >
                  {getFileIcon(attachment.fileType)}
                  <span className="ml-2 text-sm text-gray-300">{attachment.fileName}</span>
                  <span className="ml-auto text-xs text-gray-400">{formatFileSize(attachment.fileSize)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
