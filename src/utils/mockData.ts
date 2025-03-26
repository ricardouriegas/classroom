
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
  // Added property for UI color
  color?: string;
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

// New Assignment interface
export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date | string;
  classId: string;
  className?: string;
  status?: 'pending' | 'submitted' | 'expired';
  submissionDate?: Date | string;
  submissionFiles?: Attachment[];
  grade?: number;
  feedback?: string;
}

// New mock data exports:
export const mockClasses: Class[] = [
  {
    id: "class1",
    name: "Mathematics",
    description: "Math class description",
    class_code: "MATH101",
    career_id: "C1",
    career_name: "Science",
    semester: "Fall 2023",
    teacher_id: "teacher-1",
    students_count: 20,
    created_at: "2023-01-01",
    color: "#4285F4"
  },
  {
    id: "class2",
    name: "Physics",
    description: "Physics class description",
    class_code: "PHY101",
    career_id: "C2",
    career_name: "Science",
    semester: "Spring 2023",
    teacher_id: "teacher-1",
    students_count: 15,
    created_at: "2023-02-01",
    color: "#34A853"
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: "assign1",
    title: "Assignment 1",
    description: "Do math homework",
    dueDate: new Date(2023, 5, 1),
    classId: "class1",
    className: "Mathematics",
    status: "pending"
  },
  {
    id: "assign2",
    title: "Assignment 2",
    description: "Complete physics experiment",
    dueDate: new Date(2023, 5, 5),
    classId: "class2",
    className: "Physics",
    status: "submitted",
    submissionDate: new Date(2023, 4, 30)
  },
  {
    id: "assign3",
    title: "Assignment 3",
    description: "Complete calculus problems",
    dueDate: new Date(2023, 4, 25),
    classId: "class1",
    className: "Mathematics",
    status: "expired"
  }
];

// Mock topic interface
export interface Topic {
  id: string;
  name: string;
  description?: string;
  class_id: string;
  order_index: number;
  materials_count: number;
  assignments_count: number;
}

// Mock material interface
export interface Material {
  id: string;
  title: string;
  description?: string;
  topic_id: string;
  created_at: string;
  attachments: Attachment[];
}

// Mock student submission interface
export interface StudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  submission_date: string;
  files: Attachment[];
  grade?: number;
  feedback?: string;
}
