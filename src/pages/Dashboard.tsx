import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TeacherDashboard from '@/components/TeacherDashboard';
import StudentDashboard from '@/components/StudentDashboard';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
        <Navbar />
        <div className="container mx-auto py-10 px-4">
          <Skeleton className="h-10 w-64 mb-6 bg-[#2f2f42]" />
          <Skeleton className="h-6 w-48 mb-10 bg-[#2f2f42]" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl bg-[#2f2f42]" />
            <Skeleton className="h-64 rounded-xl bg-[#2f2f42]" />
            <Skeleton className="h-64 rounded-xl bg-[#2f2f42]" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Si no hay usuario, ProtectedRoute se encargará del redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#302B63] to-[#1E1E2F] text-white">
      <Navbar />
      
      {currentUser.role === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
};

export default Dashboard;
