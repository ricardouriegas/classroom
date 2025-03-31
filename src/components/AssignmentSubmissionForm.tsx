import React, { useState, useRef } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, X, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AssignmentSubmissionFormProps {
  assignmentId: string;
  existingFiles?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
  existingComment?: string;
  onSubmissionComplete: () => void;
  onCancel: () => void;
}

const AssignmentSubmissionForm: React.FC<AssignmentSubmissionFormProps> = ({
  assignmentId,
  existingFiles = [],
  existingComment = '',
  onSubmissionComplete,
  onCancel,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [comment, setComment] = useState(existingComment);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Ajusta si deseas cambiar la capacidad máxima y tipos permitidos
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

    if (selectedFiles.length === 0 && !existingFiles.length) {
      toast({
        title: 'Error',
        description: 'Debes adjuntar al menos un archivo a tu entrega.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);

      const formData = new FormData();
      formData.append('comment', comment || '');

      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulación de progreso con un intervalo
      const intervalId = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 300);

      // Llamada al backend
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(intervalId);
      setUploadProgress(100);

      toast({
        title: 'Entrega exitosa',
        description: 'Tu tarea ha sido entregada correctamente.',
      });

      setTimeout(() => {
        onSubmissionComplete();
      }, 1000);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo entregar la tarea. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
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
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-200">
      {/* Comentarios */}
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-semibold text-[#00ffc3]">
          Comentarios (opcional)
        </label>
        <Textarea
          id="comment"
          placeholder="Agrega un comentario sobre tu entrega..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px] bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3]"
          disabled={isSubmitting}
        />
      </div>

      {/* Zona para subir archivos */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-[#00ffc3]">
          Archivos adjuntos
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer flex flex-col items-center justify-center transition-colors ${
            dragActive
              ? 'border-[#00ffc3] bg-[#00ffc3]/10'
              : 'border-[#4c4c6d] hover:border-[#00ffc3]/50'
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
          <p className="text-sm text-gray-400 text-center">
            <span className="font-medium">Haz clic</span> o <span className="font-medium">arrastra</span> archivos aquí
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            PDF, JPG, PNG, GIF (máx. 5MB)
          </p>
        </div>
      </div>

      {/* Archivos previamente existentes */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#00ffc3]">
            Archivos existentes
          </label>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <Card key={file.id} className="border border-[#4c4c6d] bg-[#1E1E2F]/70">
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs flex items-center text-amber-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Estos archivos serán reemplazados por los nuevos que subas
          </p>
        </div>
      )}

      {/* Archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#00ffc3]">
            Archivos seleccionados ({selectedFiles.length})
          </label>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="border border-[#4c4c6d] bg-[#1E1E2F]/70">
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Barra de progreso de subida */}
      {isSubmitting && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#00ffc3]">
            Subiendo archivos...
          </label>
          <Progress value={uploadProgress} className="h-2 bg-[#4c4c6d]" />
          <p className="text-xs text-gray-400 text-right">{uploadProgress}%</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/90 transition-all"
        >
          {isSubmitting ? 'Enviando...' : 'Entregar tarea'}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentSubmissionForm;
