import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnnouncementCard from '@/components/AnnouncementCard';
import { mockAnnouncements } from '@/utils/mockData';

// Reemplazo de íconos de lucide-react por react-icons (ejemplo: react-icons/ri)
import {
  RiBookOpenLine,
  RiUser3Line,
  RiTimeLine,
  RiAddLine,
  RiFileTextLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';

// Define interface for class data
interface ClassData {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  students_count?: number;
  created_at: string;
}

interface PendingSubmission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  className: string;
  dueDate: Date;
}

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');
  const [isLoading, setIsLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<ClassData[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState(
    mockAnnouncements.slice(0, 5).map(announcement => ({
      ...announcement,
      createdAt:
        typeof announcement.createdAt === 'string'
          ? announcement.createdAt
          : announcement.createdAt.toISOString(),
    }))
  );

  // Mock data para entregas pendientes de calificar
  const pendingSubmissions: PendingSubmission[] = [
    {
      id: 's1',
      studentName: 'María García',
      assignmentTitle: 'Tarea 1: Introducción',
      className: 'Programación Web',
      dueDate: new Date(2023, 5, 15),
    },
    {
      id: 's2',
      studentName: 'Carlos López',
      assignmentTitle: 'Actividad: Base de datos',
      className: 'Bases de Datos',
      dueDate: new Date(2023, 5, 18),
    },
  ];

  // Fetch classes from API when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/classes');
        console.log('Fetched classes:', response.data);
        setTeacherClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar tus clases. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  if (!currentUser || currentUser.role !== 'teacher') return null;

  // Genera color en función del nombre de la clase (mismo hash que antes)
  const getClassColor = (className: string): string => {
    const colors = [
      '#4285F4', // Blue
      '#34A853', // Green
      '#FBBC05', // Yellow
      '#EA4335', // Red
      '#8E24AA', // Purple
      '#16A2B8', // Teal
      '#FF7043', // Deep Orange
      '#6B7280', // Gray
    ];
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-gray-200 py-8 px-4">
      <div className="container mx-auto">
        {/* Encabezado principal */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-widest uppercase text-[#00FFC3] drop-shadow-lg">
            Panel del Profesor
          </h1>
          <p className="text-gray-300 mt-2">Bienvenido, {currentUser.name}</p>
        </header>

        {/*
          NUEVO LAYOUT:
          - Tabs con orientación vertical a la IZQUIERDA.
          - Resumen + Actividad Reciente en la parte SUPERIOR de la sección de contenido.
          - Contenido de "Mis Clases", "Por Calificar" y "Anuncios" debajo de esas cards.
        */}
        <Tabs
          orientation="vertical"
          defaultValue="classes"
          onValueChange={setActiveTab}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* LISTA DE TABS (vertical) */}
          <TabsList
            className="
              md:flex md:flex-col md:items-stretch
              bg-[#1E1E2F]/80 border border-[#4c4c6d] 
              md:w-56 min-w-[180px] space-y-2 p-2 rounded
            "
          >
            <TabsTrigger
              value="classes"
              className="
                data-[state=active]:bg-[#00ffc3]/10 
                data-[state=active]:text-[#00ffc3]
                transition-colors
                outline-none focus:outline-none
              "
            >
              Mis Clases
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="
                data-[state=active]:bg-[#00ffc3]/10 
                data-[state=active]:text-[#00ffc3]
                transition-colors
                outline-none focus:outline-none
              "
            >
              Por Calificar
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="
                data-[state=active]:bg-[#00ffc3]/10 
                data-[state=active]:text-[#00ffc3]
                transition-colors
                outline-none focus:outline-none
              "
            >
              Anuncios
            </TabsTrigger>

            {/* Botón para crear clase */}
            <Link to="/create-class" className="block mt-2">
              <Button className="w-full flex items-center gap-1 bg-[#00ffc3] text-black hover:bg-[#00ffc3]/90">
                <RiAddLine className="h-4 w-4" />
                Nueva Clase
              </Button>
            </Link>
          </TabsList>

          {/* SECCIÓN DERECHA: Resumen + Actividad Reciente + Contenido de Tabs */}
          <div className="flex-1 space-y-8">
            {/* Tarjetas de Resumen y Actividad Reciente */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Classes count card (Resumen) */}
              <Card className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-200 w-full md:w-1/2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#00ffc3]/10 p-2 rounded-md mr-2">
                        <RiBookOpenLine className="h-5 w-5 text-[#00ffc3]" />
                      </div>
                      <span className="text-sm">Clases Activas</span>
                    </div>
                    <span className="font-bold">{teacherClasses.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-orange-200/20 p-2 rounded-md mr-2">
                        <RiUser3Line className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-sm">Total Estudiantes</span>
                    </div>
                    <span className="font-bold">
                      {/* We don't have student count yet in the API data */}
                      0
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-amber-200/20 p-2 rounded-md mr-2">
                        <RiCheckDoubleLine className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="text-sm">Por Calificar</span>
                    </div>
                    <span className="font-bold">{pendingSubmissions.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent activity card */}
              <Card className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-200 w-full md:w-1/2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="bg-green-200/20 p-2 rounded-full mt-1">
                        <RiFileTextLine className="h-3 w-3 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hace 2 horas</p>
                        <p className="text-sm">
                          Nuevo anuncio en <span className="font-medium">Programación Web</span>
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-200/20 p-2 rounded-full mt-1">
                        <RiUser3Line className="h-3 w-3 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hace 1 día</p>
                        <p className="text-sm">
                          3 nuevos estudiantes en <span className="font-medium">Bases de Datos</span>
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-amber-200/20 p-2 rounded-full mt-1">
                        <RiCheckDoubleLine className="h-3 w-3 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hace 2 días</p>
                        <p className="text-sm">
                          5 entregas nuevas en <span className="font-medium">Programación Web</span>
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contenido de cada Tab (Classes, Pending, Announcements) */}
            <TabsContent value="classes" className="w-full">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="h-40 animate-pulse bg-[#1E1E2F]/80 border border-gray-600"
                    >
                      <div className="bg-slate-600 h-24"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : teacherClasses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherClasses.map((classItem) => (
                    <Link
                      to={`/class/${classItem.id}`}
                      key={classItem.id}
                      className="block hover:no-underline"
                    >
                      <Card className="h-full hover:shadow-2xl transition-all duration-200 overflow-hidden bg-[#1E1E2F]/90 border border-gray-700">
                        <div
                          className="p-4 h-24 flex flex-col justify-between"
                          style={{
                            backgroundColor: getClassColor(classItem.name),
                            color: '#ffffff',
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {classItem.name}
                            </h3>
                            <RiBookOpenLine className="h-5 w-5 opacity-80" />
                          </div>
                          <p className="opacity-90 text-sm">{classItem.semester}</p>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">Carrera:</span> {classItem.career_name}
                          </p>
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">Código:</span> {classItem.class_code}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}

                  {/* Add class card */}
                  <Link to="/create-class" className="block hover:no-underline">
                    <Card className="h-full border-dashed border-2 border-[#00ffc3] flex items-center justify-center hover:bg-[#00ffc3]/20 transition-colors bg-[#1E1E2F]/80">
                      <CardContent className="p-6 text-center">
                        <div className="rounded-full bg-[#00ffc3]/30 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <RiAddLine className="h-6 w-6 text-[#00ffc3]" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-200 mb-1">
                          Crear Nueva Clase
                        </h3>
                        <p className="text-sm text-gray-400">
                          Añadir una nueva clase al sistema
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-600 bg-[#1E1E2F]/50">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <RiBookOpenLine className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-200 mb-2">
                      No hay clases creadas
                    </h3>
                    <p className="text-gray-400 max-w-md mb-6">
                      Aún no ha creado ninguna clase. ¡Cree su primera clase para comenzar!
                    </p>
                    <Link to="/create-class">
                      <Button className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/80">
                        Crear su Primera Clase
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {pendingSubmissions.map(submission => (
                    <Card
                      key={submission.id}
                      className="hover:shadow-2xl transition-all duration-200 bg-[#1E1E2F]/80 border border-gray-600"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-100">
                          <RiCheckDoubleLine className="h-5 w-5 text-amber-400" />
                          {submission.assignmentTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 text-gray-300">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Estudiante:</span> {submission.studentName}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Clase:</span> {submission.className}
                            </p>
                          </div>
                          <div className="flex items-center text-sm">
                            <RiTimeLine className="h-4 w-4 mr-1 text-gray-400" />
                            <span>Entregado el {submission.dueDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/20"
                        >
                          Calificar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-[#1E1E2F]/80 border border-gray-600">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center text-gray-300">
                    <RiCheckDoubleLine className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-100 mb-2">
                      No hay tareas por calificar
                    </h3>
                    <p className="text-gray-400">
                      Actualmente no hay entregas pendientes de calificación.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="announcements">
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {recentAnnouncements.map(announcement => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              ) : (
                <Card className="bg-[#1E1E2F]/80 border border-gray-600">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center text-gray-300">
                    <RiFileTextLine className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-100 mb-2">No hay anuncios</h3>
                    <p className="text-gray-400">
                      No hay anuncios recientes para sus clases.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
