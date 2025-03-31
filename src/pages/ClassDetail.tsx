import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import AnnouncementsSection from '@/components/AnnouncementsSection';
import ClassContentStudent from '@/components/ClassContentStudent';
import StudentsSection from '@/components/StudentsSection';
import TopicsSection from '@/components/TopicsSection';

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
          description: 'No se pudo cargar la información de la clase.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, toast]);

  const isTeacher = currentUser?.role === 'teacher';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-3 bg-[#2f2f42]" />
          <Skeleton className="h-6 w-48 mb-8 bg-[#2f2f42]" />
          <Skeleton className="h-64 rounded-lg bg-[#2f2f42]" />
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-[#00ffc3] mb-2">Clase no encontrada</h1>
          <p className="text-gray-400">La clase no existe o no tienes acceso a ella.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
      <Navbar />
      <div className="container mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#00ffc3] tracking-wide">{classDetails.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-300 mt-2 gap-1 sm:gap-6">
            <span>{classDetails.career_name}</span>
            <span className="hidden sm:inline">•</span>
            <span>{classDetails.semester}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-sm">Profesor: <span className="font-semibold text-white">{classDetails.teacher_name}</span></span>
          </div>
        </header>

        <Tabs defaultValue="announcements" className="mt-6">
          <TabsList className="bg-[#1e1e2f] border border-[#4c4c6d] rounded-md mb-6">
            <TabsTrigger
              value="announcements"
              className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] text-white"
            >
              Anuncios
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] text-white"
            >
              Contenido
            </TabsTrigger>
            {isTeacher && (
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] text-white"
              >
                Alumnos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="announcements">
            <AnnouncementsSection />
          </TabsContent>

          <TabsContent value="content">
            {isTeacher ? (
              <TopicsSection classId={classId!} />
            ) : (
              <ClassContentStudent classId={classId!} />
            )}
          </TabsContent>

          {isTeacher && (
            <TabsContent value="students">
              <StudentsSection classId={classId!} isTeacher={isTeacher} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ClassDetail;
