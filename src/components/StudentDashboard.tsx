import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAnnouncements } from '@/utils/mockData';
import AnnouncementCard from '@/components/AnnouncementCard';
import { 
  BookOpen, 
  Clock, 
  Calendar,
  Plus, 
  FileText,
  ClipboardCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

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
  teacher_name: string;
  created_at: string;
}

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studentClasses, setStudentClasses] = useState<ClassData[]>([]);
  
  // Get pending assignments for the student (mock data - in real app would come from API)
  const pendingAssignments = [
    { id: 'a1', title: 'Tarea 1: Introducción', className: 'Programación Web', dueDate: new Date(2023, 5, 20), status: 'pending' },
    { id: 'a2', title: 'Actividad: Base de datos', className: 'Bases de Datos', dueDate: new Date(2023, 5, 18), status: 'pending' },
    { id: 'a3', title: 'Proyecto Final', className: 'Programación Web', dueDate: new Date(2023, 4, 30), status: 'expired' },
  ];
  
  // Get recent announcements for student's classes
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  
  // Fetch classes from API when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/classes');
        console.log('Fetched classes for student:', response.data);
        setStudentClasses(response.data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus clases. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);
  
  if (!currentUser || currentUser.role !== 'student') return null;
  
  // Function to generate color based on class name
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
    
    // Simple hash function to get consistent color for same class name
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Handle joining a class
  const handleJoinClass = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un código de clase válido.",
        variant: "destructive",
      });
      return;
    }
    
    // In real app, this would be an API call to join the class
    toast({
      title: "¡Genial!",
      description: `Te has unido a la clase con el código ${joinCode}.`,
    });
    
    setJoinCode('');
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel del Estudiante</h1>
        <p className="text-gray-600 mt-1">Bienvenido, {currentUser.name}</p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Main content */}
        <div className="flex-1">
          <Tabs defaultValue="classes" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="classes">Mis Clases</TabsTrigger>
                <TabsTrigger value="assignments">Tareas Pendientes</TabsTrigger>
                <TabsTrigger value="announcements">Anuncios</TabsTrigger>
              </TabsList>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Unirse a Clase
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Unirse a una Clase</DialogTitle>
                    <DialogDescription>
                      Ingrese el código de clase proporcionado por su profesor para unirse.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4 py-4">
                    <Input 
                      placeholder="Código de clase (ej. ABC123)" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleJoinClass}>Unirse a Clase</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <TabsContent value="classes" className="mt-2">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="h-40 animate-pulse">
                      <div className="bg-slate-200 h-24"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : studentClasses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentClasses.map(classItem => (
                    <Link to={`/class/${classItem.id}`} key={classItem.id} className="block hover:no-underline">
                      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                        <div 
                          className="p-4 h-24 flex flex-col justify-between"
                          style={{ backgroundColor: getClassColor(classItem.name), color: '#ffffff' }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg line-clamp-1">{classItem.name}</h3>
                            <BookOpen className="h-5 w-5 opacity-80" />
                          </div>
                          
                          <p className="opacity-90 text-sm">{classItem.semester}</p>
                        </div>
                        
                        <CardContent className="p-4 space-y-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Carrera:</span> {classItem.career_name}
                          </p>
                          
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Profesor:</span> {classItem.teacher_name}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No estás inscrito en ninguna clase</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                      Aún no te has unido a ninguna clase. Usa el código proporcionado por tu profesor para unirte a una clase.
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      Unirse a una Clase
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="assignments" className="mt-2">
              {pendingAssignments.length > 0 ? (
                <div className="space-y-4">
                  {pendingAssignments.map(assignment => (
                    <Card 
                      key={assignment.id} 
                      className={`hover:shadow-md transition-shadow ${
                        assignment.status === 'expired' ? 'border-red-200 bg-red-50' : ''
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          {assignment.status === 'expired' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <ClipboardCheck className="h-5 w-5 text-blue-500" />
                          )}
                          {assignment.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Clase:</span> {assignment.className}
                          </p>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className={assignment.status === 'expired' ? 'text-red-500' : 'text-gray-500'}>
                              {assignment.status === 'expired' 
                                ? `Vencido el ${assignment.dueDate.toLocaleDateString()}` 
                                : `Vence el ${assignment.dueDate.toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant={assignment.status === 'expired' ? "outline" : "default"} 
                          size="sm" 
                          className="ml-auto"
                          disabled={assignment.status === 'expired'}
                        >
                          {assignment.status === 'expired' ? 'Ver Detalles' : 'Entregar'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No hay tareas pendientes</h3>
                    <p className="text-gray-500">
                      Actualmente no tienes tareas pendientes por entregar.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="announcements" className="mt-2">
              {/* This will be updated with real announcements in the future */}
              <Card>
                <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No hay anuncios</h3>
                  <p className="text-gray-500">
                    No hay anuncios recientes para tus clases.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Summary cards */}
        <div className="w-full md:w-80 space-y-6">
          {/* Summary card */}
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
                <span className="font-bold">{studentClasses.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-md mr-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm">Tareas Pendientes</span>
                </div>
                <span className="font-bold">
                  {pendingAssignments.filter(a => a.status === 'pending').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-md mr-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-sm">Tareas Vencidas</span>
                </div>
                <span className="font-bold">
                  {pendingAssignments.filter(a => a.status === 'expired').length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming deadlines card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próximos Vencimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pendingAssignments
                  .filter(a => a.status === 'pending')
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .slice(0, 3)
                  .map(assignment => (
                    <li key={assignment.id} className="flex items-start gap-2">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {assignment.dueDate.toLocaleDateString()} - {assignment.className}
                        </p>
                        <p className="text-sm font-medium">{assignment.title}</p>
                      </div>
                    </li>
                  ))}
                {pendingAssignments.filter(a => a.status === 'pending').length === 0 && (
                  <li className="text-sm text-gray-500 text-center py-2">
                    No hay fechas de entrega próximas
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
