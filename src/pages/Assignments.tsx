import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText 
} from 'lucide-react';

// Mock data
const mockClasses = [
  { id: 'class1', name: 'Programming 101' },
  { id: 'class2', name: 'Web Development' },
  { id: 'class3', name: 'Data Structures' },
];

const mockAssignments = [
  { 
    id: 'a1', 
    title: 'Introduction to Variables', 
    classId: 'class1',
    className: 'Programming 101',
    dueDate: new Date(2023, 5, 20), 
    status: 'pending',
    description: 'Learn about variables and their types in programming',
  },
  { 
    id: 'a2', 
    title: 'Database Design', 
    classId: 'class2',
    className: 'Web Development',
    dueDate: new Date(2023, 5, 18), 
    status: 'pending',
    description: 'Create a database schema for a social media application',
  },
  { 
    id: 'a3', 
    title: 'Final Project', 
    classId: 'class1',
    className: 'Programming 101',
    dueDate: new Date(2023, 4, 30), 
    status: 'completed',
    description: 'Build a complete application using the concepts learned in class',
    grade: 95
  },
  { 
    id: 'a4', 
    title: 'Linked Lists Implementation', 
    classId: 'class3',
    className: 'Data Structures',
    dueDate: new Date(2023, 5, 10), 
    status: 'late',
    description: 'Implement a doubly linked list with all operations',
  },
];

const Assignments = () => {
  const { currentUser, isLoading } = useAuth();
  
  // Filtrar assignments
  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending');
  const completedAssignments = mockAssignments.filter(a => a.status === 'completed');
  const lateAssignments = mockAssignments.filter(a => a.status === 'late');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          <Skeleton className="h-10 w-64 mb-4 bg-[#2f2f42]" />
          <Skeleton className="h-6 w-48 mb-8 bg-[#2f2f42]" />
          
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-64 rounded-lg bg-[#2f2f42]" />
            <Skeleton className="h-64 rounded-lg bg-[#2f2f42]" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // protected route se encarga de redirigir si no hay user
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-wide text-[#00ffc3]">
            Asignaciones
          </h1>
          <p className="text-gray-200 mt-2">
            Explora y gestiona tus tareas en cada clase
          </p>
        </header>

        {/* Vertical Tabs Layout */}
        <Tabs orientation="vertical" defaultValue="pending" className="flex flex-col md:flex-row gap-8">
          {/* TabsList a la izquierda */}
          <TabsList
            className="
              md:flex md:flex-col md:items-start
              bg-[#1E1E2F]/80 border border-[#4c4c6d] 
              w-full md:w-48 space-y-2 p-2 rounded
            "
          >
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] w-full text-left"
            >
              Pendientes ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] w-full text-left"
            >
              Completadas ({completedAssignments.length})
            </TabsTrigger>
            <TabsTrigger
              value="late"
              className="data-[state=active]:bg-[#00ffc3]/10 data-[state=active]:text-[#00ffc3] w-full text-left"
            >
              Atrasadas ({lateAssignments.length})
            </TabsTrigger>
          </TabsList>

          {/* Contenido a la derecha */}
          <div className="flex-1">
            <TabsContent value="pending" className="space-y-6">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-200">
                    <CardHeader className="pb-2 border-b border-[#4c4c6d]">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-[#00ffc3]">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.className}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10"
                        >
                          <Clock className="h-3 w-3" />
                          {assignment.dueDate.toLocaleDateString()}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">
                        {assignment.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t border-[#4c4c6d]">
                      <Button variant="outline" className="border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10">
                        Ver Detalles
                      </Button>
                      <Button className="bg-[#00ffc3] text-black hover:bg-[#00ffc3]/90">
                        Entregar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-200 mb-2">¡No hay tareas pendientes!</h3>
                    <p className="text-gray-400 text-center">
                      Has completado todas tus tareas o aún no te han asignado nuevas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              {completedAssignments.length > 0 ? (
                completedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-200">
                    <CardHeader className="pb-2 border-b border-[#4c4c6d]">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-[#00ffc3]">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.className}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-green-200/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            Calificación: {assignment.grade}/100
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10"
                          >
                            <Calendar className="h-3 w-3" />
                            {assignment.dueDate.toLocaleDateString()}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">
                        {assignment.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-[#4c4c6d]">
                      <Button variant="outline" className="border-[#00ffc3] text-[#00ffc3] hover:bg-[#00ffc3]/10">
                        Ver Detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-200 mb-2">Sin tareas completadas</h3>
                    <p className="text-gray-400">
                      Aún no has completado ninguna tarea.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="late" className="space-y-6">
              {lateAssignments.length > 0 ? (
                lateAssignments.map((assignment) => (
                  <Card key={assignment.id} className="bg-[#1E1E2F]/80 border border-red-400 text-gray-200">
                    <CardHeader className="pb-2 border-b border-red-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-red-400">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription>
                            {assignment.className}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 border-red-400 text-red-400 hover:bg-red-400/10"
                        >
                          <Clock className="h-3 w-3" />
                          Venció: {assignment.dueDate.toLocaleDateString()}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300">
                        {assignment.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t border-red-400">
                      <Button variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10">
                        Ver Detalles
                      </Button>
                      <Button variant="destructive" className="hover:bg-red-600">
                        Entregar Atrasada
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card className="bg-[#1E1E2F]/80 border border-gray-700 text-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-200 mb-2">¡No hay tareas atrasadas!</h3>
                    <p className="text-gray-400">Felicidades, te has mantenido al día.</p>
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

export default Assignments;