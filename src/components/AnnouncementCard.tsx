
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Announcement } from '@/utils/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const { title, content, authorName, authorAvatar, createdAt } = announcement;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="font-medium">{authorName}</div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 whitespace-pre-line">{content}</p>
      </CardContent>
    </Card>
  );
};

export default AnnouncementCard;
