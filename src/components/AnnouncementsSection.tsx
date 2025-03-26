
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import AnnouncementCard from '@/components/AnnouncementCard';
import AnnouncementForm from '@/components/AnnouncementForm';

const AnnouncementsSection = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isTeacher = currentUser?.role === 'teacher';

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!classId) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/announcements/class/${classId}`);
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los anuncios. Por favor, inténtelo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [classId, toast]);

  const handleAnnouncementCreated = (newAnnouncement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    toast({
      title: 'Éxito',
      description: 'El anuncio se ha creado correctamente.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-1"
          >
            {showForm ? 'Cancelar' : (
              <>
                <Plus className="h-4 w-4" />
                Crear Anuncio
              </>
            )}
          </Button>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nuevo Anuncio</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm 
              classId={classId} 
              onAnnouncementCreated={handleAnnouncementCreated} 
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay anuncios</h3>
            <p className="text-gray-500 max-w-md">
              {isTeacher 
                ? 'No has creado ningún anuncio para esta clase. ¡Crea el primero!'
                : 'No hay anuncios disponibles para esta clase.'}
            </p>
            {isTeacher && (
              <Button 
                onClick={() => setShowForm(true)} 
                className="mt-4"
              >
                Crear Primer Anuncio
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnnouncementsSection;
