import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  due_date: string;
  topic_id: string;
  topic_name: string;
  class_id: string;
  class_name: string;
  status?: 'pending' | 'submitted' | 'graded';
  grade?: number;
  submitted_at?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es });
};

const getStatusInfo = (assignment: Assignment) => {
  if (assignment.status === 'graded') {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      text: 'Calificada',
      color: 'bg-green-100 text-green-800',
      grade: assignment.grade
    };
  }
  
  if (assignment.status === 'submitted') {
    return {
      icon: <Check className="h-5 w-5 text-blue-500" />,
      text: 'Entregada',
      color: 'bg-blue-100 text-blue-800'
    };
  }

  // Is pending
  const dueDate = new Date(assignment.due_date);
  const isOverdue = isPast(dueDate);
  
  if (isOverdue) {
    return {
      icon: <X className="h-5 w-5 text-red-500" />,
      text: 'No entregada',
      color: 'bg-red-100 text-red-800'
    };
  }
  
  return {
    icon: <Clock className="h-5 w-5 text-yellow-500" />,
    text: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800'
  };
};

interface StudentAssignmentCardProps {
  assignment: Assignment;
  showClass?: boolean;
}

const StudentAssignmentCard: React.FC<StudentAssignmentCardProps> = ({ assignment, showClass = false }) => {
  const navigate = useNavigate();
  const statusInfo = getStatusInfo(assignment);
  const dueDate = new Date(assignment.due_date);
  const isOverdue = isPast(dueDate);

  const handleClick = () => {
    navigate(`/class/${assignment.class_id}`);
  };
  
  return (
    <Card className="h-full transition-all hover:shadow-md bg-[#1E1E2F]/80 border border-[#4c4c6d] text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-white">{assignment.title}</CardTitle>
            <CardDescription>
              {showClass && (
                <span className="block text-[#00ffc3]">{assignment.class_name}</span>
              )}
              <span className="block text-gray-400">Tema: {assignment.topic_name}</span>
            </CardDescription>
          </div>
          <Badge className={statusInfo.color}>
            <span className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.text}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <p className="text-gray-300 line-clamp-1">
              {assignment.instructions.substring(0, 70)}
              {assignment.instructions.length > 70 ? '...' : ''}
            </p>
          </div>
          
          <div className="text-sm text-gray-300">
            <p className={isOverdue ? 'text-red-400 font-semibold' : ''}>
              Fecha límite: {formatDate(assignment.due_date)}
            </p>
            
            {statusInfo.grade !== undefined && (
              <p className="mt-1 font-semibold text-[#00ffc3]">
                Calificación: {statusInfo.grade}/100
              </p>
            )}
          </div>
          
          <Button 
            variant={isOverdue && assignment.status !== 'submitted' && assignment.status !== 'graded' ? 'outline' : 'default'} 
            className={`w-full mt-2 ${
              isOverdue && assignment.status !== 'submitted' && assignment.status !== 'graded' 
                ? 'border-[#4c4c6d] text-gray-400' 
                : 'bg-[#00ffc3] text-[#1E1E2F] hover:bg-[#00ffc3]/90'
            }`}
            onClick={handleClick}
            disabled={isOverdue && assignment.status !== 'submitted' && assignment.status !== 'graded'}
          >
            {assignment.status === 'graded' 
              ? 'Ver calificación' 
              : assignment.status === 'submitted'
                ? 'Ver entrega'
                : isOverdue 
                  ? 'Fecha límite expirada' 
                  : 'Ver tarea'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAssignmentCard;
