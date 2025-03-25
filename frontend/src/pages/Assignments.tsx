
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockClasses, mockAssignments } from '@/utils/mockData';
import { format, isPast, isToday, isTomorrow, isWithinInterval, addDays } from 'date-fns';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Assignments = () => {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'missing' | 'done'>('all');
  
  if (!currentUser) return null;
  
  const isTeacher = currentUser.role === 'teacher';
  
  // Get classes for the current user
  const userClasses = isTeacher
    ? mockClasses.filter(c => c.teacherId === currentUser.id)
    : mockClasses.filter(c => c.students.includes(currentUser.id));
  
  const userClassIds = userClasses.map(c => c.id);
  
  // Get assignments for the user's classes
  const allAssignments = mockAssignments.filter(a => userClassIds.includes(a.classId));
  
  // Filter assignments based on the active tab
  const filteredAssignments = (() => {
    switch (activeFilter) {
      case 'upcoming':
        return allAssignments.filter(a => {
          return isWithinInterval(new Date(a.dueDate), {
            start: new Date(),
            end: addDays(new Date(), 7)
          });
        });
      case 'missing':
        return allAssignments.filter(a => {
          return isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate));
        });
      case 'done':
        // For demo, let's pretend some are done
        return allAssignments.slice(0, 2);
      default:
        return allAssignments;
    }
  })();
  
  // Sort assignments by due date (closest first)
  const sortedAssignments = filteredAssignments.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Group assignments by class
  const assignmentsByClass = sortedAssignments.reduce((acc, assignment) => {
    const classId = assignment.classId;
    if (!acc[classId]) {
      acc[classId] = [];
    }
    acc[classId].push(assignment);
    return acc;
  }, {} as Record<string, typeof sortedAssignments>);
  
  // Get class data by ID
  const getClassById = (classId: string) => {
    return mockClasses.find(c => c.id === classId);
  };
  
  // Get due date status text and color
  const getDueDateStatus = (dueDate: Date) => {
    const now = new Date();
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return {
        text: "Past due",
        color: "text-red-500",
        icon: <AlertCircle className="h-4 w-4 mr-1" />
      };
    }
    
    if (isToday(dueDate)) {
      return {
        text: "Due today",
        color: "text-orange-500",
        icon: <Clock className="h-4 w-4 mr-1" />
      };
    }
    
    if (isTomorrow(dueDate)) {
      return {
        text: "Due tomorrow",
        color: "text-yellow-500",
        icon: <Clock className="h-4 w-4 mr-1" />
      };
    }
    
    return {
      text: `Due ${format(dueDate, 'MMM d')}`,
      color: "text-green-500",
      icon: <Calendar className="h-4 w-4 mr-1" />
    };
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">
            {isTeacher 
              ? "Manage and track your class assignments" 
              : "View and submit your assignments"
            }
          </p>
        </header>
        
        <Tabs 
          defaultValue="all"
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as typeof activeFilter)}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="missing">Missing</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeFilter} className="animate-fade-in">
            {Object.keys(assignmentsByClass).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(assignmentsByClass).map(([classId, assignments]) => {
                  const classData = getClassById(classId);
                  if (!classData) return null;
                  
                  return (
                    <div key={classId}>
                      <div className="flex items-center mb-3">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: classData.color }}
                        ></div>
                        <h2 className="text-lg font-medium">{classData.name}</h2>
                      </div>
                      
                      <div className="space-y-3">
                        {assignments.map(assignment => {
                          const status = getDueDateStatus(new Date(assignment.dueDate));
                          
                          return (
                            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                      <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-lg">{assignment.title}</h3>
                                      <p className="text-gray-500 text-sm truncate">{assignment.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-4 md:mt-0">
                                    <div className={`flex items-center text-sm ${status.color}`}>
                                      {status.icon}
                                      <span>{status.text}</span>
                                    </div>
                                    
                                    <Button size="sm" asChild>
                                      <Link to={`/class/${classId}/assignment/${assignment.id}`}>
                                        {isTeacher ? "View" : 
                                          activeFilter === 'done' ? "View Feedback" : "Open"
                                        }
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Assignments</h3>
                  <p className="text-gray-500 max-w-md">
                    {activeFilter === 'all'
                      ? `${isTeacher ? "You haven't created" : "You don't have"} any assignments yet.`
                      : `You don't have any ${activeFilter} assignments.`
                    }
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

export default Assignments;
