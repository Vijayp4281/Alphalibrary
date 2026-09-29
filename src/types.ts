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
  rollNo?: string;
  name: string;
  email: string;
  department: string;
  year: string;
  batch?: string;
  barcode?: string;
  avatar: string;
  photoURL?: string;
  photoUrl?: string;
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
  photoUrl?: string;
  phone?: string;
  joinedDate: string;
  role?: 'librarian' | 'staff' | 'admin';
  issuedBooksCount?: number;
}

export interface AdminProfile {
  id: string;
  adminId?: string;
  staffId?: string;
  name: string;
  email: string;
  department: string;
  position?: string;
  avatar: string;
  photoURL?: string;
  photoUrl?: string;
  phone?: string;
  joinedDate: string;
  role: 'admin';
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
  borrowDate: string; // ISO string YYYY-MM-DD
  dueDate: string;   // ISO string YYYY-MM-DD
  returnDate?: string; // ISO string YYYY-MM-DD when submitted
  status: BorrowStatus;
  handledByStaffId?: string;
  remarks?: string;
  fineAmount?: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'due_alert' | 'borrow' | 'return' | 'system';
}

export interface SystemSettings {
  maxLoanDays: number;
  finePerDay: number;
  maxBooksPerStudent: number;
  autoEmailReminders: boolean;
  libraryName: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  department: string;
  author: string;
  availability: 'all' | 'available' | 'out_of_stock';
  edition: string;
  sortBy: 'title' | 'popular' | 'newest' | 'available';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  message: string;
  source: 'DevOps-Pipeline' | 'Auth-Service' | 'Catalog-API' | 'Borrow-Service' | 'Firebase-Auth';
}

export type FeedbackCategory =
  | 'Book Quality'
  | 'Book Availability'
  | 'Content Accuracy'
  | 'Edition Request'
  | 'Library Service'
  | 'Other';

export type OptimizedCategory =
  | 'Positive Feedback'
  | 'Edition Request'
  | 'Book Availability'
  | 'Content Accuracy'
  | 'Book Quality'
  | 'Library Service'
  | 'General Suggestion'
  | 'Complaint';

export type FeedbackPriority = 'High' | 'Medium' | 'Normal';

export type FeedbackStatus = 'New' | 'Reviewed' | 'Resolved';

export interface BookFeedback {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookCategory?: string;
  studentId: string;
  studentName: string;
  studentRollNo?: string;
  studentDepartment?: string;
  rating: number; // 1 - 5
  comment: string;
  category: FeedbackCategory;
  optimizedCategory: OptimizedCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  similarCount?: number;
  similarGroupKey?: string;
  librarianReply?: string;
  repliedByStaffId?: string;
  repliedByStaffName?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  resolvedAt?: string;
}

export interface BookFeedbackSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  categoryCounts: Record<FeedbackCategory, number>;
  optimizedCategoryCounts: Record<OptimizedCategory, number>;
  highPriorityCount: number;
  pendingCount: number;
  resolvedCount: number;
  mostCommonSuggestion?: string;
  similarGroups: { key: string; label: string; count: number; items: BookFeedback[] }[];
}

