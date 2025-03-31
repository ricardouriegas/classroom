import React, { useState, useEffect } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Layers, BookOpen, FileUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Topic {
  id: string;
  name: string;
  description: string;
  order_index: number;
  materials_count: number;
  assignments_count: number;
}

interface TopicsSectionProps {
  classId: string;
}

const TopicsSection: React.FC<TopicsSectionProps> = ({ classId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeacher = currentUser?.role === 'teacher';

  useEffect(() => {
    fetchTopics();
  }, [classId]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/topics/class/${classId}`);
      setTopics(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los temas. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!topicName.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre del tema es obligatorio.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await api.post('/topics', {
        class_id: classId,
        name: topicName,
        description: topicDescription,
      });
      // Agregar el nuevo tema al listado
      setTopics([...topics, response.data]);
      // Limpiar y cerrar
      setTopicName('');
      setTopicDescription('');
      setDialogOpen(false);
      toast({
        title: 'Éxito',
        description: 'El tema se ha creado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el tema. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewAssignment = (topicId: string) => {
    window.location.href = `/class/${classId}/create-assignment?topicId=${topicId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ffc3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la sección con estilos futuristas */}
      <div className="flex justify-start items-center bg-[#1e1e2f]/90 p-4 rounded-md border border-[#4c4c6d]">
        <Layers className="h-6 w-6 text-[#00ffc3] mr-2" />
        <h2 className="text-2xl font-bold tracking-widest text-white flex-1">
          Temas del Curso
        </h2>
        {isTeacher && (
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-1 bg-[#00ffc3] text-black hover:bg-[#00ffc3]/90">
            <Plus className="h-4 w-4" />
            Crear Tema
          </Button>
        )}
      </div>

      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-[#1e1e2f]/80 border border-gray-700 text-gray-200 hover:shadow-xl transition-shadow"
            >
              <CardHeader className="pb-2 border-b border-[#4c4c6d]">
                {/* Nombre del tema y sus stats */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[#00ffc3]">{topic.name}</CardTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-blue-400" />
                      <span>{topic.materials_count} materiales</span>
                    </div>
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-1 text-green-400" />
                      <span>{topic.assignments_count} tareas</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Descripción del tema */}
                {topic.description && (
                  <p className="text-sm text-gray-400 mb-4">{topic.description}</p>
                )}
                {/* Botones (Agregar Material / Agregar Tarea) */}
                {isTeacher && (
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1 border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10">
                      <BookOpen className="h-4 w-4" />
                      Agregar Material
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10"
                      onClick={() => handleNewAssignment(topic.id)}
                    >
                      <FileUp className="h-4 w-4" />
                      Agregar Tarea
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1e1e2f]/80 border border-gray-700 text-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-200 mb-2">No hay temas creados</h3>
            <p className="text-gray-400 max-w-md mb-6">
              {isTeacher
                ? 'Aún no has creado ningún tema para esta clase. ¡Empieza a organizar tu curso!'
                : 'Aún no hay temas creados para esta clase.'}
            </p>
            {isTeacher && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/80 transition-colors"
              >
                Crear Primer Tema
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo para Crear Tema */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1e1e2f]/90 backdrop-blur-md text-gray-200 border border-[#4c4c6d]">
          <DialogHeader>
            <DialogTitle className="text-[#00ffc3]">Crear Nuevo Tema</DialogTitle>
            <DialogDescription className="text-gray-400">
              Añade un nuevo tema para organizar el material y las tareas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">Nombre del tema</Label>
              <Input
                id="name"
                placeholder="Ej: Unidad 1 - Introducción"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-200">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el contenido de este tema..."
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                rows={4}
                className="bg-[#2f2f42] border border-[#4c4c6d] focus:border-[#00ffc3] focus:ring-[#00ffc3]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTopic}
              disabled={isSubmitting}
              className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/80"
            >
              {isSubmitting ? 'Creando...' : 'Crear Tema'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicsSection;
