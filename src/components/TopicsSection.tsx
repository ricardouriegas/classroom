import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, Book, FileText, FilePlus, BookPlus, Plus } from 'lucide-react';
import MaterialForm from '@/components/MaterialForm';
import { getFullFileUrl } from '@/utils/fileHelpers';

interface Topic {
  id: string;
  name: string;
  description?: string;
  materials_count: number;
  assignments_count: number;
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  topicId: string;
  topicName: string;
  submissionsCount?: number;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
}

interface TopicsSectionProps {
  classId: string;
}

const TopicsSection: React.FC<TopicsSectionProps> = ({ classId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showMaterialForm, setShowMaterialForm] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
    fetchMaterials();
    fetchAssignments();
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

  const fetchMaterials = async () => {
    try {
      const response = await api.get(`/materials/class/${classId}`);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/assignments/class/${classId}`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTopicName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un nombre para el tema.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmittingTopic(true);
      
      const response = await api.post('/topics', {
        class_id: classId,
        name: newTopicName,
        description: newTopicDescription || '',
      });
      
      setTopics([...topics, response.data]);
      setNewTopicName('');
      setNewTopicDescription('');
      setIsAddingTopic(false);
      
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
      setIsSubmittingTopic(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    const newExpandedTopics = new Set(expandedTopics);
    if (newExpandedTopics.has(topicId)) {
      newExpandedTopics.delete(topicId);
    } else {
      newExpandedTopics.add(topicId);
    }
    setExpandedTopics(newExpandedTopics);
  };

  const handleCreateAssignment = (topicId: string) => {
    navigate(`/class/${classId}/create-assignment?topicId=${topicId}`);
  };

  const handleMaterialCreated = (newMaterial: Material) => {
    setMaterials([newMaterial, ...materials]);
    setShowMaterialForm(null);
    toast({
      title: 'Éxito',
      description: 'El material se ha creado correctamente.',
    });

    // Update the materials count for the topic
    setTopics(topics.map(topic => 
      topic.id === newMaterial.topicId 
        ? { ...topic, materials_count: topic.materials_count + 1 }
        : topic
    ));
  };

  const getTopicMaterials = (topicId: string) => {
    return materials.filter(material => material.topicId === topicId);
  };

  const getTopicAssignments = (topicId: string) => {
    return assignments.filter(assignment => assignment.topicId === topicId);
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
      {/* Topic Creation */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddingTopic(!isAddingTopic)}
          className="flex items-center gap-1"
        >
          {isAddingTopic ? 'Cancelar' : (
            <>
              <Plus className="h-4 w-4" />
              Crear Tema
            </>
          )}
        </Button>
      </div>

      {isAddingTopic && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Tema</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTopic}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topicName">Nombre del tema*</Label>
                  <Input
                    id="topicName"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Ej: Introducción a la materia"
                    disabled={isSubmittingTopic}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicDescription">Descripción (opcional)</Label>
                  <Input
                    id="topicDescription"
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                    placeholder="Breve descripción del tema"
                    disabled={isSubmittingTopic}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmittingTopic}
                >
                  {isSubmittingTopic ? 'Creando...' : 'Crear Tema'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Topics List */}
      {topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <Collapsible 
                open={expandedTopics.has(topic.id)}
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="h-5 w-5 text-primary mr-2" />
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <FileText className="h-4 w-4" />
                          <span>{topic.materials_count}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <FilePlus className="h-4 w-4" />
                          <span>{topic.assignments_count}</span>
                        </div>
                        {expandedTopics.has(topic.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    {topic.description && (
                      <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Actions */}
                    <div className="flex space-x-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setShowMaterialForm(topic.id === showMaterialForm ? null : topic.id)}
                      >
                        <BookPlus className="h-4 w-4" />
                        {showMaterialForm === topic.id ? 'Cancelar' : 'Agregar Material'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleCreateAssignment(topic.id)}
                      >
                        <FilePlus className="h-4 w-4" />
                        Crear Tarea
                      </Button>
                    </div>

                    {/* Material Form */}
                    {showMaterialForm === topic.id && (
                      <Card className="mb-4 border border-gray-200">
                        <CardHeader>
                          <CardTitle>Nuevo Material</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MaterialForm 
                            classId={classId} 
                            topics={topics}
                            onMaterialCreated={handleMaterialCreated}
                            onCancel={() => setShowMaterialForm(null)}
                          />
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-4">
                      {/* Materials List */}
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <BookPlus className="h-4 w-4 mr-1" />
                          Materiales ({getTopicMaterials(topic.id).length})
                        </h3>
                        {getTopicMaterials(topic.id).length > 0 ? (
                          <div className="space-y-2">
                            {getTopicMaterials(topic.id).map(material => (
                              <Card key={material.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <h4 className="font-medium">{material.title}</h4>
                                  {material.description && (
                                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                                  )}
                                  
                                  {material.attachments && material.attachments.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm font-medium mb-2">Archivos:</p>
                                      <div className="space-y-2">
                                        {material.attachments.map(attachment => (
                                          <a 
                                            key={attachment.id}
                                            href={getFullFileUrl(attachment.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-2 border rounded transition-colors"
                                          >
                                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                            <span className="text-sm">{attachment.fileName}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No hay materiales disponibles.</p>
                        )}
                      </div>

                      <Separator />

                      {/* Assignments List */}
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <FilePlus className="h-4 w-4 mr-1" />
                          Tareas ({getTopicAssignments(topic.id).length})
                        </h3>
                        {getTopicAssignments(topic.id).length > 0 ? (
                          <div className="space-y-2">
                            {getTopicAssignments(topic.id).map(assignment => (
                              <Card key={assignment.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium">{assignment.title}</h4>
                                    <span className="text-sm text-gray-500">
                                      Entrega: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                  
                                  {assignment.submissionsCount !== undefined && (
                                    <p className="text-sm text-gray-500 mt-2">
                                      {assignment.submissionsCount} entregas
                                    </p>
                                  )}
                                  
                                  {assignment.attachments && assignment.attachments.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm font-medium mb-2">Archivos:</p>
                                      <div className="space-y-2">
                                        {assignment.attachments.map(attachment => (
                                          <a 
                                            key={attachment.id}
                                            href={getFullFileUrl(attachment.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-2 border rounded transition-colors"
                                          >
                                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                            <span className="text-sm">{attachment.fileName}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter className="px-4 py-2">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="ml-auto"
                                    onClick={() => navigate(`/class/${classId}/assignment/${assignment.id}`)}
                                  >
                                    Ver detalles
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No hay tareas disponibles.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay temas</h3>
            <p className="text-gray-500 max-w-md mb-4">
              Aún no has creado ningún tema para esta clase. Los temas te ayudan a organizar el contenido y las tareas.
            </p>
            <Button onClick={() => setIsAddingTopic(true)}>
              Crear Primer Tema
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicsSection;
