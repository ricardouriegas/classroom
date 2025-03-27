import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Mail, X, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  enrollment_date: string;
}

interface InvitationResponse {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

interface ClassStudentsProps {
  classId: string;
}

const ClassStudents: React.FC<ClassStudentsProps> = ({ classId }) => {
  const params = useParams<{ id: string }>();
  const effectiveClassId = classId || params.id;
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<InvitationResponse[]>([]);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    if (!effectiveClassId) return;
    
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/classes/${effectiveClassId}/students`);
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estudiantes. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchInvitations = async () => {
      try {
        const response = await api.get(`/classes/${effectiveClassId}/invitations`);
        setPendingInvitations(response.data.filter((inv: InvitationResponse) => inv.status === 'pending'));
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchStudents();
    fetchInvitations();
  }, [effectiveClassId, toast]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (student) =>
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInviteStudent = async () => {
    if (!inviteEmail.trim() || !effectiveClassId) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, ingresa una dirección de correo electrónico válida.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsInviting(true);
      
      const response = await api.post(`/classes/${effectiveClassId}/invite`, {
        email: inviteEmail,
      });
      
      setPendingInvitations([...pendingInvitations, response.data]);
      
      toast({
        title: 'Invitación enviada',
        description: `Se ha enviado una invitación a ${inviteEmail}.`,
      });
      
      setInviteEmail('');
      setShowInviteDialog(false);
      setActiveTab('invitations');
    } catch (error: any) {
      console.error('Error inviting student:', error);
      
      // Handle specific error cases
      if (error.response?.data?.error?.code === 'USER_ALREADY_ENROLLED') {
        toast({
          title: 'Usuario ya inscrito',
          description: 'Este estudiante ya está inscrito en la clase.',
          variant: 'destructive',
        });
      } else if (error.response?.data?.error?.code === 'INVITATION_ALREADY_SENT') {
        toast({
          title: 'Invitación ya enviada',
          description: 'Ya se ha enviado una invitación a este correo electrónico.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo enviar la invitación. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!effectiveClassId) return;
    
    try {
      await api.delete(`/classes/${effectiveClassId}/invitations/${invitationId}`);
      
      // Remove the invitation from the list
      setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: 'Invitación cancelada',
        description: 'La invitación ha sido cancelada correctamente.',
      });
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la invitación. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    if (!effectiveClassId) return;
    
    try {
      await api.post(`/classes/${effectiveClassId}/invitations/${invitationId}/resend`);
      
      toast({
        title: 'Invitación reenviada',
        description: 'La invitación ha sido reenviada correctamente.',
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo reenviar la invitación. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!effectiveClassId) return;
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar a este estudiante de la clase?')) {
      return;
    }
    
    try {
      await api.delete(`/classes/${effectiveClassId}/students/${studentId}`);
      
      // Remove the student from the list
      setStudents(students.filter(student => student.id !== studentId));
      
      toast({
        title: 'Estudiante eliminado',
        description: 'El estudiante ha sido eliminado de la clase correctamente.',
      });
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar al estudiante. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-2">
            <CardContent className="p-4 flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-4" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="students" className="relative">
              Estudiantes
              <Badge className="ml-2 bg-primary text-white">{students.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="relative">
              Invitaciones
              {pendingInvitations.length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white">{pendingInvitations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            Invitar Estudiante
          </Button>
        </div>
        
        <TabsContent value="students" className="space-y-4">
          {students.length > 0 ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Card key={student.id} className="mb-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={student.avatar_url} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Inscrito el {formatDate(student.enrollment_date)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No se encontraron estudiantes con esa búsqueda.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No hay estudiantes inscritos</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Aún no hay estudiantes inscritos en esta clase. Invita a tus estudiantes para comenzar.
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                Invitar Estudiantes
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-4">
          {pendingInvitations.length > 0 ? (
            pendingInvitations.map((invitation) => (
              <Card key={invitation.id} className="mb-2">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-4 text-amber-500" />
                    <div>
                      <h3 className="font-medium">{invitation.email}</h3>
                      <p className="text-sm text-gray-500">
                        Enviada el {formatDate(invitation.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pendiente
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResendInvitation(invitation.id)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No hay invitaciones pendientes</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                No hay invitaciones pendientes para esta clase.
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                Invitar Estudiantes
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Invite Student Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Estudiante</DialogTitle>
            <DialogDescription>
              Envía una invitación por correo electrónico para que un estudiante se una a esta clase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="estudiante@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              <p>
                Si el estudiante no tiene una cuenta, se le invitará a crear una.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              disabled={isInviting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleInviteStudent}
              disabled={!inviteEmail.trim() || isInviting}
            >
              {isInviting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassStudents;
