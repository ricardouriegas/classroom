
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ClipboardCheck, Clock } from 'lucide-react';

interface AssignmentProps {
  id: string;
  title: string;
  className: string;
  classId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'expired';
  showClass?: boolean;
  onClickView?: () => void;
}

const StudentAssignmentCard: React.FC<AssignmentProps> = ({
  id,
  title,
  className,
  classId,
  dueDate,
  status,
  showClass = true,
  onClickView
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate: string): string => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Vencida';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} día${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}`;
    }
    
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} restante${diffHours > 1 ? 's' : ''}`;
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${
        status === 'expired' ? 'border-red-200 bg-red-50' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {status === 'expired' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : status === 'submitted' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <ClipboardCheck className="h-5 w-5 text-blue-500" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {showClass && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">Clase:</span> {className}
            </p>
          )}
          
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span className={status === 'expired' ? 'text-red-500' : 'text-gray-500'}>
              {status === 'expired' 
                ? `Vencido el ${formatDate(dueDate)}` 
                : status === 'submitted'
                ? `Entregado para ${formatDate(dueDate)}`
                : `Vence el ${formatDate(dueDate)} (${getTimeRemaining(dueDate)})`}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={status === 'expired' ? "outline" : "default"} 
          size="sm" 
          className="ml-auto"
          disabled={status === 'expired' && !onClickView}
          onClick={onClickView}
          asChild={!onClickView}
        >
          {onClickView ? (
            <span>{status === 'expired' ? 'Ver Detalles' : status === 'submitted' ? 'Modificar Entrega' : 'Entregar'}</span>
          ) : (
            <Link to={`/class/${classId}`}>
              {status === 'expired' ? 'Ver Detalles' : 'Entregar'}
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentAssignmentCard;
