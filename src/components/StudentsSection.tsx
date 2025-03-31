import React, { useState, useEffect } from 'react';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, UserPlus, UserX, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  enrollmentDate?: string;
}

interface StudentsSection2Props {
  classId: string;
  isTeacher: boolean;
}

const StudentsSection: React.FC<StudentsSection2Props> = ({ classId, isTeacher }) => {
  const { toast } = useToast();
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchEnrolledStudents();
  }, [classId]);

  const fetchEnrolledStudents = async () => {
    if (!classId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/enrollments/class/${classId}`);
      setEnrolledStudents(response.data);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await api.get(`/enrollments/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching for students:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron buscar estudiantes. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnrollStudent = async (student: Student) => {
    setSelectedStudent(student);
    
    // Check if student is already enrolled
    const isAlreadyEnrolled = enrolledStudents.some(s => s.id === student.id);
    
    if (isAlreadyEnrolled) {
      toast({
        title: 'Estudiante ya inscrito',
        description: `${student.name} ya está inscrito en esta clase.`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsEnrolling(true);
      
      await api.post('/enrollments', {
        classId: classId,
        studentId: student.id
      });
      
      // Add the student to the enrolled list
      setEnrolledStudents([...enrolledStudents, student]);
      
      // Clear search results and query
      setSearchResults([]);
      setSearchQuery('');
      
      toast({
        title: 'Éxito',
        description: `${student.name} ha sido inscrito en la clase.`,
      });
      
      // Close the dialog
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: 'Error',
        description: 'No se pudo inscribir al estudiante. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const openRemoveDialog = (student: Student) => {
    setSelectedStudent(student);
    setRemoveDialogOpen(true);
  };

  const handleRemoveStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setIsRemoving(true);
      
      await api.delete(`/enrollments/${classId}/${selectedStudent.id}`);
      
      // Remove the student from the enrolled list
      setEnrolledStudents(enrolledStudents.filter(s => s.id !== selectedStudent.id));
      
      toast({
        title: 'Estudiante removido',
        description: `${selectedStudent.name} ha sido removido de la clase.`,
      });
      
      // Close the dialog
      setRemoveDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: 'No se pudo remover al estudiante. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
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
      {isTeacher && (
        <div className="flex justify-end">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Agregar Estudiante
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Inscritos ({enrolledStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledStudents.length > 0 ? (
            <div className="space-y-4">
              {enrolledStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatarUrl} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  {isTeacher && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRemoveDialog(student)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No hay estudiantes inscritos</h3>
              <p className="text-gray-500 text-center max-w-md">
                {isTeacher
                  ? 'No has agregado ningún estudiante a esta clase todavía. Usa el botón "Agregar Estudiante" para comenzar.'
                  : 'No hay estudiantes inscritos en esta clase.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding students */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Estudiante</DialogTitle>
            <DialogDescription>
              Busca estudiantes por nombre, correo electrónico o matrícula para agregarlos a esta clase.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Buscar estudiante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEnrollStudent(student)}
                      disabled={isEnrolling}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No se encontraron estudiantes con "{searchQuery}"</p>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert dialog for removing students */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStudent && (
                <span>
                  Estás a punto de eliminar a <strong>{selectedStudent.name}</strong> de esta clase.
                  Esta acción no se puede deshacer.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={isRemoving}
              className="bg-red-500 hover:bg-red-600"
            >
              {isRemoving ? (
                <div className="animate-spin h-4 w-4 border-2 border-b-transparent rounded-full"></div>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentsSection;
