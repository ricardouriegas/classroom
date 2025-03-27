
import React, { useState, useEffect } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'expired';
  submissionDate?: string;
  grade?: number;
  feedback?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  materials: Material[];
  assignments: Assignment[];
}

interface ClassContentStudentProps {
  classId: string;
}

const ClassContentStudent: React.FC<ClassContentStudentProps> = ({ classId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [classId]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch topics
      const topicsResponse = await api.get(`/topics/class/${classId}`);
      const topicsData = topicsResponse.data;
      
      // Fetch assignments
      const assignmentsResponse = await api.get(`/assignments/class/${classId}`);
      const assignmentsData = assignmentsResponse.data;
      
      // Fetch materials (if endpoint exists)
      let materialsData: any[] = [];
      try {
        const materialsResponse = await api.get(`/materials/class/${classId}`);
        materialsData = materialsResponse.data;
      } catch (error) {
        console.warn('Materials endpoint not available or error fetching materials:', error);
      }
      
      // Group assignments and materials by topic
      const topicsWithContent = topicsData.map((topic: any) => {
        const topicAssignments = assignmentsData.filter((assignment: any) => 
          assignment.topicId === topic.id
        );
        
        const topicMaterials = materialsData.filter((material: any) => 
          material.topic_id === topic.id
        );
        
        return {
          ...topic,
          assignments: topicAssignments,
          materials: topicMaterials
        };
      });
      
      setTopics(topicsWithContent);
    } catch (error) {
      console.error('Error fetching class content:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el contenido de la clase. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
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

  const getStatusBadge = (status: string) => {
    if (status === 'submitted') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Entregada</Badge>;
    } else if (status === 'expired') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Vencida</Badge>;
    } else {
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
              {topic.description && (
                <p className="text-gray-600 mb-4">{topic.description}</p>
              )}
              
              {/* Materials Section */}
              {topic.materials && topic.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                    Materiales
                  </h4>
                  <div className="space-y-2">
                    {topic.materials.map((material) => (
                      <Card key={material.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="font-medium">{material.title}</h5>
                              {material.description && (
                                <p className="text-sm text-gray-600">{material.description}</p>
                              )}
                              <div className="text-xs text-gray-500">
                                Publicado: {format(new Date(material.created_at), 'PPP', { locale: es })}
                              </div>
                            </div>
                            <a 
                              href={material.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-4"
                            >
                              <Button size="sm" variant="outline">Ver Material</Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Assignments Section */}
              {topic.assignments && topic.assignments.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-md font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-green-500" />
                    Tareas
                  </h4>
                  <div className="space-y-2">
                    {topic.assignments.map((assignment) => (
                      <Card key={assignment.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <h5 className="font-medium">{assignment.title}</h5>
                                <div className="ml-2">
                                  {getStatusBadge(assignment.status)}
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                Fecha de entrega: {format(new Date(assignment.dueDate), 'PPP p', { locale: es })}
                              </div>
                              {assignment.grade !== undefined && (
                                <div className="flex items-center text-sm">
                                  <span className="font-medium mr-1">Calificación:</span> 
                                  <span className={`${assignment.grade >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                    {assignment.grade}/100
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 md:mt-0">
                              <Button 
                                size="sm"
                                className="w-full md:w-auto"
                                onClick={() => window.location.href = `/assignment/${assignment.id}`}
                              >
                                {assignment.status === 'submitted' 
                                  ? 'Ver Entrega' 
                                  : 'Ver Tarea'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {(!topic.materials || topic.materials.length === 0) && 
               (!topic.assignments || topic.assignments.length === 0) && (
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
