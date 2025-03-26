
import React, { useState, useEffect } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  File
} from 'lucide-react';
import AssignmentSubmissionForm from './AssignmentSubmissionForm';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'expired' | 'graded';
  topicId: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
  submissionDate?: string;
  grade?: number;
  feedback?: string;
  submissionFiles?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface Material {
  id: string;
  title: string;
  description: string;
  topicId: string;
  createdAt: string;
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
  description: string;
  order_index: number;
  materials: Material[];
  assignments: Assignment[];
}

interface ClassContentStudentProps {
  classId: string;
}

const ClassContentStudent: React.FC<ClassContentStudentProps> = ({ classId }) => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTopics();
  }, [classId]);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch topics
      const topicsResponse = await api.get(`/topics/class/${classId}`);
      
      // Fetch assignments
      const assignmentsResponse = await api.get(`/assignments/class/${classId}`);
      
      // Fetch materials
      const materialsResponse = await api.get(`/materials/class/${classId}`);
      
      // Group assignments and materials by topic
      const topicsWithContent = topicsResponse.data.map((topic: any) => {
        return {
          ...topic,
          assignments: assignmentsResponse.data.filter((assignment: any) => assignment.topicId === topic.id),
          materials: materialsResponse.data.filter((material: any) => material.topicId === topic.id)
        };
      });
      
      setTopics(topicsWithContent);
      
      // Auto-expand the first topic if it has content
      if (topicsWithContent.length > 0) {
        const firstTopicWithContent = topicsWithContent.find(
          (t: Topic) => t.assignments.length > 0 || t.materials.length > 0
        );
        if (firstTopicWithContent) {
          setExpandedTopic(firstTopicWithContent.id);
        }
      }
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

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionForm(true);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleSubmissionComplete = () => {
    setShowSubmissionForm(false);
    setSelectedAssignment(null);
    fetchTopics(); // Refresh to get updated status
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Pendiente</Badge>;
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Entregada</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Vencida</Badge>;
      case 'graded':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Calificada</Badge>;
      default:
        return null;
    }
  };

  const getTimeRemaining = (dueDate: string): string => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Vencida';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}`;
    }
    
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} restante${diffHours > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No hay contenido disponible</h3>
          <p className="text-gray-500 max-w-md">
            El profesor no ha agregado temas o contenido a esta clase todavía.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible value={expandedTopic || undefined} onValueChange={(value) => setExpandedTopic(value)}>
        {topics.map((topic) => {
          const hasContent = topic.assignments.length > 0 || topic.materials.length > 0;
          
          return (
            <AccordionItem key={topic.id} value={topic.id} className="border rounded-md mb-4 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center text-left">
                  <span className="font-medium">{topic.name}</span>
                  {!hasContent && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Vacío
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                {topic.description && (
                  <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                )}

                {/* Materials section */}
                {topic.materials.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Materiales</h4>
                    <div className="space-y-2">
                      {topic.materials.map((material) => (
                        <Card key={material.id} className="border border-gray-200">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base flex items-center">
                              <File className="h-4 w-4 mr-2 text-blue-500" />
                              {material.title}
                            </CardTitle>
                            <CardDescription>{formatDate(material.createdAt)}</CardDescription>
                          </CardHeader>
                          {material.description && (
                            <CardContent className="p-4 pt-0 pb-2">
                              <p className="text-sm">{material.description}</p>
                            </CardContent>
                          )}
                          {material.attachments.length > 0 && (
                            <CardContent className="p-4 pt-0">
                              <div className="space-y-2">
                                {material.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                      <span className="text-sm truncate">{attachment.fileName}</span>
                                    </div>
                                    <a 
                                      href={attachment.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-700"
                                    >
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments section */}
                {topic.assignments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tareas</h4>
                    <div className="space-y-2">
                      {topic.assignments.map((assignment) => {
                        const isPending = assignment.status === 'pending';
                        const isSubmitted = assignment.status === 'submitted';
                        const isExpired = assignment.status === 'expired';
                        const isGraded = assignment.grade !== undefined && assignment.grade !== null;
                        
                        return (
                          <Card 
                            key={assignment.id} 
                            className={`border ${isExpired ? 'border-red-200 bg-red-50' : ''} ${isGraded ? 'border-purple-200 bg-purple-50' : ''}`}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base flex items-center">
                                    {isExpired && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                                    {isSubmitted && !isGraded && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                                    {isGraded && <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />}
                                    {isPending && <Clock className="h-4 w-4 mr-2 text-blue-500" />}
                                    {assignment.title}
                                  </CardTitle>
                                  <CardDescription>
                                    Fecha de entrega: {formatDate(assignment.dueDate)}
                                  </CardDescription>
                                </div>
                                {getStatusBadge(assignment.status)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 pb-2">
                              <p className="text-sm">{assignment.description}</p>
                              
                              {/* Show time remaining for pending assignments */}
                              {isPending && (
                                <div className="flex items-center mt-2 text-sm text-blue-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{getTimeRemaining(assignment.dueDate)}</span>
                                </div>
                              )}
                              
                              {/* Show grade for graded assignments */}
                              {isGraded && assignment.grade !== undefined && (
                                <div className="mt-2">
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium mr-2">Calificación:</span>
                                    <Badge className="bg-purple-100 text-purple-800">
                                      {assignment.grade}/100
                                    </Badge>
                                  </div>
                                  {assignment.feedback && (
                                    <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                                      <h5 className="text-xs font-medium text-gray-700 mb-1">Retroalimentación del profesor:</h5>
                                      <p className="text-sm text-gray-600">{assignment.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Show submission date for submitted assignments */}
                              {isSubmitted && assignment.submissionDate && (
                                <div className="flex items-center mt-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  <span>Entregada el {formatDate(assignment.submissionDate)}</span>
                                </div>
                              )}
                            </CardContent>
                            
                            {/* Show assignment attachments if any */}
                            {assignment.attachments.length > 0 && (
                              <CardContent className="p-4 pt-0 pb-2">
                                <div className="space-y-1 mt-1">
                                  <h5 className="text-xs font-medium text-gray-700">Archivos:</h5>
                                  {assignment.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between py-1">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="text-sm truncate">{attachment.fileName}</span>
                                      </div>
                                      <a 
                                        href={attachment.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                            
                            {/* Show submitted files if any */}
                            {isSubmitted && assignment.submissionFiles && assignment.submissionFiles.length > 0 && (
                              <CardContent className="p-4 pt-0 pb-2">
                                <div className="space-y-1 mt-1">
                                  <h5 className="text-xs font-medium text-gray-700">Tu entrega:</h5>
                                  {assignment.submissionFiles.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between py-1">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                                        <span className="text-sm truncate">{file.fileName}</span>
                                      </div>
                                      <a 
                                        href={file.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-green-500 hover:text-green-700"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            )}
                            
                            <CardFooter className="p-4 pt-2 flex justify-end">
                              {isPending && (
                                <Button 
                                  onClick={() => handleSubmitAssignment(assignment)}
                                  className="flex items-center"
                                >
                                  <ChevronRight className="h-4 w-4 mr-1" />
                                  Entregar tarea
                                </Button>
                              )}
                              
                              {isSubmitted && !isGraded && (
                                <Button 
                                  variant="outline"
                                  onClick={() => handleSubmitAssignment(assignment)}
                                >
                                  <ChevronRight className="h-4 w-4 mr-1" />
                                  Modificar entrega
                                </Button>
                              )}
                              
                              {isExpired && (
                                <Button disabled variant="outline" className="text-red-500 pointer-events-none">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Plazo vencido
                                </Button>
                              )}
                              
                              {isGraded && (
                                <Button 
                                  variant="outline"
                                  onClick={() => handleViewAssignment(assignment)}
                                >
                                  Ver detalles
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {!hasContent && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-gray-500">No hay contenido disponible para este tema.</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {/* Submission Dialog */}
      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <AssignmentSubmissionForm
              assignmentId={selectedAssignment.id}
              existingFiles={selectedAssignment.submissionFiles || []}
              existingComment=""
              onSubmissionComplete={handleSubmissionComplete}
              onCancel={() => setShowSubmissionForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Assignment Dialog */}
      <Dialog open={selectedAssignment !== null && !showSubmissionForm} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción:</h4>
                <p className="text-sm">{selectedAssignment.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Fecha de entrega:</h4>
                <p className="text-sm">{formatDate(selectedAssignment.dueDate)}</p>
              </div>
              
              {selectedAssignment.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Archivos adjuntos:</h4>
                  <div className="space-y-1">
                    {selectedAssignment.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate">{attachment.fileName}</span>
                        </div>
                        <a 
                          href={attachment.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAssignment.submissionDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Entregada el:</h4>
                  <p className="text-sm">{formatDate(selectedAssignment.submissionDate)}</p>
                </div>
              )}
              
              {selectedAssignment.submissionFiles && selectedAssignment.submissionFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Tu entrega:</h4>
                  <div className="space-y-1">
                    {selectedAssignment.submissionFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm truncate">{file.fileName}</span>
                        </div>
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-700"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAssignment.grade !== undefined && selectedAssignment.grade !== null && (
                <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Calificación:</h4>
                  <div className="flex items-center">
                    <Badge className="bg-purple-100 text-purple-800 text-base px-3 py-1">
                      {selectedAssignment.grade}/100
                    </Badge>
                  </div>
                  
                  {selectedAssignment.feedback && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Retroalimentación:</h4>
                      <p className="text-sm bg-white p-3 rounded-md border border-gray-200">
                        {selectedAssignment.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setSelectedAssignment(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassContentStudent;
