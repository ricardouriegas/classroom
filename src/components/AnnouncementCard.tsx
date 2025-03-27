import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Image, FileText, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Actualizada la interfaz para incluir los attachments explícitamente
interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
  createdAt: string;
}

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
  
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
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

  // Función para obtener la URL completa del archivo
  const getFullFileUrl = (fileUrl: string): string => {
    // Si la URL ya es absoluta (comienza con http:// o https://), devolverla como está
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // Si es una ruta relativa, combinarla con la URL base de la API
    // Asegurar que no haya dobles barras
    const baseUrl = apiBaseUrl?.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    const relativePath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${baseUrl}${relativePath}`;
  };

  // Función mejorada para manejar la descarga de archivos
  const handleDownload = async (fileUrl: string, fileName: string, fileType: string) => {
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
        
        {/* Renderizar los archivos adjuntos */}
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
