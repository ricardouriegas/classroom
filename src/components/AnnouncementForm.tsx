
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUp, X, File, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Define announcement interface
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

interface AnnouncementFormProps {
  classId?: string;
  onAnnouncementCreated: (announcement: Announcement) => void;
  onCancel: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ 
  classId, 
  onAnnouncementCreated, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id: routeClassId } = useParams<{ id: string }>();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (tipo no permitido)`);
      } else if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (excede 5MB)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: 'Archivos no válidos',
        description: invalidFiles.join(', '),
        variant: 'destructive',
      });
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un título para el anuncio.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa el contenido del anuncio.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      // Use the class ID from props or from URL params
      const effectiveClassId = classId || routeClassId;
      formData.append('class_id', effectiveClassId as string);
      
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });
      
      const intervalId = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      const response = await api.post('/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      clearInterval(intervalId);
      setUploadProgress(100);
      
      // Pass the created announcement back to the parent component
      onAnnouncementCreated(response.data);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el anuncio. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Título
        </Label>
        <Input
          id="title"
          placeholder="Título del anuncio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Contenido
        </Label>
        <Textarea
          id="content"
          placeholder="Escribe aquí el contenido del anuncio..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-gray-700">
          Archivos adjuntos (opcional)
        </Label>
        
        {/* File drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            className="hidden"
            disabled={isSubmitting}
          />
          
          <FileUp className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium">
              Haz clic o arrastra archivos aquí
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            PDF, JPG, PNG, GIF (máx. 5MB)
          </p>
        </div>
      </div>
      
      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Archivos seleccionados ({selectedFiles.length})
          </label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <File className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload progress */}
      {isSubmitting && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Publicando anuncio...
          </label>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Publicar Anuncio'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
