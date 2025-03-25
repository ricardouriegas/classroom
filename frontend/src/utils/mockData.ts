
import { User, UserRole } from '../context/AuthContext';

// Class (Course) type
export interface Class {
  id: string;
  name: string;
  section?: string;
  subject?: string;
  teacherId: string;
  teacherName: string;
  description?: string;
  coverImage?: string;
  color?: string;
  enrollmentCode: string;
  students: string[]; // Array of student IDs
  createdAt: Date;
}

// Announcement type
export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
}

// Assignment type
export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  createdAt: Date;
  attachments?: Attachment[];
}

// Submission type
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  status: 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  attachments?: Attachment[];
}

// Attachment type
export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

// Comment type
export interface Comment {
  id: string;
  parentId: string; // ID of the announcement, assignment, or submission this comment belongs to
  parentType: 'announcement' | 'assignment' | 'submission';
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  createdAt: Date;
}

// Mock teachers
export const mockTeachers: User[] = [
  {
    id: 't1',
    name: 'Dr. Alex Johnson',
    email: 'teacher@example.com',
    role: 'teacher',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 't2',
    name: 'Prof. Sarah Williams',
    email: 'sarah@example.com',
    role: 'teacher',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
];

// Mock students
export const mockStudents: User[] = [
  {
    id: 's1',
    name: 'Emma Davis',
    email: 'student@example.com',
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 's2',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 's3',
    name: 'Sophia Martinez',
    email: 'sophia@example.com',
    role: 'student',
    avatar: 'https://i.pravatar.cc/150?img=25',
  },
];

// Color options for class cards
export const classColors = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC05', // Yellow
  '#EA4335', // Red
  '#8E24AA', // Purple
  '#16A2B8', // Teal
  '#FF7043', // Deep Orange
  '#6B7280', // Gray
];

// Mock classes
export const mockClasses: Class[] = [
  {
    id: 'c1',
    name: 'Introduction to Computer Science',
    section: 'CS101',
    subject: 'Computer Science',
    teacherId: 't1',
    teacherName: 'Dr. Alex Johnson',
    description: 'An introductory course to computer science concepts and programming fundamentals.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
    color: classColors[0],
    enrollmentCode: 'CS101-2024',
    students: ['s1', 's2', 's3'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'c2',
    name: 'Advanced Mathematics',
    section: 'MATH202',
    subject: 'Mathematics',
    teacherId: 't2',
    teacherName: 'Prof. Sarah Williams',
    description: 'An advanced course exploring complex mathematical concepts and their applications.',
    color: classColors[1],
    enrollmentCode: 'MATH202-2024',
    students: ['s1', 's3'],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'c3',
    name: 'Web Development Fundamentals',
    section: 'WEB101',
    subject: 'Computer Science',
    teacherId: 't1',
    teacherName: 'Dr. Alex Johnson',
    description: 'Learn the basics of web development, including HTML, CSS, and JavaScript.',
    color: classColors[2],
    enrollmentCode: 'WEB101-2024',
    students: ['s2'],
    createdAt: new Date('2024-02-01'),
  },
];

// Mock announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    classId: 'c1',
    title: 'Welcome to CS101!',
    content: 'Hello everyone, welcome to Introduction to Computer Science! I\'m excited to have you all in this class. Please review the syllabus and come prepared for our first lecture.',
    authorId: 't1',
    authorName: 'Dr. Alex Johnson',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    createdAt: new Date('2024-01-16T09:00:00'),
  },
  {
    id: 'a2',
    classId: 'c1',
    title: 'Assignment 1 Posted',
    content: 'The first assignment has been posted. Please check the Assignments section. Due date is next Friday.',
    authorId: 't1',
    authorName: 'Dr. Alex Johnson',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    createdAt: new Date('2024-01-20T14:30:00'),
  },
  {
    id: 'a3',
    classId: 'c2',
    title: 'Welcome to Advanced Mathematics',
    content: 'Welcome to Advanced Mathematics! Our first session will be on Monday. Please bring your graphing calculators.',
    authorId: 't2',
    authorName: 'Prof. Sarah Williams',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    createdAt: new Date('2024-01-21T10:15:00'),
  },
];

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'as1',
    classId: 'c1',
    title: 'Algorithm Basics',
    description: 'Implement three different sorting algorithms and compare their performance.',
    dueDate: new Date('2024-02-05T23:59:59'),
    points: 100,
    createdAt: new Date('2024-01-20T14:00:00'),
  },
  {
    id: 'as2',
    classId: 'c1',
    title: 'Programming Fundamentals Quiz',
    description: 'Complete the online quiz about programming fundamentals. You have one attempt.',
    dueDate: new Date('2024-01-30T23:59:59'),
    points: 50,
    createdAt: new Date('2024-01-22T09:30:00'),
  },
  {
    id: 'as3',
    classId: 'c2',
    title: 'Calculus Problem Set',
    description: 'Complete problems 1-20 from Chapter 3.',
    dueDate: new Date('2024-02-10T23:59:59'),
    points: 100,
    createdAt: new Date('2024-01-25T11:00:00'),
  },
];

// Mock submissions
export const mockSubmissions: Submission[] = [
  {
    id: 'sub1',
    assignmentId: 'as1',
    studentId: 's1',
    studentName: 'Emma Davis',
    submittedAt: new Date('2024-02-03T15:45:00'),
    status: 'submitted',
  },
  {
    id: 'sub2',
    assignmentId: 'as2',
    studentId: 's1',
    studentName: 'Emma Davis',
    submittedAt: new Date('2024-01-28T20:10:00'),
    status: 'graded',
    grade: 45,
    feedback: 'Good work, but there were a few misunderstandings about loops.',
  },
];

// Mock comments
export const mockComments: Comment[] = [
  {
    id: 'com1',
    parentId: 'a1',
    parentType: 'announcement',
    content: 'Thank you for the welcome! Looking forward to the class.',
    authorId: 's1',
    authorName: 'Emma Davis',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    createdAt: new Date('2024-01-16T10:30:00'),
  },
  {
    id: 'com2',
    parentId: 'as1',
    parentType: 'assignment',
    content: 'Is it okay to use external libraries for the implementations?',
    authorId: 's2',
    authorName: 'Michael Brown',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    createdAt: new Date('2024-01-21T13:15:00'),
  },
  {
    id: 'com3',
    parentId: 'as1',
    parentType: 'assignment',
    content: 'No, please implement the algorithms from scratch to demonstrate your understanding.',
    authorId: 't1',
    authorName: 'Dr. Alex Johnson',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    createdAt: new Date('2024-01-21T14:00:00'),
  },
];
