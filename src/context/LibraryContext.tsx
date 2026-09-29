import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Book,
  StudentProfile,
  StaffProfile,
  AdminProfile,
  BorrowRecord,
  FilterOptions,
  Role,
  ToastMessage,
  SystemLog,
  SystemSettings,
  BookFeedback,
  FeedbackCategory,
  OptimizedCategory,
  FeedbackPriority,
  FeedbackStatus
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_BORROW_RECORDS,
  DEMO_STUDENTS,
  DEMO_STAFF
} from '../data/mockData';
import {
  auth,
  db,
  UserDoc,
  formatAuthError,
  registerUserWithFirebase,
  registerStudentWithFirebase,
  createStudentProfileInFirestore,
  signInUserWithFirebase,
  logoutUserWithFirebase,
  subscribeBooksFromFirestore,
  saveBookToFirestore,
  updateBookInFirestore,
  deleteBookFromFirestore,
  subscribeBorrowRecordsFromFirestore,
  saveBorrowRecordToFirestore,
  updateBorrowRecordInFirestore,
  deleteBorrowRecordFromFirestore,
  subscribeStudentsFromFirestore,
  saveStudentToFirestore,
  updateStudentInFirestore,
  deleteStudentFromFirestore,
  subscribeStaffFromFirestore,
  saveStaffToFirestore,
  updateStaffInFirestore,
  deleteStaffFromFirestore,
  subscribeCategoriesFromFirestore,
  saveCategoriesToFirestore,
  subscribeSystemSettingsFromFirestore,
  saveSystemSettingsToFirestore,
  seedUsersCollectionInFirestore,
  updateStudentProfileInFirestore,
  updateAdminProfileInFirestore,
  getUserDocSafely,
  subscribeBookFeedbackFromFirestore,
  saveBookFeedbackToFirestore,
  updateBookFeedbackInFirestore,
  deleteBookFeedbackFromFirestore
} from '../lib/firebase';
import { classifyComment } from '../services/commentOptimizationService';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface LibraryContextType {
  books: Book[];
  borrowRecords: BorrowRecord[];
  studentsList: StudentProfile[];
  staffList: StaffProfile[];
  categoriesList: string[];
  systemSettings: SystemSettings;
  feedbackList: BookFeedback[];
  currentRole: Role;
  currentStudent: StudentProfile | null;
  currentStaff: StaffProfile | null;
  currentAdmin: AdminProfile | null;
  filters: FilterOptions;
  activeTab: 'catalog' | 'student-dashboard' | 'staff-dashboard' | 'admin-dashboard' | 'devops-panel' | 'settings';
  selectedBook: Book | null;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'register';
  toasts: ToastMessage[];
  theme: 'light' | 'dark';
  themePalette: 'emerald' | 'indigo' | 'violet';
  systemLogs: SystemLog[];
  isAuthLoading: boolean;
  
  // Actions
  setRole: (role: Role, studentId?: string, staffId?: string) => void;
  setActiveTab: (tab: 'catalog' | 'student-dashboard' | 'staff-dashboard' | 'admin-dashboard' | 'devops-panel' | 'settings') => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  setSelectedBook: (book: Book | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'signin' | 'register') => void;
  authRoleTab: 'student' | 'staff' | 'admin';
  setAuthRoleTab: (role: 'student' | 'staff' | 'admin') => void;
  openAuthModal: (mode?: 'signin' | 'register', roleTab?: 'student' | 'staff' | 'admin') => void;
  registerStudent: (data: { name: string; rollNumber: string; email: string; department?: string; year?: string; batch?: string; password?: string }) => Promise<boolean>;
  verifyStudentEmailAndCreateProfile: () => Promise<{ success: boolean; studentData?: StudentProfile; error?: string }>;
  registerStaff: (data: { name: string; staffId: string; email: string; department?: string; position?: string; password?: string }) => Promise<boolean>;
  signInWithFirebase: (email: string, pass: string, preferredRole?: Role) => Promise<{ success: boolean; error?: string }>;
  signOutWithFirebase: () => Promise<void>;
  toggleTheme: () => void;
  setThemePalette: (palette: 'emerald' | 'indigo' | 'violet') => void;
  
  // Feedback & Comment Optimization CRUD
  addFeedback: (data: {
    bookId: string;
    bookTitle: string;
    bookAuthor?: string;
    bookCategory?: string;
    rating: number;
    comment: string;
    category: FeedbackCategory;
  }) => Promise<boolean>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus, reply?: string) => Promise<boolean>;
  updateFeedbackPriority: (id: string, priority: FeedbackPriority) => Promise<boolean>;
  deleteFeedback: (id: string) => Promise<boolean>;
  getFeedbackForBook: (bookId: string) => BookFeedback[];
  
  // Book & Category CRUD
  addBook: (bookData: Omit<Book, 'id'> & { id?: string }) => void;
  updateBook: (id: string, bookData: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  addCategory: (category: string) => void;
  editCategory: (oldCat: string, newCat: string) => void;
  deleteCategory: (category: string) => void;
  
  // Borrowing workflow
  borrowBook: (bookId: string) => boolean;
  issueBookByLibrarian: (data: { studentRollNo: string; bookId: string; dueDateDays?: number; remarks?: string }) => boolean;
  markAsSubmitted: (borrowRecordId: string, remarks?: string) => void;
  returnBookByLibrarian: (borrowRecordId: string, remarks?: string) => void;

  // Student / Staff Management (Admin & Staff)
  addStudent: (student: Omit<StudentProfile, 'id'>) => void;
  updateStudent: (id: string, data: Partial<StudentProfile>) => void;
  deleteStudent: (id: string) => void;
  purgeDuplicateStudents: () => void;
  addStaffMember: (staff: Omit<StaffProfile, 'id'>) => void;
  updateStaffMember: (id: string, data: Partial<StaffProfile>) => void;
  deleteStaffMember: (id: string) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Helpers
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  addSystemLog: (level: SystemLog['level'], message: string, source?: SystemLog['source']) => void;
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;
  updateStaffProfile: (profile: Partial<StaffProfile>) => Promise<void> | void;
  updateAdminProfile: (profile: Partial<AdminProfile>) => Promise<void>;
}

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  category: 'All Categories',
  department: 'All Departments',
  author: '',
  availability: 'all',
  edition: '',
  sortBy: 'popular'
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Helper to deduplicate student list by unique email & roll number
const deduplicateStudents = (students: StudentProfile[]): StudentProfile[] => {
  const seenEmails = new Set<string>();
  const seenRolls = new Set<string>();
  const cleaned: StudentProfile[] = [];

  for (const s of students) {
    if (!s) continue;
    const emailKey = s.email ? s.email.toLowerCase().trim() : '';
    const rollKey = s.rollNumber ? s.rollNumber.toLowerCase().trim() : '';

    if (emailKey && seenEmails.has(emailKey)) {
      continue;
    }
    if (rollKey && seenRolls.has(rollKey)) {
      continue;
    }

    if (emailKey) seenEmails.add(emailKey);
    if (rollKey) seenRolls.add(rollKey);
    cleaned.push(s);
  }

  return cleaned;
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence initialization from localStorage
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('lms_books');
    let currentBooks: Book[] = saved ? JSON.parse(saved) : INITIAL_BOOKS;
    
    // Ensure all INITIAL_BOOKS are present
    INITIAL_BOOKS.forEach(ib => {
      if (!currentBooks.some(b => b.id === ib.id)) {
        currentBooks.push(ib);
      }
    });

    // Ensure copies are between 1 and 5 for all books as requested
    currentBooks = currentBooks.map(b => {
      const match = INITIAL_BOOKS.find(ib => ib.id === b.id);
      let copies = match ? match.totalCopies : b.totalCopies;
      if (copies > 5 || copies < 1) {
        copies = Math.floor(Math.abs(b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 5) + 1;
      }
      return {
        ...b,
        totalCopies: copies,
        availableCopies: Math.min(b.availableCopies > 0 ? b.availableCopies : 1, copies)
      };
    });

    return currentBooks;
  });

  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>(() => {
    const saved = localStorage.getItem('lms_borrow_records');
    return saved ? JSON.parse(saved) : INITIAL_BORROW_RECORDS;
  });

  const [currentRole, setCurrentRoleState] = useState<Role>(() => {
    return (localStorage.getItem('lms_role') as Role) || 'guest';
  });

  const [currentStudent, setCurrentStudentState] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('lms_current_student');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentStaff, setCurrentStaffState] = useState<StaffProfile | null>(() => {
    const saved = localStorage.getItem('lms_current_staff');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentAdmin, setCurrentAdminState] = useState<AdminProfile | null>(() => {
    const saved = localStorage.getItem('lms_current_admin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'admin-root-01',
      adminId: 'ADM-001',
      staffId: 'ADM-001',
      name: 'System Administrator',
      email: 'admin@university.edu',
      department: 'Central University Library',
      position: 'Chief Administrator & DevOps',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 019-2834',
      joinedDate: '2018-01-01',
      role: 'admin'
    };
  });

  const currentRoleRef = useRef<Role>(currentRole);
  const currentStaffRef = useRef<StaffProfile | null>(currentStaff);
  const currentStudentRef = useRef<StudentProfile | null>(currentStudent);
  const currentAdminRef = useRef<AdminProfile | null>(currentAdmin);

  const setCurrentRole = (role: Role) => {
    currentRoleRef.current = role;
    setCurrentRoleState(role);
    localStorage.setItem('lms_role', role);
  };

  const setCurrentStaff = (staff: StaffProfile | null) => {
    currentStaffRef.current = staff;
    setCurrentStaffState(staff);
    if (staff) {
      localStorage.setItem('lms_current_staff', JSON.stringify(staff));
    } else {
      localStorage.removeItem('lms_current_staff');
    }
  };

  const setCurrentStudent = (student: StudentProfile | null) => {
    currentStudentRef.current = student;
    setCurrentStudentState(student);
    if (student) {
      localStorage.setItem('lms_current_student', JSON.stringify(student));
    } else {
      localStorage.removeItem('lms_current_student');
    }
  };

  const setCurrentAdmin = (admin: AdminProfile | null) => {
    currentAdminRef.current = admin;
    setCurrentAdminState(admin);
    if (admin) {
      localStorage.setItem('lms_current_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('lms_current_admin');
    }
  };

  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('lms_students');
    let list: StudentProfile[] = saved ? JSON.parse(saved) : [];

    // Load any offline registered students
    try {
      const offlineList = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
      if (Array.isArray(offlineList)) {
        offlineList.forEach((stu: any) => {
          if (stu && stu.email) {
            const cleanEmail = stu.email.toLowerCase().trim();
            const cleanRoll = (stu.rollNumber || '').toLowerCase().trim();
            if (!list.some(s => s.email?.toLowerCase().trim() === cleanEmail || (cleanRoll && s.rollNumber?.toLowerCase().trim() === cleanRoll))) {
              list.unshift({
                id: stu.uid || `STU-${Date.now()}`,
                name: stu.name || 'Registered Student',
                rollNumber: stu.rollNumber || 'STU-001',
                email: cleanEmail,
                department: stu.department || 'Computer Science & Eng',
                year: stu.year || '3rd Year',
                batch: stu.batch || '2022-2026 Batch',
                phone: stu.phone || '+1 (555) 019-2834',
                avatar: stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                maxBorrowLimit: stu.maxBorrowLimit || 5,
                joinedDate: stu.joinedDate || new Date().toISOString().split('T')[0],
                emailVerified: true
              });
            }
          }
        });
      }
    } catch (e) {
      console.warn('Error parsing offline students:', e);
    }

    // Ensure DEMO_STUDENTS are merged if not present
    DEMO_STUDENTS.forEach(demo => {
      const demoEmail = demo.email.toLowerCase().trim();
      const demoRoll = demo.rollNumber.toLowerCase().trim();
      if (!list.some(s => s.email?.toLowerCase().trim() === demoEmail || s.rollNumber?.toLowerCase().trim() === demoRoll)) {
        list.push(demo);
      }
    });

    const deduplicated = deduplicateStudents(list);
    try {
      localStorage.setItem('lms_students', JSON.stringify(deduplicated));
    } catch (e) {}

    return deduplicated;
  });

  const [staffList, setStaffList] = useState<StaffProfile[]>(() => {
    const saved = localStorage.getItem('lms_staff_list');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEMO_STAFF;
  });

  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('lms_categories');
    return saved
      ? JSON.parse(saved)
      : [
          'Software Engineering',
          'Programming',
          'DevOps & Cloud',
          'Database Systems',
          'Artificial Intelligence',
          'Algorithms',
          'Operating Systems',
          'Networking'
        ];
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('lms_system_settings');
    return saved
      ? JSON.parse(saved)
      : {
          maxLoanDays: 14,
          finePerDay: 1,
          maxBooksPerStudent: 5,
          autoEmailReminders: true,
          libraryName: 'College Central Library'
        };
  });

  const [feedbackList, setFeedbackList] = useState<BookFeedback[]>(() => {
    const saved = localStorage.getItem('lms_book_feedback');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('lms_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('lms_borrow_records', JSON.stringify(borrowRecords));
  }, [borrowRecords]);

  useEffect(() => {
    localStorage.setItem('lms_students', JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem('lms_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('lms_categories', JSON.stringify(categoriesList));
  }, [categoriesList]);

  useEffect(() => {
    localStorage.setItem('lms_system_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('lms_book_feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [activeTab, setActiveTabState] = useState<'catalog' | 'student-dashboard' | 'staff-dashboard' | 'admin-dashboard' | 'devops-panel' | 'settings'>('catalog');

  const setActiveTab = (tab: 'catalog' | 'student-dashboard' | 'staff-dashboard' | 'admin-dashboard' | 'devops-panel' | 'settings') => {
    const effectiveRole = currentRoleRef.current;
    const hasStaff = !!currentStaffRef.current;
    const hasStudent = !!currentStudentRef.current;
    const hasAdmin = !!currentAdminRef.current;

    if (tab === 'staff-dashboard') {
      if (effectiveRole !== 'staff' && effectiveRole !== 'librarian' && effectiveRole !== 'admin' && !hasStaff && !hasAdmin) {
        if (effectiveRole === 'student') {
          addToast('Staff Access Only', 'You are logged in with a Student account. Only registered Staff members can enter the Staff Dashboard.', 'error');
          setActiveTabState('student-dashboard');
        } else {
          addToast('Staff Sign-In Required', 'Please sign in with a registered Staff email to access the Staff Dashboard.', 'warning');
          openAuthModal('signin', 'staff');
          setActiveTabState('catalog');
        }
        return;
      }
    } else if (tab === 'student-dashboard') {
      if (effectiveRole !== 'student' && !hasStudent) {
        if (effectiveRole === 'staff' || hasStaff) {
          addToast('Student Access Only', 'You are logged in with a Staff account. Staff functions are managed in the Staff Portal.', 'info');
          setActiveTabState('staff-dashboard');
        } else if (effectiveRole === 'admin' || hasAdmin) {
          setActiveTabState('admin-dashboard');
        } else {
          addToast('Student Sign-In Required', 'Please sign in with a registered Student email to access your Student Dashboard.', 'warning');
          openAuthModal('signin', 'student');
          setActiveTabState('catalog');
        }
        return;
      }
    } else if (tab === 'admin-dashboard' || tab === 'devops-panel') {
      if (effectiveRole !== 'admin' && !hasAdmin) {
        addToast('Administrator Access Only', 'Admin Control and DevOps Panel are restricted to System Administrators.', 'error');
        if (effectiveRole === 'staff' || hasStaff) {
          setActiveTabState('staff-dashboard');
        } else if (effectiveRole === 'student' || hasStudent) {
          setActiveTabState('student-dashboard');
        } else {
          openAuthModal('signin', 'admin');
          setActiveTabState('catalog');
        }
        return;
      }
    }
    setActiveTabState(tab);
  };
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authRoleTab, setAuthRoleTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const openAuthModal = (mode: 'signin' | 'register' = 'signin', roleTab?: 'student' | 'staff' | 'admin') => {
    // Staff and Admin accounts are managed by the administrator; only students register accounts
    const effectiveMode = (mode === 'register' && roleTab && roleTab !== 'student') ? 'signin' : mode;
    const effectiveTab = (effectiveMode === 'register') ? 'student' : (roleTab || authRoleTab);
    setAuthMode(effectiveMode);
    setAuthRoleTab(effectiveTab);
    setIsAuthModalOpen(true);
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        try {
          try {
            await firebaseUser.reload();
          } catch {
            // Reload may be non-fatal if offline
          }

          // Fetch user document safely with offline and local fallback
          let uData = await getUserDocSafely(firebaseUser);

          if (uData && uData.role === 'admin') {
            const adminProf: AdminProfile = {
              id: firebaseUser.uid,
              adminId: uData.staffId || uData.adminId || 'ADM-001',
              staffId: uData.staffId || uData.adminId || 'ADM-001',
              name: uData.name || 'System Administrator',
              email: uData.email || firebaseUser.email || 'admin@university.edu',
              department: uData.department || 'Central University Library',
              position: uData.position || 'System Administrator',
              avatar: uData.avatar || uData.photoURL || uData.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
              photoURL: uData.avatar || uData.photoURL || uData.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
              photoUrl: uData.avatar || uData.photoURL || uData.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
              phone: uData.phone || '+1 (555) 019-2834',
              joinedDate: uData.joinedDate || new Date().toISOString().split('T')[0],
              role: 'admin'
            };
            setCurrentAdmin(adminProf);
            setCurrentStaff(null);
            setCurrentStudent(null);
            setCurrentRole('admin');
            setActiveTab('admin-dashboard');
          } else if (uData && uData.role === 'staff') {
            // Staff users: Email verification is NOT required
            const staffProf: StaffProfile = {
              id: firebaseUser.uid,
              staffId: uData.staffId || 'STAFF-001',
              name: uData.name,
              email: uData.email,
              department: uData.department || 'Central Library Admin',
              position: uData.position || 'Assistant Librarian',
              avatar: uData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
              joinedDate: uData.joinedDate || new Date().toISOString().split('T')[0]
            };
            setCurrentStaff(staffProf);
            setCurrentRole('staff');
            setActiveTab('staff-dashboard');
          } else {
            // Student user (or pending student user): Email verification applies
            const isStudentVerified = firebaseUser.emailVerified || (uData && uData.emailVerified === true);
            if (!isStudentVerified && (!uData || uData.emailVerified === false)) {
              // Unverified Student user with no profile yet! DO NOT allow student dashboard.
              setCurrentStudent(null);
              setCurrentStaff(null);
              setCurrentRole('guest');
              localStorage.removeItem('lms_current_student');
              localStorage.setItem('lms_role', 'guest');
            } else {
              // Verified Student in Firebase Auth!
              if (uData && uData.emailVerified !== false) {
                const photo = uData.avatar || uData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                const studentProf: StudentProfile = {
                  id: firebaseUser.uid,
                  name: uData.name,
                  rollNumber: uData.rollNumber || 'STU-001',
                  email: uData.email,
                  department: uData.department || 'Computer Science & Eng',
                  year: uData.year || '3rd Year',
                  batch: uData.batch || '2022-2026 Batch',
                  phone: uData.phone || '+1 (555) 019-2834',
                  avatar: photo,
                  maxBorrowLimit: uData.maxBorrowLimit || 5,
                  joinedDate: uData.joinedDate || new Date().toISOString().split('T')[0],
                  emailVerified: true
                };
                setCurrentStudent(studentProf);
                setCurrentRole('student');
                setActiveTab('student-dashboard');
                setStudentsList(prev => {
                  const exists = prev.some(s => s.id === studentProf.id);
                  return exists ? prev.map(s => s.id === studentProf.id ? studentProf : s) : [studentProf, ...prev];
                });
              } else if (firebaseUser.emailVerified) {
                // User doc doesn't exist yet, but student email is verified. Create student profile in Firestore now.
                try {
                  const createdUData = await createStudentProfileInFirestore(firebaseUser);
                  const photo = createdUData.avatar || createdUData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                  const studentProf: StudentProfile = {
                    id: firebaseUser.uid,
                    name: createdUData.name,
                    rollNumber: createdUData.rollNumber || 'STU-001',
                    email: createdUData.email,
                    department: createdUData.department || 'Computer Science & Eng',
                    year: createdUData.year || '3rd Year',
                    batch: createdUData.batch || '2022-2026 Batch',
                    phone: createdUData.phone || '+1 (555) 019-2834',
                    avatar: photo,
                    maxBorrowLimit: createdUData.maxBorrowLimit || 5,
                    joinedDate: createdUData.joinedDate || new Date().toISOString().split('T')[0],
                    emailVerified: true
                  };
                  setCurrentStudent(studentProf);
                  setCurrentRole('student');
                  setActiveTab('student-dashboard');
                  setStudentsList(prev => {
                    const exists = prev.some(s => s.id === studentProf.id);
                    return exists ? prev.map(s => s.id === studentProf.id ? studentProf : s) : [studentProf, ...prev];
                  });
                } catch (createErr) {
                  console.warn('Could not auto-create profile for verified user on auth change:', createErr);
                  setCurrentStudent(null);
                  setCurrentRole('guest');
                }
              }
            }
          }
        } catch (err) {
          console.warn('Handled auth change safely:', err);
        }
      } else {
        // Explicitly clear session state and redirect to catalog when unauthenticated
        setCurrentStudent(null);
        setCurrentStaff(null);
        setCurrentRole('guest');
        setActiveTab('catalog');
        localStorage.removeItem('lms_current_student');
        localStorage.removeItem('lms_current_staff');
        localStorage.setItem('lms_role', 'guest');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize users collection in Firestore if empty
  useEffect(() => {
    seedUsersCollectionInFirestore();
  }, []);

  // Sync books, borrow records, students, staff, categories & settings with Firestore
  useEffect(() => {
    const unsubBooks = subscribeBooksFromFirestore((fbBooks) => {
      if (Array.isArray(fbBooks)) {
        setBooks(fbBooks);
      }
    });
    const unsubBorrow = subscribeBorrowRecordsFromFirestore((fbRecords) => {
      if (Array.isArray(fbRecords)) {
        setBorrowRecords(fbRecords);
      }
    });
    const unsubStudents = subscribeStudentsFromFirestore((fbStudents) => {
      if (fbStudents && fbStudents.length > 0) {
        setStudentsList(prev => {
          const merged = [...fbStudents, ...prev];
          return deduplicateStudents(merged);
        });
      }
    });
    const unsubStaff = subscribeStaffFromFirestore((fbStaff) => {
      if (fbStaff && fbStaff.length > 0) {
        setStaffList(prev => {
          const seen = new Set<string>();
          const combined = [...fbStaff, ...prev];
          const merged: StaffProfile[] = [];
          for (const s of combined) {
            const emailKey = s.email?.toLowerCase().trim();
            const staffIdKey = s.staffId?.toLowerCase().trim();
            if (emailKey && seen.has(emailKey)) continue;
            if (staffIdKey && seen.has(staffIdKey)) continue;
            if (emailKey) seen.add(emailKey);
            if (staffIdKey) seen.add(staffIdKey);
            merged.push(s);
          }
          return merged;
        });
      }
    });
    const unsubCats = subscribeCategoriesFromFirestore((fbCats) => {
      if (Array.isArray(fbCats) && fbCats.length > 0) {
        setCategoriesList(fbCats);
      }
    });
    const unsubSettings = subscribeSystemSettingsFromFirestore((fbSettings) => {
      if (fbSettings && Object.keys(fbSettings).length > 0) {
        setSystemSettings(prev => ({ ...prev, ...fbSettings }));
      }
    });
    const unsubFeedback = subscribeBookFeedbackFromFirestore((fbFeedbacks) => {
      if (Array.isArray(fbFeedbacks)) {
        setFeedbackList(fbFeedbacks);
      }
    });

    return () => {
      unsubBooks();
      unsubBorrow();
      unsubStudents();
      unsubStaff();
      unsubCats();
      unsubSettings();
      unsubFeedback();
    };
  }, []);

  const registerStudent = async (data: { name: string; rollNumber: string; email: string; department?: string; year?: string; batch?: string; password?: string; emailVerified?: boolean }): Promise<boolean> => {
    try {
      const cleanEmail = data.email.toLowerCase().trim();
      const cleanRoll = data.rollNumber.toLowerCase().trim();

      // STRICT VALIDATION: Check if email already registered in system
      const existingStudentByEmail = studentsList.find(
        s => s.email && s.email.toLowerCase().trim() === cleanEmail
      );
      if (existingStudentByEmail) {
        const msg = `The email address "${data.email}" is already registered to ${existingStudentByEmail.name} (${existingStudentByEmail.rollNumber}). Duplicate registrations with the same email are not allowed. Please log in instead.`;
        addToast('Email Already Registered', msg, 'error');
        throw new Error(msg);
      }

      // STRICT VALIDATION: Check if roll number already registered
      const existingStudentByRoll = studentsList.find(
        s => s.rollNumber && s.rollNumber.toLowerCase().trim() === cleanRoll
      );
      if (existingStudentByRoll) {
        const msg = `The roll number "${data.rollNumber}" is already registered to ${existingStudentByRoll.name}. Each student must have a unique roll number.`;
        addToast('Roll Number Already Taken', msg, 'error');
        throw new Error(msg);
      }

      const pwd = data.password || 'password123';
      const studentYear = data.year || '3rd Year';
      const studentBatch = data.batch || '2022-2026 Batch';

      const regResult = await registerStudentWithFirebase(cleanEmail, pwd, {
        name: data.name,
        rollNumber: data.rollNumber,
        department: data.department,
        year: studentYear,
        batch: studentBatch
      });

      const { user } = regResult;

      addToast(
        'Verification Link Sent 📩',
        `A verification link was sent to ${cleanEmail}. Please check your inbox and verify your email before your student account is created.`,
        'info'
      );
      addSystemLog('INFO', `Student Registration Initiated (${user.uid}) -> Verification Email Sent to ${cleanEmail}`, 'Firebase-Auth');
      return true;
    } catch (err: any) {
      console.error('Firebase Register Student Error:', err);
      const errMsg = formatAuthError(err);
      addToast('Registration Failed', errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const verifyStudentEmailAndCreateProfile = async (): Promise<{ success: boolean; studentData?: StudentProfile; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'No active session found. Please log in.' };
    }
    try {
      await auth.currentUser.reload();
      if (!auth.currentUser.emailVerified) {
        return { success: false, error: 'Your email has not been verified yet. Please open your email and click the verification link.' };
      }

      // Email verified in Auth! Now create the Firestore student profile
      const userData = await createStudentProfileInFirestore(auth.currentUser);

      const studentProf: StudentProfile = {
        id: userData.uid,
        name: userData.name,
        rollNumber: userData.rollNumber || 'STU-001',
        email: userData.email,
        department: userData.department || 'Computer Science & Eng',
        year: userData.year || '3rd Year',
        batch: userData.batch || '2022-2026 Batch',
        phone: userData.phone || '+1 (555) 019-2834',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        maxBorrowLimit: userData.maxBorrowLimit || 5,
        joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
        emailVerified: true
      };

      setCurrentStudent(studentProf);
      setCurrentRole('student');
      setActiveTab('student-dashboard');
      setIsAuthModalOpen(false);

      setStudentsList(prev => {
        const exists = prev.some(s => s.id === studentProf.id);
        return exists ? prev.map(s => s.id === studentProf.id ? studentProf : s) : [studentProf, ...prev];
      });

      addToast('Email Verified Successfully! ✓', 'Your student account has been created.', 'success');
      addSystemLog('SUCCESS', `Student Profile Created in Firestore (${studentProf.id}) -> ${studentProf.email}`, 'Firebase-Auth');
      return { success: true, studentData: studentProf };
    } catch (err: any) {
      console.error('Verify email and create profile error:', err);
      const errMsg = err?.message || 'Verification check failed.';
      return { success: false, error: errMsg };
    }
  };

  const registerStaff = async (data: { name: string; staffId: string; email: string; department?: string; position?: string; password?: string }): Promise<boolean> => {
    try {
      const cleanEmail = data.email.toLowerCase().trim();
      const cleanStaffId = data.staffId.toLowerCase().trim();

      // Check duplicate staff ID (ignoring demo placeholders)
      const duplicateId = staffList.find(
        s => s.id !== 'STF-5001' && s.id !== 'STF-5002' && s.staffId && s.staffId.toLowerCase().trim() === cleanStaffId
      );
      if (duplicateId) {
        const msg = `Staff ID "${data.staffId}" is already assigned to ${duplicateId.name}. Please enter your unique Staff ID.`;
        addToast('Staff ID Taken', msg, 'error');
        throw new Error(msg);
      }

      const pwd = data.password || 'password123';
      const { user } = await registerUserWithFirebase(cleanEmail, pwd, {
        name: data.name,
        role: 'staff',
        staffId: data.staffId,
        department: data.department,
        position: data.position
      });

      const newStaff: StaffProfile = {
        id: user.uid,
        staffId: data.staffId,
        name: data.name,
        email: cleanEmail,
        department: data.department || 'Central Library Admin',
        position: data.position || 'Assistant Librarian',
        avatar: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200`,
        joinedDate: new Date().toISOString().split('T')[0],
        role: 'staff'
      };
      setStaffList(prev => [newStaff, ...prev.filter(s => s.email?.toLowerCase().trim() !== cleanEmail)]);
      saveStaffToFirestore(newStaff);
      setCurrentStaff(newStaff);
      setCurrentStudent(null);
      setCurrentRole('staff');
      setActiveTab('staff-dashboard');
      setIsAuthModalOpen(false);
      addToast('Staff Registration Successful', `Welcome ${data.name}! You are now in the Staff Dashboard.`, 'success');
      addSystemLog('SUCCESS', `Firebase Staff User Created (${user.uid}) -> Email: ${cleanEmail}`, 'Firebase-Auth');
      return true;
    } catch (err: any) {
      console.error('Firebase Register Staff Error:', err);
      const errMsg = formatAuthError(err);
      addToast('Registration Failed', errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const signInWithFirebase = async (email: string, pass: string, preferredRole?: Role): Promise<{ success: boolean; error?: string }> => {
    try {
      const roleFilter = (preferredRole === 'student' || preferredRole === 'staff' || preferredRole === 'admin') ? preferredRole : undefined;
      const { user, userData } = await signInUserWithFirebase(email, pass, roleFilter);
      const targetRole = userData?.role || preferredRole || 'student';

      if (targetRole === 'admin') {
        const adminProf: AdminProfile = {
          id: user.uid,
          adminId: userData?.staffId || userData?.adminId || 'ADM-001',
          staffId: userData?.staffId || userData?.adminId || 'ADM-001',
          name: userData?.name || 'System Administrator',
          email: userData?.email || email,
          department: userData?.department || 'Central University Library',
          position: userData?.position || 'Chief Administrator & DevOps',
          avatar: userData?.avatar || userData?.photoURL || userData?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          photoURL: userData?.avatar || userData?.photoURL || userData?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          photoUrl: userData?.avatar || userData?.photoURL || userData?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          phone: userData?.phone || '+1 (555) 019-2834',
          joinedDate: userData?.joinedDate || new Date().toISOString().split('T')[0],
          role: 'admin'
        };
        setCurrentAdmin(adminProf);
        setCurrentStaff(null);
        setCurrentStudent(null);
        setCurrentRole('admin');
        setActiveTabState('admin-dashboard');
        addToast('Sign In Successful', `Welcome back ${adminProf.name}!`, 'success');
      } else if (targetRole === 'staff') {
        const staffProf: StaffProfile = {
          id: user.uid,
          staffId: userData?.staffId || 'STAFF-001',
          name: userData?.name || (email.includes('@') ? email.split('@')[0] : email),
          email: userData?.email || email,
          department: userData?.department || 'Central Library Admin',
          position: userData?.position || 'Assistant Librarian',
          avatar: userData?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          joinedDate: userData?.joinedDate || new Date().toISOString().split('T')[0]
        };
        setCurrentStaff(staffProf);
        setCurrentStudent(null);
        setCurrentRole('staff');
        setActiveTabState('staff-dashboard');
        addToast('Sign In Successful', `Welcome back ${staffProf.name}!`, 'success');
      } else {
        const studentProf: StudentProfile = {
          id: user.uid,
          name: userData?.name || (email.includes('@') ? email.split('@')[0] : email),
          rollNumber: userData?.rollNumber || 'STU-001',
          email: userData?.email || email,
          department: userData?.department || 'Computer Science & Eng',
          year: userData?.year || '3rd Year',
          batch: userData?.batch || '2022-2026 Batch',
          phone: userData?.phone || '+1 (555) 019-2834',
          avatar: userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          maxBorrowLimit: userData?.maxBorrowLimit || 5,
          joinedDate: userData?.joinedDate || new Date().toISOString().split('T')[0]
        };
        setCurrentStudent(studentProf);
        setCurrentRole('student');
        setActiveTabState('student-dashboard');
        addToast('Sign In Successful', `Welcome back ${studentProf.name}!`, 'success');
        checkStudentDueBooksAlert(studentProf.id, borrowRecords);
      }

      setIsAuthModalOpen(false);
      addSystemLog('SUCCESS', `Firebase User Signed In (${user.email})`, 'Firebase-Auth');
      return { success: true };
    } catch (err: any) {
      console.error('Firebase Sign In Error:', err);
      const errMsg = formatAuthError(err);
      addToast('Sign In Failed', errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const signOutWithFirebase = async (): Promise<void> => {
    try {
      await logoutUserWithFirebase();
    } catch (err) {
      console.error('Error logging out from Firebase:', err);
    } finally {
      setCurrentStudent(null);
      setCurrentStaff(null);
      setCurrentAdmin(null);
      setCurrentRole('guest');
      setActiveTab('catalog');
      localStorage.removeItem('lms_current_student');
      localStorage.removeItem('lms_current_staff');
      localStorage.removeItem('lms_current_admin');
      localStorage.setItem('lms_role', 'guest');
      addToast('Logged Out Successfully', 'Signed out of your account. Redirected to book catalog.', 'info');
      addSystemLog('INFO', 'Firebase Session Logged Out - Redirected to Catalog', 'Firebase-Auth');
    }
  };
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('lms_theme') as 'light' | 'dark') || 'dark';
  });
  const [themePalette, setThemePalette] = useState<'emerald' | 'indigo' | 'violet'>(() => {
    return (localStorage.getItem('lms_theme_palette') as 'emerald' | 'indigo' | 'violet') || 'emerald';
  });

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: 'LOG-101',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'System booted into Docker Container (Node v22 Runtime / Clean Code MVC)',
      source: 'DevOps-Pipeline'
    },
    {
      id: 'LOG-102',
      timestamp: new Date().toLocaleTimeString(),
      level: 'SUCCESS',
      message: 'Catalog & User State synchronized from Local Storage persistence',
      source: 'Catalog-API'
    }
  ]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('lms_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('lms_borrow_records', JSON.stringify(borrowRecords));
  }, [borrowRecords]);

  useEffect(() => {
    localStorage.setItem('lms_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('lms_current_student', JSON.stringify(currentStudent));
    }
  }, [currentStudent]);

  useEffect(() => {
    if (currentStaff) {
      localStorage.setItem('lms_current_staff', JSON.stringify(currentStaff));
    }
  }, [currentStaff]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('lms_current_admin', JSON.stringify(currentAdmin));
    }
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('lms_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lms_theme_palette', themePalette);
  }, [themePalette]);

  // Actions
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Single Toast Management & Duplicate Prevention
  const lastToastRef = useRef<{ title: string; desc?: string; type: string; timestamp: number } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const now = Date.now();
    const cleanTitle = (title || '').trim();
    const cleanDesc = (description || '').trim();

    // Duplicate Prevention: Prevent spamming identical notifications within 1.5 seconds
    if (
      lastToastRef.current &&
      lastToastRef.current.title === cleanTitle &&
      (lastToastRef.current.desc || '') === cleanDesc &&
      lastToastRef.current.type === type &&
      now - lastToastRef.current.timestamp < 1500
    ) {
      return;
    }

    lastToastRef.current = {
      title: cleanTitle,
      desc: cleanDesc,
      type,
      timestamp: now
    };

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    const id = `toast-${now}-${Math.random().toString(36).substring(2, 5)}`;
    
    // Exactly ONE popup at any moment: Replace old popup with new popup
    setToasts([{ id, title: cleanTitle, description: cleanDesc || undefined, type }]);

    // Auto-disappear after ~3 seconds (3000ms)
    toastTimeoutRef.current = setTimeout(() => {
      setToasts([]);
    }, 3000);
  };

  const removeToast = (id?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    if (id) {
      setToasts(prev => prev.filter(t => t.id !== id));
    } else {
      setToasts([]);
    }
  };

  const addSystemLog = (level: SystemLog['level'], message: string, source: SystemLog['source'] = 'Catalog-API') => {
    const newLog: SystemLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      source
    };
    setSystemLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const checkStudentDueBooksAlert = (studentId: string, records: BorrowRecord[]) => {
    const now = new Date();
    const student = (studentsList || []).find(s => s && s.id === studentId) || currentStudent;
    const activeStudentLoans = (records || []).filter(r => {
      if (!r || r.status === 'Submitted') return false;
      const sIdMatches = r.studentId === studentId;
      const sRollMatches = !!(student?.rollNumber && r.studentRollNo && r.studentRollNo.toLowerCase().trim() === student.rollNumber.toLowerCase().trim());
      const sRollMatchesId = !!(student?.rollNumber && r.studentId && r.studentId.toLowerCase().trim() === student.rollNumber.toLowerCase().trim());
      return sIdMatches || sRollMatches || sRollMatchesId;
    });

    const dueSoonBooks = activeStudentLoans.filter(r => {
      if (!r || !r.dueDate) return false;
      const due = new Date(r.dueDate);
      if (typeof r.dueDate === 'string' && r.dueDate.length === 10) {
        due.setHours(23, 59, 59, 999);
      }
      const diffMs = due.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours <= 48;
    });

    if (dueSoonBooks.length > 0) {
      const titles = dueSoonBooks.map(b => `"${b.bookTitle}"`).join(', ');
      setTimeout(() => {
        addToast(
          `⚠️ Due Date Alert (${dueSoonBooks.length} Book${dueSoonBooks.length > 1 ? 's' : ''} Due Soon)`,
          `Notice: You have ${dueSoonBooks.length} book(s) due within the next 48 hours (${titles}). Please return or submit them to avoid late fines.`,
          'warning'
        );
      }, 600);
    }
  };

  useEffect(() => {
    if (currentRole === 'student' && currentStudent) {
      checkStudentDueBooksAlert(currentStudent.id, borrowRecords);
    }
  }, []);

  const setRole = (role: Role, studentId?: string, staffId?: string) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentStudent(null);
      setCurrentStaff(null);
      setActiveTab('admin-dashboard');
      addToast('Switched to Admin Control Mode', 'Logged in as System Administrator', 'success');
      addSystemLog('INFO', 'Auth Session switched to System Administrator (Full Access)', 'Auth-Service');
    } else if (role === 'student') {
      const targetStudent = studentsList.find(s => s.id === studentId) || studentsList[0];
      if (targetStudent) {
        setCurrentStudent(targetStudent);
        setActiveTab('student-dashboard');
        addToast('Switched to Student Mode', `Logged in as ${targetStudent.name} (${targetStudent.rollNumber})`, 'success');
        addSystemLog('INFO', `Auth Session switched to Student: ${targetStudent.rollNumber}`, 'Auth-Service');
        checkStudentDueBooksAlert(targetStudent.id, borrowRecords);
      }
    } else if (role === 'staff') {
      const targetStaff = staffList.find(s => s.id === staffId) || staffList[0];
      if (targetStaff) {
        setCurrentStaff(targetStaff);
        setActiveTab('staff-dashboard');
        addToast('Switched to Staff Mode', `Welcome ${targetStaff.name} (${targetStaff.position})`, 'success');
        addSystemLog('INFO', `Auth Session switched to Staff: ${targetStaff.staffId}`, 'Auth-Service');
      }
    } else {
      setCurrentStudent(null);
      setCurrentStaff(null);
      setActiveTab('catalog');
      addToast('Logged out', 'Now browsing as guest', 'info');
      addSystemLog('WARN', 'Auth Session cleared. Anonymous browsing active.', 'Auth-Service');
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Book CRUD
  const addBook = (newBookData: Omit<Book, 'id'> & { id?: string }) => {
    const rawId = newBookData.id?.trim();
    const finalId = rawId && rawId.length > 0 ? rawId : `BK-${1000 + books.length + 1}`;

    // Prevent duplicate ID collision
    const existingIndex = books.findIndex(b => b.id.toLowerCase() === finalId.toLowerCase());
    if (existingIndex !== -1) {
      addToast('Book ID Exists', `Book with ID "${finalId}" already exists ("${books[existingIndex].title}"). Please specify a unique ID.`, 'error');
      return;
    }

    const newBook: Book = { ...newBookData, id: finalId };
    setBooks(prev => [newBook, ...prev]);
    saveBookToFirestore(newBook);
    addToast('Book Added Successfully', `"${newBook.title}" (${finalId}) added to catalog under ${newBook.shelfLocation}`, 'success');
    addSystemLog('SUCCESS', `POST /api/v1/books -> Created Book ID ${finalId} (${newBook.title})`, 'Catalog-API');
  };

  const updateBook = (id: string, bookData: Partial<Book>) => {
    const updatedId = bookData.id?.trim() || id;
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, ...bookData, id: updatedId } : b))
    );
    updateBookInFirestore(id, { ...bookData, id: updatedId });
    addToast('Book Updated', `Book ID ${updatedId} information has been updated.`, 'success');
    addSystemLog('INFO', `PUT /api/v1/books/${id} -> Updated details`, 'Catalog-API');
  };

  const deleteBook = (id: string) => {
    const bookToDelete = books.find(b => b.id === id);
    setBooks(prev => prev.filter(b => b.id !== id));
    deleteBookFromFirestore(id);
    addToast('Book Deleted', `"${bookToDelete?.title || id}" was removed from the catalog and database.`, 'warning');
    addSystemLog('WARN', `DELETE /api/v1/books/${id} -> Removed from Firestore database`, 'Catalog-API');
  };

  // Borrowing workflow
  const borrowBook = (bookId: string): boolean => {
    if (currentRole !== 'student' || !currentStudent) {
      setIsAuthModalOpen(true);
      addToast('Authentication Required', 'Please log in as a student to borrow books from the library.', 'warning');
      return false;
    }

    const targetBook = books.find(b => b.id === bookId);
    if (!targetBook) {
      addToast('Error', 'Selected book was not found.', 'error');
      return false;
    }

    if (targetBook.availableCopies <= 0) {
      addToast('Out of Stock', `"${targetBook.title}" currently has no copies available for checkout.`, 'error');
      return false;
    }

    // Check student borrow limit
    const activeStudentLoans = borrowRecords.filter(
      r => r.studentId === currentStudent.id && r.status !== 'Submitted'
    );

    if (activeStudentLoans.length >= currentStudent.maxBorrowLimit) {
      addToast(
        'Borrow Limit Reached',
        `You currently have ${activeStudentLoans.length} active loans (Limit: ${currentStudent.maxBorrowLimit}). Please submit a book before borrowing another.`,
        'warning'
      );
      return false;
    }

    // Check if student already borrowed this specific book without submitting
    const existingActiveRecord = activeStudentLoans.find(r => r.bookId === bookId);
    if (existingActiveRecord) {
      addToast('Already Borrowed', `You already have an active loan for "${targetBook.title}".`, 'info');
      return false;
    }

    // Create new borrow record
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // 14-day standard checkout period

    const newBorrowRecord: BorrowRecord = {
      id: `BR-${today.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentRollNo: currentStudent.rollNumber,
      studentDepartment: currentStudent.department,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookAuthor: targetBook.author,
      bookCover: targetBook.coverImage,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Not Submitted'
    };

    // Update book available copies (-1)
    const newAvail = Math.max(0, targetBook.availableCopies - 1);
    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, availableCopies: newAvail } : b))
    );
    updateBookInFirestore(bookId, { availableCopies: newAvail });

    setBorrowRecords(prev => [newBorrowRecord, ...prev]);
    saveBorrowRecordToFirestore(newBorrowRecord);

    addToast(
      'Book Borrowed Successfully!',
      `Due Date: ${newBorrowRecord.dueDate}. Collect your physical copy from ${targetBook.shelfLocation}.`,
      'success'
    );

    addSystemLog(
      'SUCCESS',
      `POST /api/v1/borrow -> Issued "${targetBook.title}" to ${currentStudent.rollNumber}`,
      'Borrow-Service'
    );

    return true;
  };

  // Librarian action: Issue Book directly
  const issueBookByLibrarian = (data: {
    studentRollNo: string;
    bookId: string;
    dueDateDays?: number;
    remarks?: string;
  }): boolean => {
    let student = (studentsList || []).find(
      s => s && s.rollNumber && data.studentRollNo && s.rollNumber.toLowerCase().trim() === data.studentRollNo.toLowerCase().trim()
    );

    if (!student) {
      const cleanRoll = (data.studentRollNo || 'STU-001').toLowerCase().trim();
      const baseEmail = `${cleanRoll}@sritcbe.ac.in`;
      let finalEmail = baseEmail;
      let counter = 1;
      while ((studentsList || []).some(s => s && s.email && s.email.toLowerCase().trim() === finalEmail.toLowerCase().trim())) {
        finalEmail = `student.${cleanRoll}.${counter}@sritcbe.ac.in`;
        counter++;
      }

      student = {
        id: `STU-${Date.now()}`,
        rollNumber: data.studentRollNo || 'STU-001',
        name: `Student (${data.studentRollNo || 'STU-001'})`,
        email: finalEmail,
        department: 'Computer Science & Eng',
        year: '3rd Year',
        batch: '2022-2026 Batch',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        phone: '+1 (555) 019-2834',
        joinedDate: new Date().toISOString().split('T')[0],
        maxBorrowLimit: systemSettings.maxBooksPerStudent || 5
      };
      setStudentsList(prev => [...prev, student!]);
    }

    const targetBook = (books || []).find(
      b => b && b.id && data.bookId && b.id.toLowerCase().trim() === data.bookId.toLowerCase().trim()
    );

    if (!targetBook) {
      addToast('Error', `Book ID "${data.bookId}" not found in catalog.`, 'error');
      return false;
    }

    if (targetBook.availableCopies <= 0) {
      addToast('Out of Stock', `"${targetBook.title}" has 0 available copies.`, 'error');
      return false;
    }

    const today = new Date();
    const loanPeriodDays = data.dueDateDays || systemSettings.maxLoanDays || 10;
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + loanPeriodDays);

    const newBorrowRecord: BorrowRecord = {
      id: `BR-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNumber,
      studentDepartment: student.department,
      studentEmail: student.email,
      bookId: targetBook.id,
      bookTitle: targetBook.title,
      bookAuthor: targetBook.author,
      bookCover: targetBook.coverImage,
      bookEdition: targetBook.edition,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Not Submitted',
      handledByStaffId: currentStaff?.staffId || 'STAFF-01',
      remarks: data.remarks || 'Issued physically at Library Circulation Counter'
    };

    // Decrement book available copies
    const newAvail = Math.max(0, targetBook.availableCopies - 1);
    setBooks(prev =>
      prev.map(b => (b.id === targetBook.id ? { ...b, availableCopies: newAvail } : b))
    );
    updateBookInFirestore(targetBook.id, { availableCopies: newAvail });

    setBorrowRecords(prev => [newBorrowRecord, ...prev]);
    saveBorrowRecordToFirestore(newBorrowRecord);

    addToast(
      'Book Issued Successfully!',
      `Issued "${targetBook.title}" to ${student.name} (${student.rollNumber}). Due: ${newBorrowRecord.dueDate}`,
      'success'
    );

    addSystemLog(
      'SUCCESS',
      `Librarian ${currentStaff?.staffId || 'Staff'} issued "${targetBook.title}" to student ${student.rollNumber}`,
      'Borrow-Service'
    );

    return true;
  };

  // Staff action: Mark book as submitted/returned
  const markAsSubmitted = (borrowRecordId: string, remarks?: string) => {
    const record = borrowRecords.find(r => r.id === borrowRecordId);
    if (!record) return;

    if (record.status === 'Submitted') {
      addToast('Already Submitted', 'This borrowing record is already marked as submitted.', 'info');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Update borrow record status to Submitted
    const updatedRecordFields = {
      status: 'Submitted' as const,
      returnDate: todayStr,
      handledByStaffId: currentStaff?.staffId || 'STAFF-AUTO',
      remarks: remarks || 'Returned and verified by library staff'
    };

    setBorrowRecords(prev =>
      prev.map(r => (r.id === borrowRecordId ? { ...r, ...updatedRecordFields } : r))
    );
    updateBorrowRecordInFirestore(borrowRecordId, updatedRecordFields);

    // Increase available copies (+1) for that book
    const targetBook = books.find(b => b.id === record.bookId);
    if (targetBook) {
      const newAvail = Math.min(targetBook.totalCopies, targetBook.availableCopies + 1);
      setBooks(prev =>
        prev.map(b => (b.id === record.bookId ? { ...b, availableCopies: newAvail } : b))
      );
      updateBookInFirestore(record.bookId, { availableCopies: newAvail });
    }

    addToast(
      'Submission Processed',
      `Book "${record.bookTitle}" marked as Submitted for student ${record.studentName} (${record.studentRollNo}). Copies incremented in inventory.`,
      'success'
    );

    addSystemLog(
      'SUCCESS',
      `PUT /api/v1/borrow/${borrowRecordId}/submit -> Marked as Returned by Staff ${currentStaff?.staffId || 'System'}`,
      'Borrow-Service'
    );
  };

  // Staff action: Return book directly
  const returnBookByLibrarian = (borrowRecordId: string, remarks?: string) => {
    markAsSubmitted(borrowRecordId, remarks);
  };

  // Student / Staff CRUD for Admin
  const addStudent = (studentData: Omit<StudentProfile, 'id'>) => {
    const cleanEmail = studentData.email.toLowerCase().trim();
    if (studentsList.some(s => s.email.toLowerCase().trim() === cleanEmail)) {
      addToast('Email Conflict', `Email "${studentData.email}" is already registered to another student. Students must have unique email addresses.`, 'error');
      return;
    }
    const newStudent: StudentProfile = {
      ...studentData,
      email: cleanEmail,
      id: `STU-${Date.now()}`
    };
    setStudentsList(prev => [newStudent, ...prev]);
    saveStudentToFirestore(newStudent);
    addToast('Student Added', `Added student ${newStudent.name} (${newStudent.rollNumber}).`, 'success');
  };

  const updateStudent = (id: string, data: Partial<StudentProfile>) => {
    if (data.email) {
      const cleanEmail = data.email.toLowerCase().trim();
      if (studentsList.some(s => s.id !== id && s.email.toLowerCase().trim() === cleanEmail)) {
        addToast('Email Conflict', `Email "${data.email}" is already used by another student.`, 'error');
        return;
      }
    }
    setStudentsList(prev => prev.map(s => (s.id === id ? { ...s, ...data, ...(data.email ? { email: data.email.toLowerCase().trim() } : {}) } : s)));
    updateStudentInFirestore(id, data);
    addToast('Student Profile Updated', 'Student details updated successfully.', 'success');
  };

  const deleteStudent = (id: string) => {
    const studentToDelete = studentsList.find(s => s.id === id);
    setStudentsList(prev => prev.filter(s => s.id !== id));
    
    // Also clean offline registered storage if applicable
    if (studentToDelete?.email) {
      try {
        const cleanEmail = studentToDelete.email.toLowerCase().trim();
        const offlineList = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
        const filteredOffline = offlineList.filter((s: any) => s.uid !== id && s.email?.toLowerCase().trim() !== cleanEmail);
        localStorage.setItem('lms_offline_registered_students', JSON.stringify(filteredOffline));
      } catch (e) {}
    }

    deleteStudentFromFirestore(id);
    addToast('Student Removed', `Student record "${studentToDelete?.name || id}" has been removed.`, 'warning');
  };

  const purgeDuplicateStudents = () => {
    setStudentsList(prev => {
      const seenEmails = new Set<string>();
      const seenRolls = new Set<string>();
      const cleaned: StudentProfile[] = [];
      const duplicateIdsToDelete: string[] = [];

      for (const s of prev) {
        const emailKey = s.email ? s.email.toLowerCase().trim() : '';
        const rollKey = s.rollNumber ? s.rollNumber.toLowerCase().trim() : '';

        if (emailKey && seenEmails.has(emailKey)) {
          duplicateIdsToDelete.push(s.id);
          continue;
        }
        if (rollKey && seenRolls.has(rollKey)) {
          duplicateIdsToDelete.push(s.id);
          continue;
        }

        if (emailKey) seenEmails.add(emailKey);
        if (rollKey) seenRolls.add(rollKey);
        cleaned.push(s);
      }

      // Delete extra duplicate docs from Firestore
      duplicateIdsToDelete.forEach(id => {
        deleteStudentFromFirestore(id);
      });

      // Also clean offline registered storage
      try {
        const offlineList = JSON.parse(localStorage.getItem('lms_offline_registered_students') || '[]');
        const seenOffEmails = new Set<string>();
        const cleanedOffline = offlineList.filter((s: any) => {
          const e = s.email?.toLowerCase().trim();
          if (!e || seenOffEmails.has(e)) return false;
          seenOffEmails.add(e);
          return true;
        });
        localStorage.setItem('lms_offline_registered_students', JSON.stringify(cleanedOffline));
      } catch (e) {}

      try {
        localStorage.setItem('lms_students', JSON.stringify(cleaned));
      } catch (e) {}

      return cleaned;
    });

    addToast('Duplicates Purged', 'Duplicate student email records have been cleaned and merged.', 'success');
  };

  const addStaffMember = async (staffData: Omit<StaffProfile, 'id'>) => {
    const cleanEmail = staffData.email.toLowerCase().trim();
    const cleanStaffId = staffData.staffId.toLowerCase().trim();

    if (staffList.some(s => s.email && s.email.toLowerCase().trim() === cleanEmail)) {
      addToast('Email Conflict', `Email "${staffData.email}" is already assigned to another staff member. Staff must have unique email addresses.`, 'error');
      return;
    }
    if (staffList.some(s => s.staffId && s.staffId.toLowerCase().trim() === cleanStaffId)) {
      addToast('Staff ID Conflict', `Staff ID "${staffData.staffId}" is already assigned.`, 'error');
      return;
    }

    // If password is provided, attempt to register in Firebase Auth
    let staffUid = `STAFF-${Date.now()}`;
    const staffPassword = staffData.password || 'Staff@123';

    try {
      const regRes = await registerUserWithFirebase(cleanEmail, staffPassword, {
        name: staffData.name,
        role: 'staff',
        staffId: staffData.staffId,
        department: staffData.department,
        position: staffData.position
      });
      if (regRes?.user?.uid) {
        staffUid = regRes.user.uid;
      }
    } catch (authErr) {
      console.warn('Firebase Auth staff creation note:', authErr);
    }

    const newStaff: StaffProfile = {
      ...staffData,
      email: cleanEmail,
      id: staffUid,
      avatar: staffData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      joinedDate: staffData.joinedDate || new Date().toISOString().split('T')[0],
      role: 'staff'
    };

    setStaffList(prev => [newStaff, ...prev]);
    saveStaffToFirestore(newStaff);

    addToast('Staff Member Authorized', `Created staff account for ${newStaff.name} (${newStaff.staffId}). They can now log in using their email or Staff ID.`, 'success');
  };

  const updateStaffMember = (id: string, data: Partial<StaffProfile>) => {
    setStaffList(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    updateStaffInFirestore(id, data);
    addToast('Staff Updated', 'Staff details updated in system and Firestore database.', 'success');
  };

  const deleteStaffMember = (id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
    deleteStaffFromFirestore(id);
    addToast('Staff Removed', 'Staff account removed from system and Firestore.', 'warning');
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (categoriesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      addToast('Category Exists', `Category "${trimmed}" already exists in library catalog.`, 'warning');
      return;
    }
    const updated = [...categoriesList, trimmed];
    setCategoriesList(updated);
    saveCategoriesToFirestore(updated);
    addToast('Category Added', `Added category "${trimmed}".`, 'success');
  };

  const editCategory = (oldCat: string, newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    const updated = categoriesList.map(c => (c === oldCat ? trimmed : c));
    setCategoriesList(updated);
    saveCategoriesToFirestore(updated);
    setBooks(prev => prev.map(b => (b.category === oldCat ? { ...b, category: trimmed } : b)));
    addToast('Category Renamed', `Renamed "${oldCat}" to "${trimmed}".`, 'success');
  };

  const deleteCategory = (categoryName: string) => {
    const updated = categoriesList.filter(c => c !== categoryName);
    setCategoriesList(updated);
    saveCategoriesToFirestore(updated);
    addToast('Category Deleted', `Removed category "${categoryName}".`, 'warning');
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => {
      const merged = { ...prev, ...newSettings };
      saveSystemSettingsToFirestore(merged);
      return merged;
    });
    addToast('System Settings Saved', 'Library configuration parameters updated in database.', 'success');
  };

  const updateStudentProfile = async (updatedProfile: Partial<StudentProfile>) => {
    if (!currentStudent) return;
    const newAvatar =
      updatedProfile.avatar ||
      updatedProfile.photoURL ||
      updatedProfile.photoUrl ||
      currentStudent.avatar ||
      currentStudent.photoURL ||
      currentStudent.photoUrl ||
      '';
    const updated: StudentProfile = {
      ...currentStudent,
      ...updatedProfile,
      avatar: newAvatar,
      photoURL: newAvatar,
      photoUrl: newAvatar
    };
    setCurrentStudent(updated);
    setStudentsList(prev => prev.map(s => (s.id === updated.id || (s.rollNumber && updated.rollNumber && s.rollNumber.toLowerCase() === updated.rollNumber.toLowerCase())) ? updated : s));

    if (auth.currentUser) {
      try {
        await updateStudentProfileInFirestore(auth.currentUser.uid, {
          name: updatedProfile.name,
          rollNumber: updatedProfile.rollNumber,
          department: updatedProfile.department,
          year: updatedProfile.year,
          batch: updatedProfile.batch,
          phone: updatedProfile.phone,
          avatar: newAvatar
        });
      } catch (err) {
        console.error('Failed to update student profile in Firestore:', err);
      }
    }

    addToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const updateStaffProfile = async (updatedProfile: Partial<StaffProfile>) => {
    if (!currentStaff) return;
    const newAvatar =
      updatedProfile.avatar ||
      updatedProfile.photoURL ||
      updatedProfile.photoUrl ||
      currentStaff.avatar ||
      currentStaff.photoURL ||
      currentStaff.photoUrl ||
      '';
    const updated: StaffProfile = {
      ...currentStaff,
      ...updatedProfile,
      avatar: newAvatar,
      photoURL: newAvatar,
      photoUrl: newAvatar
    };
    setCurrentStaff(updated);
    try {
      localStorage.setItem('lms_current_staff', JSON.stringify(updated));
    } catch (e) {}

    setStaffList(prev => {
      const next = prev.map(s => (s.id === updated.id || (s.staffId && updated.staffId && s.staffId.toLowerCase() === updated.staffId.toLowerCase()) ? updated : s));
      try {
        localStorage.setItem('lms_staff', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (updated.id) {
      try {
        await updateStaffInFirestore(updated.id, updated);
      } catch (err) {
        console.warn('Could not update staff in Firestore:', err);
      }
    }
    if (auth.currentUser?.uid && auth.currentUser.uid !== updated.id) {
      try {
        await updateStaffInFirestore(auth.currentUser.uid, updated);
      } catch (err) {
        console.warn('Could not update auth staff doc in Firestore:', err);
      }
    }

    addToast('Staff Profile Updated', 'Your staff profile and avatar have been saved.', 'success');
  };

  const updateAdminProfile = async (updatedProfile: Partial<AdminProfile>) => {
    const prevAdmin = currentAdmin || {
      id: auth.currentUser?.uid || 'admin-root-01',
      adminId: 'ADM-001',
      staffId: 'ADM-001',
      name: 'System Administrator',
      email: 'admin@university.edu',
      department: 'Central University Library',
      position: 'Chief Administrator & DevOps',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 019-2834',
      joinedDate: '2018-01-01',
      role: 'admin'
    };

    const newAvatar =
      updatedProfile.avatar ||
      updatedProfile.photoURL ||
      updatedProfile.photoUrl ||
      prevAdmin.avatar ||
      prevAdmin.photoURL ||
      prevAdmin.photoUrl ||
      '';

    const updated: AdminProfile = {
      ...prevAdmin,
      ...updatedProfile,
      avatar: newAvatar,
      photoURL: newAvatar,
      photoUrl: newAvatar
    };

    setCurrentAdmin(updated);
    try {
      localStorage.setItem('lms_current_admin', JSON.stringify(updated));
    } catch (e) {}

    // If logged in via Firebase Auth, update Firestore user doc
    const currentUid = auth.currentUser?.uid || (updated.id !== 'admin-root-01' ? updated.id : null);
    if (currentUid) {
      try {
        await updateAdminProfileInFirestore(currentUid, {
          name: updated.name,
          email: updated.email,
          department: updated.department,
          position: updated.position,
          staffId: updated.staffId || updated.adminId,
          adminId: updated.adminId || updated.staffId,
          avatar: newAvatar,
          photoURL: newAvatar,
          photoUrl: newAvatar,
          phone: updated.phone,
          role: 'admin'
        });
      } catch (err) {
        console.error('Failed to update admin profile in Firestore:', err);
      }
    }

    addToast('Admin Profile Updated ✓', 'Your administrator identity, credentials, and avatar have been saved.', 'success');
  };

  // Feedback and Comment Optimization actions
  const addFeedback = async (data: {
    bookId: string;
    bookTitle: string;
    bookAuthor?: string;
    bookCategory?: string;
    rating: number;
    comment: string;
    category: FeedbackCategory;
  }): Promise<boolean> => {
    const authUser = auth.currentUser;
    const student = currentStudent;

    if (!student && !authUser) {
      addToast('Sign-In Required', 'Please sign in with your student account to submit a review.', 'warning');
      openAuthModal('signin', 'student');
      return false;
    }

    const studentId = authUser?.uid || student?.id || 'stu-session';
    const studentName = student?.name || authUser?.displayName || (student?.email ? student.email.split('@')[0] : 'Student Reviewer');
    const studentRollNo = student?.rollNumber || student?.rollNo || '';
    const studentDepartment = student?.department || '';

    // Classify comment using the optimization service
    const { optimizedCategory, priority } = classifyComment(data.comment, data.category);

    const feedbackId = `FB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newFeedback: BookFeedback = {
      id: feedbackId,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      bookAuthor: data.bookAuthor,
      bookCategory: data.bookCategory,
      studentId,
      studentName,
      studentRollNo,
      studentDepartment,
      rating: data.rating,
      comment: data.comment.trim(),
      category: data.category,
      optimizedCategory,
      priority,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    setFeedbackList(prev => [newFeedback, ...prev]);

    try {
      await saveBookFeedbackToFirestore(newFeedback);
      addToast('Feedback Submitted ✓', 'Thank you! Your feedback has been recorded and optimized.', 'success');
      addSystemLog('SUCCESS', `Book review submitted for "${data.bookTitle}" by ${studentName}`, 'Catalog-API');
      return true;
    } catch (err) {
      console.warn('Saved feedback locally (Firestore offline):', err);
      addToast('Feedback Recorded ✓', 'Your feedback has been saved.', 'success');
      return true;
    }
  };

  const updateFeedbackStatus = async (id: string, status: FeedbackStatus, reply?: string): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const updater: Partial<BookFeedback> = {
      status,
      updatedAt: timestamp,
      ...(status === 'Reviewed' ? { reviewedAt: timestamp } : {}),
      ...(status === 'Resolved' ? { resolvedAt: timestamp } : {})
    };

    if (reply !== undefined) {
      updater.librarianReply = reply;
      updater.repliedByStaffId = currentStaff?.staffId || currentAdmin?.staffId || 'STAFF-001';
      updater.repliedByStaffName = currentStaff?.name || currentAdmin?.name || 'Library Staff';
      updater.repliedAt = timestamp;
    }

    setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, ...updater } : f));

    try {
      await updateBookFeedbackInFirestore(id, updater);
      addToast('Status Updated', `Feedback marked as ${status}.`, 'success');
      return true;
    } catch (err) {
      addToast('Status Updated', `Feedback status updated locally.`, 'success');
      return true;
    }
  };

  const updateFeedbackPriority = async (id: string, priority: FeedbackPriority): Promise<boolean> => {
    setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, priority, updatedAt: new Date().toISOString() } : f));
    try {
      await updateBookFeedbackInFirestore(id, { priority, updatedAt: new Date().toISOString() });
      addToast('Priority Updated', `Priority set to ${priority}.`, 'info');
      return true;
    } catch (err) {
      return true;
    }
  };

  const deleteFeedback = async (id: string): Promise<boolean> => {
    setFeedbackList(prev => prev.filter(f => f.id !== id));
    try {
      await deleteBookFeedbackFromFirestore(id);
      addToast('Feedback Removed', 'Feedback entry has been deleted.', 'info');
      return true;
    } catch (err) {
      return true;
    }
  };

  const getFeedbackForBook = (bookId: string): BookFeedback[] => {
    if (!bookId) return [];
    return feedbackList.filter(f => f.bookId.toLowerCase().trim() === bookId.toLowerCase().trim());
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        borrowRecords,
        studentsList,
        staffList,
        categoriesList,
        systemSettings,
        feedbackList,
        currentRole,
        currentStudent,
        currentStaff,
        currentAdmin,
        filters,
        activeTab,
        selectedBook,
        isAuthModalOpen,
        authMode,
        authRoleTab,
        setAuthRoleTab,
        toasts,
        theme,
        themePalette,
        systemLogs,
        isAuthLoading,
        setRole,
        setActiveTab,
        setFilters,
        resetFilters,
        setSelectedBook,
        setIsAuthModalOpen,
        setAuthMode,
        openAuthModal,
        registerStudent,
        verifyStudentEmailAndCreateProfile,
        registerStaff,
        signInWithFirebase,
        signOutWithFirebase,
        toggleTheme,
        setThemePalette,
        addFeedback,
        updateFeedbackStatus,
        updateFeedbackPriority,
        deleteFeedback,
        getFeedbackForBook,
        addBook,
        updateBook,
        deleteBook,
        addCategory,
        editCategory,
        deleteCategory,
        borrowBook,
        issueBookByLibrarian,
        markAsSubmitted,
        returnBookByLibrarian,
        addStudent,
        updateStudent,
        deleteStudent,
        purgeDuplicateStudents,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        updateSystemSettings,
        addToast,
        removeToast,
        addSystemLog,
        updateStudentProfile,
        updateStaffProfile,
        updateAdminProfile
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
