
import React, { useState, useEffect } from 'react';
import { useParams, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Users, FileText, Layers, BookOpen } from 'lucide-react';
import StudentsSection from '@/components/StudentsSection';
import AnnouncementsSection from '@/components/AnnouncementsSection';

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  teacher_name: string;
}

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/classes/${id}`);
        setClassDetails(response.data);
      } catch (error) {
        console.error('Error fetching class details:', error);
        toast({
          title: 'Error',
          description: 'Could not load class details. Please try again.',
          variant: 'destructive',
        });
        // Navigate back to dashboard if class not found
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClassDetails();
    }
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Not Found</h2>
              <p className="text-gray-600 mb-6">The class you're looking for doesn't exist or you don't have access to it.</p>
              <Button asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <ChevronLeft className="h-4 w-4 mr-1 inline" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{classDetails.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Class Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
          <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-gray-600">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{classDetails.career_name}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Teacher: {classDetails.teacher_name}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>Code: {classDetails.class_code}</span>
            </div>
            <div className="flex items-center">
              <Layers className="h-4 w-4 mr-1" />
              <span>Semester: {classDetails.semester}</span>
            </div>
          </div>
          {classDetails.description && (
            <p className="mt-4 text-gray-600 max-w-3xl">{classDetails.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4">
            <AnnouncementsSection />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Course materials and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content section is under development.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>Course assignments and homework</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Assignments section is under development.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <StudentsSection classId={id!} isTeacher={currentUser?.role === 'teacher'} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClassDetail;
