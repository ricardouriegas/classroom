
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import AnnouncementsSection from '@/components/AnnouncementsSection';
import ClassContentStudent from '@/components/ClassContentStudent';

interface ClassDetails {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  teacher_name: string;
  students_count?: number;
}

const ClassDetail = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/classes/${classId}`);
        setClassDetails(response.data);
      } catch (error) {
        console.error('Error fetching class details:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la clase. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clase no encontrada</h1>
          <p className="text-gray-600 mb-8">La clase que estás buscando no existe o no tienes acceso a ella.</p>
        </div>
      </div>
    );
  }

  const isTeacher = currentUser?.role === 'teacher';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{classDetails.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 gap-2 sm:gap-6">
            <p>{classDetails.career_name}</p>
            <p className="flex items-center">
              <span className="hidden sm:inline mx-2">•</span>
              {classDetails.semester}
            </p>
            <p className="flex items-center">
              <span className="hidden sm:inline mx-2">•</span>
              Profesor: {classDetails.teacher_name}
            </p>
          </div>
        </header>
        
        <Tabs defaultValue="announcements" className="mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="announcements">Anuncios</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            {isTeacher && <TabsTrigger value="students">Alumnos</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="announcements">
            <AnnouncementsSection />
          </TabsContent>
          
          <TabsContent value="content">
            {isTeacher ? (
              <div>Contenido de Profesor</div>
            ) : (
              <ClassContentStudent classId={classId!} />
            )}
          </TabsContent>
          
          {isTeacher && (
            <TabsContent value="students">
              <div>Lista de Alumnos</div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ClassDetail;
