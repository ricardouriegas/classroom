
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, FileText, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Topic {
  id: string;
  name: string;
}

const createAssignmentSchema = z.object({
  title: z.string().min(1, { message: 'El título es obligatorio' }),
  description: z.string().min(1, { message: 'Las instrucciones son obligatorias' }),
  topicId: z.string().min(1, { message: 'Debes seleccionar un tema' }),
  dueDate: z.date({
    required_error: 'La fecha de entrega es obligatoria',
  }).refine(date => date > new Date(), {
    message: 'La fecha de entrega debe ser posterior a la fecha actual',
  }),
  dueTime: z.string().min(1, { message: 'La hora de entrega es obligatoria' }),
});

type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;

const CreateAssignment = () => {
  const { id: classId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get topicId from query parameters
  const searchParams = new URLSearchParams(location.search);
  const preselectedTopicId = searchParams.get('topicId');

  // Form setup
  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      topicId: preselectedTopicId || '',
      dueDate: undefined,
      dueTime: '',
    },
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    const fetchTopics = async () => {
      if (!classId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/topics/class/${classId}`);
        setTopics(response.data);
        
        // If we have a preselected topic and it's in the list, select it
        if (preselectedTopicId && response.data.find((t: Topic) => t.id === preselectedTopicId)) {
          form.setValue('topicId', preselectedTopicId);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los temas. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [classId, currentUser, navigate, toast, preselectedTopicId, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validate file types (only PDF and images)
      const validFiles = newFiles.filter(file => 
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      );
      
      if (validFiles.length !== newFiles.length) {
        toast({
          title: 'Archivo no válido',
          description: 'Solo se permiten archivos PDF e imágenes.',
          variant: 'destructive',
        });
      }
      
      setFiles([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const onSubmit = async (data: CreateAssignmentFormValues) => {
    if (!classId) return;
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const [hours, minutes] = data.dueTime.split(':');
      const dueDate = new Date(data.dueDate);
      dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('class_id', classId);
      formData.append('topic_id', data.topicId);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('due_date', dueDate.toISOString());
      
      // Add files to form data
      files.forEach(file => {
        formData.append('attachments', file);
      });
      
      // Submit form
      await api.post('/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: 'Tarea creada',
        description: 'La tarea se ha creado correctamente.',
      });
      
      // Navigate back to class
      navigate(`/class/${classId}`);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la tarea. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/class/${classId}`)}
          className="mb-6"
        >
          ← Volver a la clase
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la tarea*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Trabajo Práctico #1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrucciones*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe detalladamente qué deben hacer los alumnos..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tema*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tema" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de entrega*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de entrega*</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="time" 
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Archivos adjuntos (opcional)</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileText className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, JPG, PNG (máx. 5MB por archivo)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                            multiple
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Archivos seleccionados:</Label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-blue-500" />
                              <span className="text-sm truncate max-w-[200px] md:max-w-sm">
                                {file.name}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/class/${classId}`)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Tarea'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAssignment;
