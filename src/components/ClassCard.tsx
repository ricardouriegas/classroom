import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { BookOpen, Users } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  teacher_name?: string;
  students_count?: number;
  color?: string;
}

interface ClassCardProps {
  classData: ClassData;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  // If no color is provided, generate one based on the class name
  const getClassColor = () => {
    if (classData.color) return classData.color;
    
    const colors = [
      '#4285F4', // Google Blue
      '#34A853', // Google Green
      '#FBBC05', // Google Yellow
      '#EA4335', // Google Red
      '#8AB4F8', // Light Blue
      '#F6AE2D', // Yellow
      '#F26419', // Orange
      '#1B998B', // Teal
      '#2D3047', // Dark Blue
      '#7678ED', // Purple
    ];
    
    // Simple hash function to get consistent color based on class name
    const hash = classData.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    return colors[hash % colors.length];
  };

  const cardColor = getClassColor();

  return (
    <Link to={`/class/${classData.id}`} className="block h-full transition-transform hover:scale-105">
      <Card className="h-full border border-[#4c4c6d] bg-[#1E1E2F]/80 text-white overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className="h-24 flex items-center justify-center p-4 text-white font-bold text-xl text-center"
          style={{ backgroundColor: cardColor }}
        >
          {classData.name}
        </div>
        <CardContent className="pt-4">
          <div className="text-sm text-gray-400 mb-2">{classData.career_name} • {classData.semester}</div>
          {classData.description && (
            <p className="text-sm text-gray-300 line-clamp-2">{classData.description}</p>
          )}
        </CardContent>
        <CardFooter className="border-t border-[#4c4c6d] p-4 text-xs text-gray-400 flex justify-between">
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1" />
            <span>{classData.class_code}</span>
          </div>
          
          {classData.students_count !== undefined && (
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{classData.students_count} alumnos</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ClassCard;
