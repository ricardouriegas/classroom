import React, { useEffect, useState } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/Spinner';
import { FileText, Book } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFullFileUrl } from '@/utils/fileHelpers';

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

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  topicId: string;
  topicName: string;
  status?: 'pending' | 'submitted' | 'expired';
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface ClassContent {
  materials: Material[];
  assignments: Assignment[];
}

interface Props {
  classId: string;
}

const ClassContentStudent: React.FC<Props> = ({ classId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState<ClassContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching class content for student, classId:', classId);
        
        // Fetch materials
        const materialsResponse = await api.get(`/materials/class/${classId}`);
        console.log('Materials response:', materialsResponse.data);
        
        // Fetch assignments
        const assignmentsResponse = await api.get(`/assignments/class/${classId}`);
        console.log('Assignments response:', assignmentsResponse.data);
        
        setContent({
          materials: materialsResponse.data,
          assignments: assignmentsResponse.data
        });
      } catch (error) {
        console.error('Error fetching class content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load class content. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      fetchContent();
    } else {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Missing class ID.',
        variant: 'destructive',
      });
    }
  }, [classId, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p>No content available for this class.</p>
      </div>
    );
  }

  // Group materials by topic
  const materialsByTopic: Record<string, Material[]> = {};
  content.materials.forEach(material => {
    if (!materialsByTopic[material.topicName]) {
      materialsByTopic[material.topicName] = [];
    }
    materialsByTopic[material.topicName].push(material);
  });

  // Group assignments by topic
  const assignmentsByTopic: Record<string, Assignment[]> = {};
  content.assignments.forEach(assignment => {
    if (!assignmentsByTopic[assignment.topicName]) {
      assignmentsByTopic[assignment.topicName] = [];
    }
    assignmentsByTopic[assignment.topicName].push(assignment);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    return '📁';
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">Materiales</TabsTrigger>
          <TabsTrigger value="assignments">Tareas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="space-y-6 mt-4">
          {Object.keys(materialsByTopic).length > 0 ? (
            Object.entries(materialsByTopic).map(([topic, materials]) => (
              <div key={topic} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">{topic}</h3>
                {materials.map(material => (
                  <Card key={material.id} className="overflow-hidden bg-[#1E1E2F]/80 border border-[#4c4c6d] text-white">
                    <CardHeader className="bg-[#252538]">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Book className="h-5 w-5 text-[#00ffc3]" />
                        {material.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {material.description && (
                        <div className="mb-4">
                          <p className="text-gray-300">{material.description}</p>
                        </div>
                      )}
                      {material.attachments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-200">Archivos adjuntos:</h4>
                          <div className="space-y-2">
                            {material.attachments.map(attachment => (
                              <a
                                key={attachment.id}
                                href={getFullFileUrl(attachment.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 rounded-md border border-[#4c4c6d] bg-[#252538] hover:bg-[#2a2a3d] transition-colors text-sm"
                              >
                                <span className="mr-2">{getFileIcon(attachment.fileType)}</span>
                                <span className="flex-1 truncate text-gray-300">{attachment.fileName}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 text-sm text-gray-400">
                        Publicado: {formatDate(material.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No hay materiales disponibles</h3>
              <p className="text-gray-500">Los materiales de estudio aparecerán aquí cuando estén disponibles.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="assignments" className="space-y-6 mt-4">
          {Object.keys(assignmentsByTopic).length > 0 ? (
            Object.entries(assignmentsByTopic).map(([topic, assignments]) => (
              <div key={topic} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">{topic}</h3>
                {assignments.map(assignment => (
                  <Card 
                    key={assignment.id} 
                    className={`overflow-hidden bg-[#1E1E2F]/80 border ${
                      assignment.status === 'expired' ? 'border-red-700' : 
                      assignment.status === 'submitted' ? 'border-green-700' : 'border-[#4c4c6d]'
                    } text-white`}
                  >
                    <CardHeader className={`${
                      assignment.status === 'expired' ? 'bg-red-950/40' : 
                      assignment.status === 'submitted' ? 'bg-green-950/40' : 'bg-[#252538]'
                    }`}>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                          <FileText className="h-5 w-5 text-[#00ffc3]" />
                          {assignment.title}
                        </CardTitle>
                        {assignment.status && (
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              assignment.status === 'expired' ? 'bg-red-900/40 text-red-300' : 
                              assignment.status === 'submitted' ? 'bg-green-900/40 text-green-300' : 
                              'bg-yellow-900/40 text-yellow-300'
                            }`}
                          >
                            {assignment.status === 'expired' ? 'Expirado' : 
                             assignment.status === 'submitted' ? 'Entregado' : 'Pendiente'}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-4">
                        <p className="text-gray-300">{assignment.description}</p>
                      </div>
                      {assignment.attachments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-200">Archivos adjuntos:</h4>
                          <div className="space-y-2">
                            {assignment.attachments.map(attachment => (
                              <a
                                key={attachment.id}
                                href={getFullFileUrl(attachment.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 rounded-md border border-[#4c4c6d] bg-[#252538] hover:bg-[#2a2a3d] transition-colors text-sm"
                              >
                                <span className="mr-2">{getFileIcon(attachment.fileType)}</span>
                                <span className="flex-1 truncate text-gray-300">{attachment.fileName}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 text-sm text-gray-400">
                        Fecha de entrega: {formatDate(assignment.dueDate)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No hay tareas disponibles</h3>
              <p className="text-gray-500">Las tareas aparecerán aquí cuando estén asignadas.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassContentStudent;
