
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Layers, Plus, FileText, ClipboardList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Topic {
  id: string;
  name: string;
  description: string;
  class_id: string;
  order_index: number;
  created_at: string;
  materials_count: number;
  assignments_count: number;
}

const topicFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre del tema es obligatorio" }),
  description: z.string().optional(),
});

const TopicsSection = ({ classId }: { classId: string }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof topicFormSchema>>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const isTeacher = currentUser?.role === 'teacher';

  useEffect(() => {
    const fetchTopics = async () => {
      if (!classId) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/topics/class/${classId}`);
        setTopics(response.data);
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
  }, [classId, toast]);

  const handleCreateTopic = async (values: z.infer<typeof topicFormSchema>) => {
    try {
      const response = await api.post('/topics', {
        class_id: classId,
        name: values.name,
        description: values.description || '',
      });

      setTopics([...topics, response.data]);
      
      toast({
        title: 'Éxito',
        description: 'El tema se ha creado correctamente.',
      });
      
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el tema. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Crear Nuevo Tema
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Tema</DialogTitle>
                <DialogDescription>
                  Los temas te ayudan a organizar el material y las tareas de tu clase.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateTopic)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Tema</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Introducción a la Programación" {...field} />
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
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe de qué trata este tema"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Tema</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {topics.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {topics.map((topic) => (
            <AccordionItem key={topic.id} value={topic.id} className="border rounded-lg p-1">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center text-left">
                  <Layers className="mr-2 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-medium">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="flex gap-4 text-sm text-muted-foreground mb-3 md:mb-0">
                    <div className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      <span>{topic.materials_count} Materiales</span>
                    </div>
                    <div className="flex items-center">
                      <ClipboardList className="mr-1 h-4 w-4" />
                      <span>{topic.assignments_count} Tareas</span>
                    </div>
                  </div>
                  
                  {isTeacher && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-1 h-4 w-4" />
                        Agregar Material
                      </Button>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="mr-1 h-4 w-4" />
                        Agregar Tarea
                      </Button>
                    </div>
                  )}
                </div>

                {topic.materials_count === 0 && topic.assignments_count === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Este tema aún no tiene materiales ni tareas.</p>
                    {isTeacher && (
                      <p className="mt-1 text-sm">
                        Utiliza los botones de arriba para comenzar a agregar contenido.
                      </p>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay temas creados</h3>
            <p className="text-gray-500 max-w-md">
              {isTeacher 
                ? 'No has creado ningún tema para esta clase. Los temas te ayudan a organizar el contenido del curso.'
                : 'Esta clase aún no tiene temas creados.'}
            </p>
            {isTeacher && (
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="mt-4"
              >
                Crear Primer Tema
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicsSection;
