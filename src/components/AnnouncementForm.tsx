
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementFormProps {
  onAnnouncementCreated: () => void;
}

export default function AnnouncementForm({ onAnnouncementCreated }: AnnouncementFormProps) {
  const { id: classId } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check if adding these files would exceed the limit
      if (files.length + newFiles.length > 5) {
        toast({
          title: "File Limit Exceeded",
          description: "You can upload a maximum of 5 files per announcement",
          variant: "destructive",
        });
        return;
      }
      
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your announcement",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide content for your announcement",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("class_id", classId || "");
      formData.append("title", title);
      formData.append("content", content);
      
      // Append files if any
      files.forEach((file) => {
        formData.append("attachments", file);
      });
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Reset form
      setTitle("");
      setContent("");
      setFiles([]);
      
      // Notify parent component to refresh announcements
      onAnnouncementCreated();
      
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "Could not create announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement here..."
              rows={5}
              disabled={isSubmitting}
            />
          </div>
          
          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Attachments (Optional)
            </label>
            
            <div className="mt-1 mb-3">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || files.length >= 5}
              >
                <Upload className="h-4 w-4" />
                {files.length === 0 ? "Add files" : "Add more files"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={isSubmitting || files.length >= 5}
              />
              <p className="text-xs text-slate-500 mt-1">
                Up to 5 files, max 10MB each
              </p>
            </div>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="border rounded-md overflow-hidden mt-2">
                <div className="bg-slate-100 px-3 py-2 text-sm font-medium">
                  Attachments ({files.length}/5)
                </div>
                <ul className="divide-y">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Post Announcement"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
