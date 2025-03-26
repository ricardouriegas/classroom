export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavLink extends Omit<NavItem, "href"> {
  href: string;
}

export interface MainNavItem extends NavLink {}

export interface SidebarNavItem extends NavItem {}

export interface Class {
  id: string;
  name: string;
  description?: string;
  class_code: string;
  career_id: string;
  career_name: string;
  semester: string;
  teacher_id: string;
  students_count?: number;
  created_at: string;
}

export interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

// Announcement types
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  attachments: Attachment[];
  createdAt: Date | string;
}

export const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the class",
    content: "Hello everyone! Welcome to this class. I'm excited to have you all here. We're going to learn a lot together this semester.",
    authorId: "teacher-1",
    authorName: "Prof. Smith",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    attachments: [
      {
        id: "att-1",
        fileName: "syllabus.pdf",
        fileSize: 2048,
        fileType: "application/pdf",
        fileUrl: "/uploads/syllabus.pdf"
      }
    ],
    createdAt: new Date(2023, 5, 15)
  },
  {
    id: "2",
    title: "First assignment posted",
    content: "I've just posted the first assignment. Please check the assignments section and let me know if you have any questions.",
    authorId: "teacher-1",
    authorName: "Prof. Smith",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    attachments: [],
    createdAt: new Date(2023, 5, 18)
  }
];
