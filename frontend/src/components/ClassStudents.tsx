
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Search, UserPlus, X, RefreshCw, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  enrollmentDate?: Date;
}

export default function ClassStudents() {
  const { id: classId } = useParams<{ id: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkEnrollMode, setBulkEnrollMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const { toast } = useToast();

  // Load enrolled students
  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    if (!classId) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/enrollments/class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos inscritos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        description: "Ingrese un nombre o matrícula para buscar",
      });
      return;
    }

    try {
      setIsSearching(true);
      setSearchResults([]);
      
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/enrollments/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Filter out students who are already enrolled
      const filteredResults = response.data.filter(
        (student: Student) => !students.some((s) => s.id === student.id)
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setFeedbackMessage("No se encontraron alumnos con ese nombre o matrícula");
      } else {
        setFeedbackMessage("");
      }
    } catch (error) {
      console.error("Error searching students:", error);
      toast({
        title: "Error",
        description: "No se pudieron buscar alumnos",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const enrollStudent = async (student: Student) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/enrollments`,
        {
          classId,
          studentId: student.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Add the newly enrolled student to the list
      setStudents([...students, {
        id: student.id,
        name: student.name,
        email: student.email,
        avatarUrl: student.avatarUrl,
        enrollmentDate: new Date()
      }]);
      
      // Remove from search results
      setSearchResults(searchResults.filter((s) => s.id !== student.id));
      
      toast({
        title: "Éxito",
        description: `${student.name} ha sido inscrito en la clase`,
      });
    } catch (error: any) {
      console.error("Error enrolling student:", error);
      if (error.response?.data?.error?.code === "ALREADY_ENROLLED") {
        toast({
          title: "Alumno ya inscrito",
          description: `${student.name} ya está inscrito en esta clase`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo inscribir al alumno",
          variant: "destructive",
        });
      }
    }
  };

  const enrollMultipleStudents = async () => {
    if (selectedStudents.length === 0) {
      toast({
        description: "Seleccione al menos un alumno para inscribir",
      });
      return;
    }
    
    try {
      let enrolledCount = 0;
      let errorsCount = 0;
      
      for (const studentId of selectedStudents) {
        const student = searchResults.find(s => s.id === studentId);
        if (!student) continue;
        
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/enrollments`,
            {
              classId,
              studentId: student.id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          // Add to enrolled students
          setStudents(prev => [...prev, {
            id: student.id,
            name: student.name,
            email: student.email,
            avatarUrl: student.avatarUrl,
            enrollmentDate: new Date()
          }]);
          
          enrolledCount++;
        } catch (error) {
          console.error(`Error enrolling student ${student.name}:`, error);
          errorsCount++;
        }
      }
      
      // Remove enrolled students from search results
      setSearchResults(prev => prev.filter(s => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
      
      toast({
        title: "Inscripción completada",
        description: `${enrolledCount} alumnos inscritos. ${errorsCount > 0 ? `${errorsCount} errores` : ''}`,
        variant: errorsCount > 0 ? "destructive" : "default",
      });
      
      // Refresh student list
      fetchStudents();
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      toast({
        title: "Error",
        description: "No se pudieron inscribir algunos alumnos",
        variant: "destructive",
      });
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!confirm("¿Está seguro que desea eliminar este alumno de la clase?")) {
      return;
    }
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/enrollments/${classId}/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Remove the student from the list
      setStudents(students.filter((s) => s.id !== studentId));
      
      toast({
        title: "Éxito",
        description: "Alumno eliminado de la clase correctamente",
      });
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al alumno de la clase",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Alumnos</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchStudents}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>
        
        {/* Search Form */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              type="text"
              placeholder="Buscar alumnos por nombre o matrícula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleSearch} disabled={isSearching} className="flex-1 md:flex-none">
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Buscando...
                </>
              ) : (
                "Buscar"
              )}
            </Button>
            {searchResults.length > 0 && (
              <Button
                variant={bulkEnrollMode ? "default" : "outline"}
                onClick={() => setBulkEnrollMode(!bulkEnrollMode)}
                className="flex-1 md:flex-none"
              >
                {bulkEnrollMode ? "Cancelar selección" : "Selección múltiple"}
              </Button>
            )}
          </div>
        </div>
        
        {/* Feedback message */}
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded text-center">
            {feedbackMessage}
          </div>
        )}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8 border rounded-md overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 font-medium flex justify-between items-center">
              <span>Resultados de búsqueda ({searchResults.length})</span>
              {bulkEnrollMode && selectedStudents.length > 0 && (
                <Button size="sm" onClick={enrollMultipleStudents}>
                  Inscribir seleccionados ({selectedStudents.length})
                </Button>
              )}
            </div>
            <ul className="divide-y">
              {searchResults.map((student) => (
                <li 
                  key={student.id} 
                  className={`flex items-center justify-between px-4 py-3 ${
                    bulkEnrollMode && selectedStudents.includes(student.id) 
                      ? "bg-blue-50 dark:bg-blue-900/20" 
                      : ""
                  }`}
                  onClick={bulkEnrollMode ? () => toggleStudentSelection(student.id) : undefined}
                  style={bulkEnrollMode ? { cursor: "pointer" } : undefined}
                >
                  <div className="flex items-center gap-3">
                    {bulkEnrollMode && (
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  {!bulkEnrollMode && (
                    <Button
                      size="sm"
                      onClick={() => enrollStudent(student)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Agregar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Enrolled Students List */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 font-medium">
            Alumnos Inscritos ({students.length})
          </div>
          {isLoading ? (
            <div className="p-6 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400 mb-2" />
              <p>Cargando alumnos...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No hay alumnos inscritos en esta clase.</p>
              <p className="text-sm mt-2">Use la búsqueda arriba para agregar alumnos.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {students.map((student) => (
                <li key={student.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeStudent(student.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
