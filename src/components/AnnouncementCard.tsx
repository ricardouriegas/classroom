import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Image, FileText, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Actualizada la interfaz para incluir los attachments explícitamente
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

export const transformAnnouncement = (data: any): Announcement => {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    authorId: data.author_id, // transformación de snake_case a camelCase
    authorName: data.author_name,
    authorAvatar: data.author_avatar,
    createdAt: new Date(data.created_at).toISOString(), // o data.created_at si ya viene formateado
    attachments: (data.attachments || []).map((att: any) => ({
      id: att.id,
      fileName: att.file_name,
      fileSize: att.file_size,
      fileType: att.file_type,
      fileUrl: att.file_url,
    }))
  };
};

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const { title, content, authorName, authorAvatar, createdAt, attachments = [] } = announcement;
  const { apiBaseUrl } = useAuth();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Safe date formatting with error handling
  const formattedDate = React.useMemo(() => {
    try {
      if (!createdAt) return 'Unknown date';
      // Handle both string and Date objects
      const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }, [createdAt]);
  
  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Función para obtener el icono adecuado según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Function for obtaining the URL complete of the file with safer handling
  const getFullFileUrl = (fileUrl: string): string => {
    if (!fileUrl) return '';
    
    // If the URL is already absolute, return it as is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // If API base URL is not available, return the relative path
    if (!apiBaseUrl) {
      console.warn('apiBaseUrl is not defined, returning relative path');
      return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    }
    
    // Combine API base URL with file path
    const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const relativePath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${baseUrl}${relativePath}`;
  };

  // Safer download function
  const handleDownload = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!fileUrl) {
      console.error('No file URL provided');
      return;
    }
    
    try {
      // Obtener la URL completa del archivo
      const fullUrl = getFullFileUrl(fileUrl);
      
      // Opción 1: Abrir el archivo en una nueva pestaña del navegador
      if (fileType.startsWith('image/') || fileType === 'application/pdf') {
        window.open(fullUrl, '_blank');
        return;
      }
      
      console.log('Descargando archivo desde:', fullUrl);
      
      // Opción 2: Para otros tipos de archivos, intentar descarga directa
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Incluir cookies para autenticación si es necesario
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      // Obtener el archivo como arrayBuffer en lugar de blob para mejor manejo binario
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: fileType || 'application/octet-stream' });
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      // Añadir el enlace al documento, hacer clic en él y luego eliminarlo
      document.body.appendChild(link);
      link.click();
      
      // Dar tiempo al navegador para iniciar la descarga
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert(`No se pudo descargar el archivo: ${fileName}. Detalles: ${error.message}`);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorAvatar} alt={authorName || 'Author'} />
          <AvatarFallback>{authorName ? getInitials(authorName) : 'UN'}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="font-medium">{authorName || 'Unknown author'}</div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 whitespace-pre-line mb-4">{content}</p>
        
        {/* Render attachments with better error handling */}
        {Array.isArray(attachments) && attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos:</h4>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                attachment && attachment.id ? (
                  <div 
                    key={attachment.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      {getFileIcon(attachment.fileType || 'unknown')}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {attachment.fileName || 'Unnamed file'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.fileSize || 0)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 ml-2"
                      onClick={() => handleDownload(
                        attachment.fileUrl || '', 
                        attachment.fileName || 'download', 
                        attachment.fileType || 'application/octet-stream'
                      )}
                      disabled={!attachment.fileUrl}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Descargar</span>
                    </Button>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
