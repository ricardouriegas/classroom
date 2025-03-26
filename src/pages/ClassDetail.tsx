
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Bell, Book } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import ClassStudents from "@/components/ClassStudents";

interface ClassDetails {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  teacherName: string;
  classCode: string;
  semester: string;
  careerName: string;
  createdAt: string;
}

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/classes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setClassDetails(response.data);
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast({
          title: "Error",
          description: "Could not load class details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClassDetails();
    }
  }, [id, toast]);

  const goBack = () => {
    navigate("/dashboard");
  };

  const isTeacher = user?.role === "teacher";

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-slate-200 rounded mb-4"></div>
          <div className="h-6 w-3/4 bg-slate-200 rounded mb-6"></div>
          <div className="h-12 w-full bg-slate-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Class not found</h2>
          <p className="text-slate-500 mt-2">
            The class you're looking for doesn't exist or you don't have access.
          </p>
          <Button className="mt-6" onClick={goBack}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">{classDetails.name}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-slate-500">
          <p>Teacher: {classDetails.teacherName}</p>
          <p>Career: {classDetails.careerName}</p>
          <p>Semester: {classDetails.semester}</p>
          <p>Code: {classDetails.classCode}</p>
        </div>
        {classDetails.description && (
          <p className="mt-4 text-slate-700 dark:text-slate-300">
            {classDetails.description}
          </p>
        )}
      </div>

      <Tabs defaultValue="announcements" className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="announcements" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            Anuncios
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-1">
            <Book className="h-4 w-4" />
            Temas
          </TabsTrigger>
          {isTeacher && (
            <TabsTrigger value="students" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Alumnos
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="announcements">
          <AnnouncementsSection />
        </TabsContent>
        
        <TabsContent value="topics">
          <div className="text-center p-8 text-slate-500">
            <h3 className="text-xl font-medium mb-2">Temas Próximamente</h3>
            <p>Esta función está en desarrollo.</p>
          </div>
        </TabsContent>
        
        {isTeacher && (
          <TabsContent value="students">
            <ClassStudents />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
