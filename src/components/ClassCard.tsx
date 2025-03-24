
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Class } from '@/utils/mockData';
import { BookOpen, Users } from 'lucide-react';

interface ClassCardProps {
  classData: Class;
  isTeacher?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, isTeacher = false }) => {
  const { id, name, section, subject, teacherName, color, students } = classData;
  
  // Calculate a contrasting text color
  const getContrastColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate brightness using the luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  const headerBgColor = color || '#4285F4';
  const headerTextColor = color ? getContrastColor(color) : '#ffffff';
  
  return (
    <Link to={`/class/${id}`} className="block no-underline">
      <Card className="h-full overflow-hidden hover-scale card-shadow border border-gray-200">
        {/* Class Header */}
        <div 
          className="p-4 h-24 flex flex-col justify-between"
          style={{ backgroundColor: headerBgColor, color: headerTextColor }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            <BookOpen className="h-5 w-5 opacity-80" />
          </div>
          
          {section && (
            <p className="opacity-90 text-sm">{section}</p>
          )}
        </div>
        
        {/* Class Details */}
        <div className="p-4 space-y-3">
          {subject && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Subject:</span> {subject}
            </p>
          )}
          
          {!isTeacher && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Teacher:</span> {teacherName}
            </p>
          )}
          
          {isTeacher && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>{students.length} students</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default ClassCard;
