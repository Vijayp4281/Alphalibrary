export type Role = 'guest' | 'student' | 'librarian' | 'staff' | 'admin';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  edition: string;
  category: string;
  department: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverImage: string;
  shelfLocation: string;
  publishedYear: number;
  language?: string;
  featured?: boolean;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: string;
  batch?: string;
  avatar: string;
  photoURL?: string;
  phone: string;
  joinedDate: string;
  maxBorrowLimit: number;
  emailVerified?: boolean;
}

export interface StaffProfile {
  id: string;
  staffId: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  position: string;
  avatar: string;
  photoURL?: string;
  phone?: string;
  joinedDate: string;
  role?: 'librarian' | 'staff' | 'admin';
  issuedBooksCount?: number;
}

export type BorrowStatus = 'Not Submitted' | 'Submitted' | 'Overdue';

export interface BorrowRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  studentDepartment: string;
  studentEmail?: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  bookEdition?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  handledByStaffId?: string;
  remarks?: string;
  fineAmount?: number;
}

export interface SupportReport {
  id: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  issueCategory: string;
  description: string;
  createdAt: string;
  status: 'Open' | 'Resolved' | 'In Review';
}
