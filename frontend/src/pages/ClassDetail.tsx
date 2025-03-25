
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import AnnouncementCard from '@/components/AnnouncementCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { mockClasses, mockAnnouncements, mockAssignments } from '@/utils/mockData';
import { 
  BookOpen, 
  Users, 
  Megaphone, 
  Plus, 
  FileText, 
  Calendar 
} from 'lucide-react';
import { format } from 'date-fns';

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  if (!currentUser || !id) return null;
  
  // Find the class
  const classData = mockClasses.find(c => c.id === id);
  if (!classData) return <div>Class not found</div>;
  
  // Get announcements and assignments for this class
  const classAnnouncements = mockAnnouncements
    .filter(a => a.classId === id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  const classAssignments = mockAssignments
    .filter(a => a.classId === id)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  
  const isTeacher = currentUser.role === 'teacher';
  const isClassTeacher = isTeacher && classData.teacherId === currentUser.id;
  
  const handlePostAnnouncement = () => {
    if (!announcement.trim()) {
      toast({
        title: "Error",
        description: "Please enter an announcement.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success!",
      description: "Your announcement has been posted.",
    });
    
    setAnnouncement('');
    setDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Class Header */}
        <Card 
          className="mb-8 border-none overflow-hidden"
          style={{ backgroundColor: classData.color }}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-white mb-1">{classData.name}</h1>
                <p className="text-white/90">
                  {classData.section}{classData.subject ? ` · ${classData.subject}` : ''}
                </p>
              </div>
              
              <div className="flex items-center text-white/90">
                <Users className="mr-2 h-5 w-5" />
                <span>{classData.students.length} students</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Teacher-only actions */}
        {isClassTeacher && (
          <div className="flex justify-end gap-4 mb-8">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Megaphone className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post Announcement</DialogTitle>
                  <DialogDescription>
                    Create a new announcement for your class.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-4 py-4">
                  <Textarea 
                    placeholder="Share information or updates with your class..."
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handlePostAnnouncement}>Post</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button asChild>
              <Link to={`/class/${id}/create-assignment`} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
          </div>
        )}
        
        {/* Class Content */}
        <Tabs defaultValue="stream">
          <TabsList className="mb-4">
            <TabsTrigger value="stream">Stream</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stream" className="animate-fade-in">
            {classAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {classAnnouncements.map(announcement => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                  <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Announcements</h3>
                  <p className="text-gray-500">
                    {isClassTeacher 
                      ? "Post an announcement to communicate with your students."
                      : "There are no announcements for this class yet."
                    }
                  </p>
                  {isClassTeacher && (
                    <Button onClick={() => setDialogOpen(true)} className="mt-4">
                      Post Announcement
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="assignments" className="animate-fade-in">
            {classAssignments.length > 0 ? (
              <div className="space-y-4">
                {classAssignments.map(assignment => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{assignment.title}</h3>
                          <p className="text-gray-500 text-sm truncate">{assignment.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due {format(new Date(assignment.dueDate), 'MMM d')}</span>
                        </div>
                        
                        <Button size="sm" asChild>
                          <Link to={`/class/${id}/assignment/${assignment.id}`}>
                            {isTeacher ? "View" : "Open"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Assignments</h3>
                  <p className="text-gray-500">
                    {isClassTeacher
                      ? "Create assignments for your students."
                      : "There are no assignments for this class yet."
                    }
                  </p>
                  {isClassTeacher && (
                    <Button asChild className="mt-4">
                      <Link to={`/class/${id}/create-assignment`}>
                        Create Assignment
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="people" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  People
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y">
                  <div className="py-4">
                    <h3 className="font-medium mb-3">Teacher</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <span>{classData.teacherName}</span>
                    </div>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Students ({classData.students.length})</h3>
                      {isClassTeacher && (
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Invite Students
                        </Button>
                      )}
                    </div>
                    
                    {classData.students.length > 0 ? (
                      <div className="space-y-3">
                        {classData.students.map((studentId, index) => (
                          <div key={studentId} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                              {index + 1}
                            </div>
                            <span>Student {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No students enrolled yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClassDetail;
