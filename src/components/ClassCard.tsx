
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Class {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  teacher_name?: string;
}

interface ClassCardProps {
  classData: Class;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  // Generate a color based on class name (for consistent visual identity)
  const getClassColor = (className: string): string => {
    const colors = [
      '#4285F4', // Blue
      '#34A853', // Green
      '#FBBC05', // Yellow
      '#EA4335', // Red
      '#8E24AA', // Purple
      '#16A2B8', // Teal
      '#FF7043', // Deep Orange
      '#6B7280', // Gray
    ];
    
    // Simple hash function to get consistent color for same class name
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getClassColor(classData.name);

  return (
    <Link to={`/class/${classData.id}`} className="block hover:no-underline">
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
        <div 
          className="p-4 h-24 flex flex-col justify-between"
          style={{ backgroundColor: bgColor, color: '#ffffff' }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{classData.name}</h3>
            <BookOpen className="h-5 w-5 opacity-80" />
          </div>
          
          <p className="opacity-90 text-sm">{classData.semester}</p>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Carrera:</span> {classData.career_name}
          </p>
          
          <p className="text-sm text-gray-600">
            <span className="font-medium">Código:</span> {classData.class_code}
          </p>
          
          {classData.teacher_name && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Maestro:</span> {classData.teacher_name}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClassCard;
