
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassCard from '@/components/ClassCard';
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
}

// Define interface for assignment data
interface Assignment {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'expired';
}

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studentClasses, setStudentClasses] = useState<ClassData[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
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
    fetchAssignments();
  }, [toast]);
  
  // Fetch assignments from API
  const fetchAssignments = async () => {
    try {
      setIsLoadingAssignments(true);
      const response = await api.get('/assignments/student');
      
      // Format assignments
      const formattedAssignments = response.data.map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        className: assignment.className,
        classId: assignment.classId,
        dueDate: assignment.dueDate,
        status: assignment.status,
      }));
      
      setPendingAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Use mock data if API fails
      const mockAssignments = [
        { id: 'a1', title: 'Tarea 1: Introducción', className: 'Programación Web', classId: 'c1', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'pending' },
        { id: 'a2', title: 'Actividad: Base de datos', className: 'Bases de Datos', classId: 'c2', dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'pending' },
        { id: 'a3', title: 'Proyecto Final', className: 'Programación Web', classId: 'c1', dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'expired' },
      ];
      setPendingAssignments(mockAssignments);
    } finally {
      setIsLoadingAssignments(false);
    }
  };
  
  if (!currentUser || currentUser.role !== 'student') return null;
  
  // Handle joining a class
  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un código de clase válido.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await api.post('/enrollments/join', { classCode: joinCode });
      
      toast({
        title: "¡Genial!",
        description: `Te has unido a la clase con el código ${joinCode}.`,
      });
      
      // Add the new class to the list
      setStudentClasses([...studentClasses, response.data]);
      
      setJoinCode('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        title: "Error",
        description: "No se pudo unir a la clase. Verifica que el código sea correcto.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
                    <ClassCard key={classItem.id} classData={classItem} />
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
              {isLoadingAssignments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-10 bg-slate-200 rounded w-32 ml-auto"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : pendingAssignments.length > 0 ? (
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
                                ? `Vencido el ${formatDate(assignment.dueDate)}` 
                                : `Vence el ${formatDate(assignment.dueDate)}`}
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
                          asChild
                        >
                          <Link to={`/class/${assignment.classId}`}>
                            {assignment.status === 'expired' ? 'Ver Detalles' : 'Entregar'}
                          </Link>
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
              
              <div className="flex justify-center mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-1"
                  onClick={fetchAssignments}
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualizar datos
                </Button>
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
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 3)
                  .map(assignment => (
                    <li key={assignment.id} className="flex items-start gap-2">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {formatDate(assignment.dueDate)} - {assignment.className}
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
