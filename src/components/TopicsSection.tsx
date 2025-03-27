
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

      // Add the new topic to the list
      setTopics([...topics, response.data]);

      // Reset form and close dialog
      setTopicName('');
      setTopicDescription('');
      setDialogOpen(false);

      toast({
        title: 'Éxito',
        description: 'El tema se ha creado correctamente.',
      });
    } catch (error) {
      console.error('Error creating topic:', error);
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
    // Navigate to create assignment page with topic ID
    window.location.href = `/class/${classId}/create-assignment?topicId=${topicId}`;
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Temas del Curso</h2>
        {isTeacher && (
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Crear Tema
          </Button>
        )}
      </div>

      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {topic.description && (
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{topic.materials_count} materiales</span>
                  </div>
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-1 text-green-500" />
                    <span>{topic.assignments_count} tareas</span>
                  </div>
                </div>
                {isTeacher && (
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Agregar Material
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay temas creados</h3>
            <p className="text-gray-500 max-w-md mb-6">
              {isTeacher 
                ? "Aún no has creado ningún tema para esta clase. Los temas te ayudan a organizar los materiales y tareas del curso."
                : "Aún no hay temas creados para esta clase."}
            </p>
            {isTeacher && (
              <Button onClick={() => setDialogOpen(true)}>
                Crear Primer Tema
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Topic Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tema</DialogTitle>
            <DialogDescription>
              Agrega un nuevo tema para organizar los materiales y tareas de la clase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del tema</Label>
              <Input
                id="name"
                placeholder="Ejemplo: Unidad 1 - Introducción"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el contenido de este tema..."
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTopic} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Tema'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicsSection;
