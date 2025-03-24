
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import ClassCard from '@/components/ClassCard';
import AnnouncementCard from '@/components/AnnouncementCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockClasses, mockAnnouncements } from '@/utils/mockData';
import { Plus, Search, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  if (!currentUser) return null;
  
  const isTeacher = currentUser.role === 'teacher';
  
  // Filter classes based on user role
  const userClasses = isTeacher
    ? mockClasses.filter(c => c.teacherId === currentUser.id)
    : mockClasses.filter(c => c.students.includes(currentUser.id));
  
  // Get recent announcements for the user's classes
  const classIds = userClasses.map(c => c.id);
  const recentAnnouncements = mockAnnouncements
    .filter(a => classIds.includes(a.classId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  const handleJoinClass = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid class code.",
        variant: "destructive",
      });
      return;
    }
    
    const classToJoin = mockClasses.find(c => c.enrollmentCode === joinCode.trim());
    
    if (classToJoin) {
      toast({
        title: "Success!",
        description: `You've joined ${classToJoin.name}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid class code. Please check and try again.",
        variant: "destructive",
      });
    }
    
    setJoinCode('');
    setDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentUser.name}
          </p>
        </header>
        
        <Tabs defaultValue="classes">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="classes">My Classes</TabsTrigger>
              <TabsTrigger value="announcements">Recent Announcements</TabsTrigger>
            </TabsList>
            
            {!isTeacher && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Join Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Class</DialogTitle>
                    <DialogDescription>
                      Enter the class code provided by your teacher to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4 py-4">
                    <Input 
                      placeholder="Class code (e.g., ABC123)" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleJoinClass}>Join Class</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <TabsContent value="classes" className="mt-2">
            {userClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userClasses.map(classItem => (
                  <ClassCard 
                    key={classItem.id} 
                    classData={classItem} 
                    isTeacher={isTeacher} 
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Classes Yet</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    {isTeacher 
                      ? "You haven't created any classes yet. Create your first class to get started!"
                      : "You're not enrolled in any classes yet. Join a class with a class code."
                    }
                  </p>
                  <Button>
                    {isTeacher ? "Create Your First Class" : "Join a Class"}
                  </Button>
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
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Announcements</h3>
                  <p className="text-gray-500">
                    There are no recent announcements for your classes.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
