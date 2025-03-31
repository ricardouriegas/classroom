import React, { useState, useEffect } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  created_at: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status?: 'pending' | 'submitted' | 'expired';
  submissionDate?: string;
  grade?: number;
  feedback?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  materials: Material[];
  assignments: Assignment[];
}

interface ClassContentStudentProps {
  classId: string;
}

const ClassContentStudent: React.FC<ClassContentStudentProps> = ({ classId }) => {
  const { currentUser, apiBaseUrl } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, [classId]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch topics
      const topicsResponse = await api.get(`/topics/class/${classId}`);
      const topicsData = topicsResponse.data || [];

      if (!Array.isArray(topicsData)) {
        console.error('Topics data is not an array:', topicsData);
        setError('Error al cargar los temas. El formato de datos no es válido.');
        setTopics([]);
        return;
      }

      // Inicializar cada tema con assignments y materials vacíos
      const topicsWithEmptyContent = topicsData.map((topic: any) => ({
        ...topic,
        assignments: [],
        materials: [],
      }));

      setTopics(topicsWithEmptyContent);

      // 2. Fetch assignments
      try {
        const [assignmentsResponse, materialsResponse] = await Promise.all([
          api.get(`/assignments/class/${classId}`),
          api.get(`/materials/class/${classId}`),
        ]);

        const assignmentsData = assignmentsResponse.data || [];
        const materialsData = materialsResponse.data || [];

        // Combinar la data
        const topicsWithContent = topicsWithEmptyContent.map((topic: Topic) => {
          const topicAssignments = Array.isArray(assignmentsData)
            ? assignmentsData.filter(
                (assignment: any) =>
                  assignment.topicId === topic.id || assignment.topic_id === topic.id
              )
            : [];

          const topicMaterials = Array.isArray(materialsData)
            ? materialsData.filter(
                (material: any) =>
                  material.topicId === topic.id || material.topic_id === topic.id
              )
            : [];

          return {
            ...topic,
            assignments: topicAssignments,
            materials: topicMaterials,
          };
        });

        setTopics(topicsWithContent);
      } catch (error) {
        console.warn('Error fetching materials or assignments:', error);
        // Aun si falla, mostramos los topics vacíos
      }
    } catch (error) {
      console.error('Error fetching class content:', error);
      setError('No se pudo cargar el contenido de la clase. Por favor, inténtelo de nuevo.');
      toast({
        title: 'Error',
        description: 'No se pudo cargar el contenido de la clase. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para concatenar la baseURL con la ruta
  const getFullFileUrl = (fileUrl?: string): string => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    const baseUrl = apiBaseUrl?.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl || '';
    const relativePath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${baseUrl}${relativePath}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Error al cargar el contenido</h3>
          <p className="text-gray-500 max-w-md">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => fetchTopics()}>
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No hay contenido disponible</h3>
          <p className="text-gray-500 max-w-md">
            El profesor aún no ha agregado contenido a esta clase. El contenido aparecerá aquí cuando esté disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Envolvemos la lógica para asignar badges de estado
  const getStatusBadge = (status: string = 'pending') => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Entregada</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Vencida</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {topics.map((topic) => (
          <AccordionItem key={topic.id} value={topic.id}>
            <AccordionTrigger className="text-lg font-medium py-4">
              {topic.name}
            </AccordionTrigger>

            <AccordionContent className="space-y-4 px-1">
              {/* Mostrar descripción del tema */}
              {topic.description && (
                <p className="text-gray-500 mb-4">{topic.description}</p>
              )}

              {/* TAREAS PRIMERO */}
              {topic.assignments && topic.assignments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-green-500" />
                    Tareas
                  </h4>
                  <div className="space-y-2">
                    {topic.assignments.map((assignment) => (
                      <Card key={assignment.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            {/* Botón al principio */}
                            <div className="mb-3 md:mb-0 md:order-2">
                              <Button
                                size="sm"
                                className="w-full md:w-auto"
                                onClick={() => (window.location.href = `/assignment/${assignment.id}`)}
                              >
                                {assignment.status === 'submitted' ? 'Ver Entrega' : 'Ver Tarea'}
                              </Button>
                            </div>

                            {/* Info de la tarea */}
                            <div className="space-y-2 md:order-1">
                              <div className="flex items-start">
                                <h5 className="font-medium">{assignment.title}</h5>
                                <div className="ml-2">{getStatusBadge(assignment.status)}</div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                Entrega: {format(new Date(assignment.dueDate), 'PPP p', { locale: es })}
                              </div>
                              {assignment.grade !== undefined && (
                                <div className="text-sm">
                                  <span className="font-medium mr-1">Calificación:</span>
                                  <span className={assignment.grade >= 70 ? 'text-green-600' : 'text-red-600'}>
                                    {assignment.grade}/100
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* MATERIALES DESPUÉS */}
              {topic.materials && topic.materials.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-md font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    Materiales
                  </h4>
                  <div className="space-y-2">
                    {topic.materials.map((material) => (
                      <Card key={material.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h5 className="font-medium">{material.title}</h5>
                              {material.description && (
                                <p className="text-sm text-gray-600">{material.description}</p>
                              )}
                              <div className="text-xs text-gray-500">
                                Publicado: {format(new Date(material.created_at), 'PPP', { locale: es })}
                              </div>
                            </div>

                            {/* Botón para ver material */}
                            {material.attachments?.length > 0 && (
                              <div className="mt-3 md:mt-0 flex gap-2">
                                {material.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={getFullFileUrl(attachment.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button size="sm" variant="outline">
                                      Ver
                                    </Button>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Sin tareas ni materiales */}
              {(!topic.assignments?.length && !topic.materials?.length) && (
                <div className="text-center py-4 text-gray-500">
                  No hay contenido disponible para este tema aún.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ClassContentStudent;
