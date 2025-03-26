
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

// Mock data for the assignments page
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
    description: 'Learn about variables and their types in programming'
  },
  { 
    id: 'a2', 
    title: 'Database Design', 
    classId: 'class2',
    className: 'Web Development',
    dueDate: new Date(2023, 5, 18), 
    status: 'pending',
    description: 'Create a database schema for a social media application'
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
    description: 'Implement a doubly linked list with all operations'
  },
];

const Assignments = () => {
  const { currentUser, isLoading } = useAuth();

  // Filter assignments based on status
  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending');
  const completedAssignments = mockAssignments.filter(a => a.status === 'completed');
  const lateAssignments = mockAssignments.filter(a => a.status === 'late');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // User is not authenticated, they'll be redirected by the protected route
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">View and manage your assignments across all classes</p>
        </header>

        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="late">
              Late ({lateAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {pendingAssignments.length > 0 ? (
              pendingAssignments.map(assignment => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.className}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assignment.dueDate.toLocaleDateString()}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">View Details</Button>
                    <Button>Submit Assignment</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No pending assignments!</h3>
                  <p className="text-gray-500">You're all caught up. Check back later for new assignments.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedAssignments.length > 0 ? (
              completedAssignments.map(assignment => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.className}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Grade: {assignment.grade}/100
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {assignment.dueDate.toLocaleDateString()}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline">View Details</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No completed assignments</h3>
                  <p className="text-gray-500">You haven't completed any assignments yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="late" className="space-y-6">
            {lateAssignments.length > 0 ? (
              lateAssignments.map(assignment => (
                <Card key={assignment.id} className="border-red-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.className}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-500 border-red-200">
                        <Clock className="h-3 w-3" />
                        Due: {assignment.dueDate.toLocaleDateString()}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">View Details</Button>
                    <Button variant="destructive">Submit Late</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No late assignments!</h3>
                  <p className="text-gray-500">Good job keeping up with your assignments.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Assignments;
