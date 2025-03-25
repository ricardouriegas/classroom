
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Plus, 
  FileText,
  ClipboardCheck
} from 'lucide-react';
import { mockClasses, mockAnnouncements } from '@/utils/mockData';
import AnnouncementCard from '@/components/AnnouncementCard';

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('classes');
  
  if (!currentUser || currentUser.role !== 'teacher') return null;
  
  // Filter classes where this teacher is the instructor
  const teacherClasses = mockClasses.filter(c => c.teacherId === currentUser.id);
  
  // Get pending submissions to grade (mock data - in real app would come from API)
  const pendingSubmissions = [
    { id: 's1', studentName: 'María García', assignmentTitle: 'Tarea 1: Introducción', className: 'Programación Web', dueDate: new Date(2023, 5, 15) },
    { id: 's2', studentName: 'Carlos López', assignmentTitle: 'Actividad: Base de datos', className: 'Bases de Datos', dueDate: new Date(2023, 5, 18) },
  ];
  
  // Get recent announcements for teacher's classes
  const classIds = teacherClasses.map(c => c.id);
  const recentAnnouncements = mockAnnouncements
    .filter(a => classIds.includes(a.classId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {currentUser.name}</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="flex-1">
          <Tabs defaultValue="classes" onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="classes">Mis Clases</TabsTrigger>
                <TabsTrigger value="pending">Por Calificar</TabsTrigger>
                <TabsTrigger value="announcements">Anuncios</TabsTrigger>
              </TabsList>
              
              <Link to="/create-class">
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Nueva Clase
                </Button>
              </Link>
            </div>
            
            <TabsContent value="classes" className="mt-2">
              {teacherClasses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherClasses.map(classItem => (
                    <Link to={`/class/${classItem.id}`} key={classItem.id} className="block hover:no-underline">
                      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                        <div 
                          className="p-4 h-24 flex flex-col justify-between"
                          style={{ backgroundColor: classItem.color || '#4285F4', color: '#ffffff' }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg line-clamp-1">{classItem.name}</h3>
                            <BookOpen className="h-5 w-5 opacity-80" />
                          </div>
                          
                          {classItem.section && (
                            <p className="opacity-90 text-sm">{classItem.section}</p>
                          )}
                        </div>
                        
                        <CardContent className="p-4 space-y-3">
                          {classItem.subject && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Materia:</span> {classItem.subject}
                            </p>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{classItem.students.length} estudiantes</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  
                  {/* Add class card */}
                  <Link to="/create-class" className="block hover:no-underline">
                    <Card className="h-full border-dashed border-2 flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <CardContent className="p-6 text-center">
                        <div className="rounded-full bg-primary/10 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">Crear Nueva Clase</h3>
                        <p className="text-sm text-gray-500">Añadir una nueva clase al sistema</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No hay clases creadas</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      Aún no ha creado ninguna clase. ¡Cree su primera clase para comenzar!
                    </p>
                    <Link to="/create-class">
                      <Button>Crear su Primera Clase</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-2">
              {pendingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {pendingSubmissions.map(submission => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-amber-500" />
                          {submission.assignmentTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Estudiante:</span> {submission.studentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Clase:</span> {submission.className}
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Entregado el {submission.dueDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="ml-auto">Calificar</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No hay tareas por calificar</h3>
                    <p className="text-gray-500">
                      Actualmente no hay entregas pendientes de calificación.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="announcements" className="mt-2">
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {recentAnnouncements.map(announcement => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No hay anuncios</h3>
                    <p className="text-gray-500">
                      No hay anuncios recientes para sus clases.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Summary cards */}
        <div className="w-full md:w-80 space-y-6">
          {/* Classes count card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-md mr-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">Clases Activas</span>
                </div>
                <span className="font-bold">{teacherClasses.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-2 rounded-md mr-2">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-sm">Total Estudiantes</span>
                </div>
                <span className="font-bold">
                  {teacherClasses.reduce((total, c) => total + c.students.length, 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-md mr-2">
                    <ClipboardCheck className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-sm">Por Calificar</span>
                </div>
                <span className="font-bold">{pendingSubmissions.length}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent activity card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 p-2 rounded-full mt-1">
                    <FileText className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                    <p className="text-sm">Nuevo anuncio en <span className="font-medium">Programación Web</span></p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 p-2 rounded-full mt-1">
                    <Users className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hace 1 día</p>
                    <p className="text-sm">3 nuevos estudiantes en <span className="font-medium">Bases de Datos</span></p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-amber-100 p-2 rounded-full mt-1">
                    <ClipboardCheck className="h-3 w-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hace 2 días</p>
                    <p className="text-sm">5 entregas nuevas en <span className="font-medium">Programación Web</span></p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
