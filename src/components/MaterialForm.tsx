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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Topic {
  id: string;
  name: string;
}

interface Material {
  id: string;
  title: string;
  description: string;
  topicId: string;
  topicName: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface MaterialFormProps {
  classId: string;
  topics: Topic[];
  onMaterialCreated: (material: Material) => void;
  onCancel: () => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ 
  classId, 
  topics,
  onMaterialCreated, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
  
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
        description: 'Por favor, ingresa un título para el material.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!topicId) {
      toast({
        title: 'Error',
        description: 'Por favor, selecciona un tema para el material.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('topic_id', topicId);
      formData.append('class_id', classId);
      
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });
      
      const intervalId = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);
      
      // Log the request details for debugging
      console.log('Sending material creation request:', {
        endpoint: '/materials',
        classId,
        topicId,
        title,
        files: selectedFiles.length
      });
      
      const response = await api.post('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      clearInterval(intervalId);
      setUploadProgress(100);
      
      console.log('Material created:', response.data);
      
      // Pass the created material back to the parent component
      onMaterialCreated(response.data);
    } catch (error) {
      console.error('Error creating material:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      toast({
        title: 'Error',
        description: 'No se pudo crear el material. Por favor, inténtalo de nuevo.',
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
        <Label htmlFor="title" className="text-sm font-medium text-gray-200">
          Título del material
        </Label>
        <Input
          id="title"
          placeholder="Título del material"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full bg-[#252538] border-[#4c4c6d] text-white placeholder:text-gray-500 focus:border-[#00ffc3] focus:ring-[#00ffc3]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-sm font-medium text-gray-200">
          Tema
        </Label>
        <Select
          value={topicId}
          onValueChange={setTopicId}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full bg-[#252538] border-[#4c4c6d] text-white">
            <SelectValue placeholder="Selecciona un tema" />
          </SelectTrigger>
          <SelectContent className="bg-[#2f2f42] text-white border-[#4c4c6d]">
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="block text-sm font-medium text-gray-200">
          Descripción (opcional)
        </Label>
        <Textarea
          id="description"
          placeholder="Describe este material de estudio..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] bg-[#252538] border-[#4c4c6d] text-white placeholder:text-gray-500 focus:border-[#00ffc3] focus:ring-[#00ffc3]"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label className="block text-sm font-medium text-gray-200">
          Archivos adjuntos
        </Label>
        
        {/* File drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center transition-colors ${
            dragActive ? 'border-[#00ffc3] bg-[#00ffc3]/10' : 'border-[#4c4c6d] hover:border-[#00ffc3]/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx"
            className="hidden"
            disabled={isSubmitting}
          />
          
          <FileUp className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-300 text-center">
            <span className="font-medium">
              Haz clic o arrastra archivos aquí
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            PDF, Word, PowerPoint, imágenes (máx. 5MB)
          </p>
        </div>
      </div>
      
      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Archivos seleccionados ({selectedFiles.length})
          </label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="border border-[#4c4c6d] bg-[#252538]">
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <File className="h-5 w-5 mr-2 text-[#00ffc3]" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-red-400"
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
          <label className="block text-sm font-medium text-gray-200">
            Subiendo material...
          </label>
          <Progress value={uploadProgress} className="h-2 bg-[#252538]" />
          <p className="text-xs text-gray-400 text-right">{uploadProgress}%</p>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#4c4c6d] text-white hover:bg-[#252538]"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#00ffc3] text-[#1E1E2F] hover:bg-[#00ffc3]/90"
        >
          {isSubmitting ? 'Subiendo...' : 'Publicar Material'}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
