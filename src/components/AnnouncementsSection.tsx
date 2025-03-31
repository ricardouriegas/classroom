import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import AnnouncementCard from '@/components/AnnouncementCard';
import AnnouncementForm from '@/components/AnnouncementForm';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
  }>;
  createdAt: string;
}

const AnnouncementsSection = () => {
  const { id: classId } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los anuncios.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, [classId, toast]);

  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    toast({
      title: 'Éxito',
      description: 'El anuncio fue creado correctamente.',
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
      {/* Mostrar formulario primero */}
      {showForm && isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Anuncio</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementForm
              classId={classId!}
              onAnnouncementCreated={handleAnnouncementCreated}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Botón de crear anuncio */}
      {isTeacher && (
        <div className="flex justify-start">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1"
            variant={showForm ? 'outline' : 'default'}
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

      {/* Lista de anuncios */}
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
                ? 'Aún no has publicado ningún anuncio. ¡Comienza con el primero!'
                : 'Todavía no hay anuncios disponibles para esta clase.'}
            </p>
            {isTeacher && !showForm && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
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
