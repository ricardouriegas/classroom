
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Attachment, Announcement } from "@/utils/mockData";
import AnnouncementForm from "./AnnouncementForm";
import { useAuth } from "@/context/AuthContext";

export default function AnnouncementsSection() {
  const { id: classId } = useParams<{ id: string }>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/announcements/class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Could not load announcements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchAnnouncements();
    }
  }, [classId]);

  const handleAnnouncementCreated = () => {
    setShowForm(false);
    fetchAnnouncements();
    toast({
      title: "Success",
      description: "Announcement created successfully",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnnouncements}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          {user?.role === "teacher" && (
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {showForm ? "Cancel" : "Create Announcement"}
            </Button>
          )}
        </div>
      </div>
      
      {/* Announcement Form */}
      {showForm && (
        <AnnouncementForm onAnnouncementCreated={handleAnnouncementCreated} />
      )}
      
      {/* Announcements List */}
      {isLoading ? (
        <div className="text-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-400" />
          <p className="mt-2 text-slate-500">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <p>No announcements for this class yet.</p>
          {user?.role === "teacher" && !showForm && (
            <Button
              className="mt-4"
              onClick={() => setShowForm(true)}
            >
              Create First Announcement
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {announcement.authorAvatar ? (
                    <img
                      src={announcement.authorAvatar}
                      alt={announcement.authorName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {announcement.authorName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <p>{announcement.authorName}</p>
                    <span className="mx-1">•</span>
                    <p>{formatDate(announcement.createdAt.toString())}</p>
                  </div>
                  <div className="mt-3 prose prose-sm max-w-none">
                    <p>{announcement.content}</p>
                  </div>
                  
                  {/* Attachments */}
                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="bg-slate-100 px-3 py-2 text-sm font-medium">
                        Attachments ({announcement.attachments.length})
                      </div>
                      <ul className="divide-y">
                        {announcement.attachments.map((attachment: Attachment) => (
                          <li
                            key={attachment.id}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{attachment.fileName}</span>
                              <span className="text-xs text-slate-500">
                                ({(attachment.fileSize / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_API_URL}${attachment.fileUrl}`}
                              download={attachment.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
