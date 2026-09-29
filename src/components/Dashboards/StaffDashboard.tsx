import React, { useState, useRef } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { AddEditBookModal } from '../Catalog/AddEditBookModal';
import { ExportModal } from './ExportModal';
import { BarcodeScannerModal } from '../Scanner/BarcodeScannerModal';
import { StudentIDScannerModal } from '../Scanner/StudentIDScannerModal';
import { StudentCirculationModal } from './StudentCirculationModal';
import { StaffProfileModal } from './StaffProfileModal';
import { StaffCommentOptimization } from './StaffCommentOptimization';
import { compressImageToBase64, fetchStudentByBarcodeFromFirestore } from '../../lib/firebase';
import { Book, StudentProfile, StaffProfile } from '../../types';
import { downloadAllBarcodesPDF, downloadSingleBookBarcode, downloadAllBarcodesCSV } from '../../utils/barcodeService';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookPlus,
  RotateCcw,
  FileSpreadsheet,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Camera,
  Download,
  Mail,
  Phone,
  RefreshCw,
  UserCheck,
  QrCode,
  Sparkles,
  Layers,
  DollarSign,
  Calendar,
  Building2,
  UserPlus,
  PanelLeft,
  PanelTop,
  Library,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Menu,
  X,
  Eye,
  MapPin,
  Barcode,
  CreditCard,
  ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const StaffDashboard: React.FC = () => {
  const {
    currentStaff,
    borrowRecords,
    books,
    studentsList,
    staffList,
    systemSettings,
    markAsSubmitted,
    deleteBook,
    issueBookByLibrarian,
    addStudent,
    deleteStudent,
    purgeDuplicateStudents,
    addStaffMember,
    deleteStaffMember,
    updateSystemSettings,
    setIsAuthModalOpen,
    openAuthModal,
    currentRole,
    addToast,
    updateStaffProfile
  } = useLibrary();

  // Active Sidebar Menu Item
  const [sidebarTab, setSidebarTab] = useState<
    | 'dashboard'
    | 'books'
    | 'students'
    | 'issue_book'
    | 'return_book'
    | 'borrow_records'
    | 'reports'
    | 'comment_optimization'
    | 'notifications'
    | 'settings'
  >('dashboard');

  // Sidebar Collapse & Mobile Menu State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Forms
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  // Issue Book Form State
  const [issueStudentRoll, setIssueStudentRoll] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [issueDueDays, setIssueDueDays] = useState(systemSettings.maxLoanDays || 10);
  const [issueRemarks, setIssueRemarks] = useState('');

  // Student ID Barcode Scanner & Search State
  const [isStudentScannerOpen, setIsStudentScannerOpen] = useState(false);
  const [isSearchingStudentBarcode, setIsSearchingStudentBarcode] = useState(false);
  const [scannedStudentBarcode, setScannedStudentBarcode] = useState<string | null>(null);
  const [studentScanError, setStudentScanError] = useState<string | null>(null);
  const [studentScanSuccess, setStudentScanSuccess] = useState<boolean>(false);
  const [scannedStudentData, setScannedStudentData] = useState<StudentProfile | null>(null);

  // Dropdown Autocomplete Visibility State
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);

  // Return Book Search State
  const [returnSearch, setReturnSearch] = useState('');

  // General Searches & Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState<string>('all');
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});
  const [borrowRecordSearch, setBorrowRecordSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Not Submitted' | 'Submitted' | 'Overdue'>('all');

  // Selected Student for Issue & Return Details Modal
  const [selectedStudentForCirculation, setSelectedStudentForCirculation] = useState<StudentProfile | null>(null);

  // New Student Form Modal State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: 'Computer Science & Eng',
    year: '3rd Year',
    batch: '2022-2026 Batch',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    joinedDate: new Date().toISOString().split('T')[0],
    maxBorrowLimit: 5
  });

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState(systemSettings);

  // Staff Profile Modal State & Direct Photo Upload
  const [isStaffProfileModalOpen, setIsStaffProfileModalOpen] = useState(false);
  const [isUploadingStaffPhoto, setIsUploadingStaffPhoto] = useState(false);
  const staffQuickFileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image Too Large', 'Please select an image smaller than 2 MB.', 'error');
      return;
    }

    try {
      setIsUploadingStaffPhoto(true);
      const compressedBase64 = await compressImageToBase64(file, 400, 0.85);
      await updateStaffProfile({
        avatar: compressedBase64,
        photoURL: compressedBase64
      });
      addToast('Profile Picture Updated 📸', 'Your staff profile photo has been updated.', 'success');
    } catch (err: any) {
      console.error('Staff avatar upload error:', err);
      addToast('Upload Error', err?.message || 'Failed to update profile picture.', 'error');
    } finally {
      setIsUploadingStaffPhoto(false);
    }
  };

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentStaff?.name || '',
    staffId: currentStaff?.staffId || '',
    position: currentStaff?.position || '',
    department: currentStaff?.department || '',
    email: currentStaff?.email || '',
    phone: currentStaff?.phone || '',
    avatar: currentStaff?.avatar || ''
  });

  if (currentRole !== 'staff' && currentRole !== 'librarian') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-10 text-center space-y-4 my-8 max-w-xl mx-auto shadow-xl text-slate-900 dark:text-white transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Librarian / Staff Portal Access</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Access is restricted to authorized Library Staff and Archivist accounts. Sign in with your staff account to manage circulation and library operations. Staff accounts are created and authorized by the Library Administrator in the Admin Panel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="btn-staff-portal-login"
            onClick={() => openAuthModal('signin', 'staff')}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 border border-blue-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Sign In as Staff
          </button>
        </div>
      </div>
    );
  }

  // Auto-fill student info in Issue Book (supports scanned barcode, rollNo, and rollNumber)
  const matchedStudent =
    (scannedStudentData &&
      (scannedStudentData.rollNumber?.toLowerCase().trim() === issueStudentRoll.toLowerCase().trim() ||
        scannedStudentData.rollNo?.toLowerCase().trim() === issueStudentRoll.toLowerCase().trim() ||
        (scannedStudentBarcode && scannedStudentData.barcode === scannedStudentBarcode)))
      ? scannedStudentData
      : studentsList.find(
          s =>
            s.rollNumber.toLowerCase().trim() === issueStudentRoll.toLowerCase().trim() ||
            (s.rollNo && s.rollNo.toLowerCase().trim() === issueStudentRoll.toLowerCase().trim()) ||
            (s.barcode && s.barcode.trim() === issueStudentRoll.trim()) ||
            (scannedStudentBarcode && s.barcode === scannedStudentBarcode)
        );

  // Direct Firestore student barcode scanning & verification handler
  const handleStudentBarcodeScan = async (scannedBarcode: string) => {
    const cleanBarcode = scannedBarcode.trim();
    if (!cleanBarcode) return;

    setScannedStudentBarcode(cleanBarcode);
    setStudentScanError(null);
    setStudentScanSuccess(false);
    setIsSearchingStudentBarcode(true);

    try {
      // 1. Query Firestore using where("barcode", "==", scannedBarcode)
      const foundStudent = await fetchStudentByBarcodeFromFirestore(cleanBarcode);

      if (foundStudent) {
        setScannedStudentData(foundStudent);
        setIssueStudentRoll(foundStudent.rollNo || foundStudent.rollNumber);
        setStudentScanSuccess(true);
        setStudentScanError(null);
        addToast(
          'Student Identified Successfully 🎉',
          `${foundStudent.name} (${foundStudent.department} - ${foundStudent.year}) verified via College ID Barcode`,
          'success'
        );
      } else {
        // 2. Check in memory/local studentsList as fallback
        const memoryMatch = studentsList.find(
          s => s.barcode === cleanBarcode || s.rollNumber === cleanBarcode || (s.rollNo && s.rollNo === cleanBarcode)
        );
        if (memoryMatch) {
          setScannedStudentData(memoryMatch);
          setIssueStudentRoll(memoryMatch.rollNo || memoryMatch.rollNumber);
          setStudentScanSuccess(true);
          setStudentScanError(null);
          addToast(
            'Student Identified Successfully 🎉',
            `${memoryMatch.name} (${memoryMatch.department}) verified via College ID Barcode`,
            'success'
          );
        } else {
          setScannedStudentData(null);
          setStudentScanSuccess(false);
          setStudentScanError(
            `No registered student found in Firebase Firestore with ID Barcode: ${cleanBarcode}. Please verify ID card or search by Roll Number manually.`
          );
          addToast('Student Not Found', `No student found with barcode ${cleanBarcode}`, 'error');
        }
      }
    } catch (err: any) {
      console.error('Error querying student by barcode in Firestore:', err);
      setStudentScanError(err?.message || 'Error querying student record in Firebase Firestore.');
      addToast('Search Error', 'Failed to query student record in Firebase', 'error');
    } finally {
      setIsSearchingStudentBarcode(false);
    }
  };

  // Auto-fill book info in Issue Book (matches Book ID, ISBN, or barcode)
  const normalizedIssueQuery = issueBookId.toLowerCase().trim().replace(/[-\s]/g, '');
  const matchedBook = books.find(b => {
    if (!b || !issueBookId.trim()) return false;
    const query = issueBookId.toLowerCase().trim();
    const cleanId = b.id.toLowerCase().trim().replace(/[-\s]/g, '');
    const cleanIsbn = b.isbn.toLowerCase().trim().replace(/[-\s]/g, '');
    const cleanTitle = b.title.toLowerCase().trim();
    return (
      b.id.toLowerCase().trim() === query ||
      cleanId === normalizedIssueQuery ||
      b.isbn.toLowerCase().trim() === query ||
      cleanIsbn === normalizedIssueQuery ||
      cleanTitle === query
    );
  });

  // Analytics Metrics
  const totalBooksCount = (books || []).length;
  const availableBooksCount = (books || []).reduce((acc, b) => acc + (b?.availableCopies || 0), 0);
  const totalCopiesCount = (books || []).reduce((acc, b) => acc + (b?.totalCopies || 0), 0);
  const activeLoansCount = (borrowRecords || []).filter(r => r && r.status === 'Not Submitted').length;
  const overdueLoansCount = (borrowRecords || []).filter(r => r && r.status === 'Overdue').length;
  const returnedCount = (borrowRecords || []).filter(r => r && r.status === 'Submitted').length;
  const totalStudentsCount = (studentsList || []).length;

  // Chart Data Preparation
  const categoryCountMap: Record<string, number> = {};
  (books || []).forEach(b => {
    if (b && b.category) {
      categoryCountMap[b.category] = (categoryCountMap[b.category] || 0) + 1;
    }
  });

  const categoryChartData = Object.keys(categoryCountMap).map(cat => ({
    name: cat,
    value: categoryCountMap[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];

  const borrowReturnChartData = [
    { name: 'Active Borrowed', count: activeLoansCount },
    { name: 'Returned Books', count: returnedCount },
    { name: 'Overdue Books', count: overdueLoansCount }
  ];

  const monthlyBorrowData = [
    { month: 'Jan', issued: 12, returned: 10 },
    { month: 'Feb', issued: 19, returned: 15 },
    { month: 'Mar', issued: 25, returned: 22 },
    { month: 'Apr', issued: 18, returned: 17 },
    { month: 'May', issued: 30, returned: 28 },
    { month: 'Jun', issued: 22, returned: 20 },
    { month: 'Jul', issued: 35, returned: 31 },
    { month: 'Aug', issued: activeLoansCount + returnedCount, returned: returnedCount }
  ];

  // Active borrow records for Return Book section
  const activeReturnRecords = borrowRecords.filter(r => {
    const isPending = r.status !== 'Submitted';
    const query = returnSearch.toLowerCase().trim();
    if (!query) return isPending;
    return (
      isPending &&
      (r.studentRollNo.toLowerCase().includes(query) ||
        r.studentName.toLowerCase().includes(query) ||
        r.bookId.toLowerCase().includes(query) ||
        r.bookTitle.toLowerCase().includes(query))
    );
  });

  // Filtered borrow records table
  const filteredBorrowRecords = borrowRecords.filter(r => {
    const query = borrowRecordSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.studentName.toLowerCase().includes(query) ||
      r.studentRollNo.toLowerCase().includes(query) ||
      r.bookTitle.toLowerCase().includes(query) ||
      r.bookId.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Calculate fine for overdue book
  const calculateFine = (dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const today = new Date();
    if (today <= due) return 0;
    const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
    return diffDays * (systemSettings.finePerDay || 1);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStudentRoll.trim() || !issueBookId.trim()) {
      addToast('Missing Input', 'Please provide Student Roll Number and Book ID.', 'warning');
      return;
    }

    const success = issueBookByLibrarian({
      studentRollNo: issueStudentRoll,
      bookId: issueBookId,
      dueDateDays: issueDueDays,
      remarks: issueRemarks
    });

    if (success) {
      setIssueStudentRoll('');
      setIssueBookId('');
      setIssueRemarks('');
      setScannedStudentBarcode(null);
      setStudentScanSuccess(false);
      setScannedStudentData(null);
      setStudentScanError(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.rollNumber || !newStudent.name || !newStudent.email) {
      addToast('Input Error', 'Please complete roll number, name, and email.', 'warning');
      return;
    }
    addStudent(newStudent);
    setIsAddStudentOpen(false);
    setNewStudent({
      rollNumber: '',
      name: '',
      email: '',
      department: 'Computer Science & Eng',
      year: '3rd Year',
      batch: '2022-2026 Batch',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      joinedDate: new Date().toISOString().split('T')[0],
      maxBorrowLimit: 5
    });
  };

  // Dynamic Department Extraction & Grouping for Students Directory
  const allDepartmentNames = Array.from(
    new Set(
      (studentsList || [])
        .map(s => s?.department?.trim())
        .filter((dept): dept is string => Boolean(dept && dept.trim()))
    )
  ).sort();

  const hasUnassignedDept = (studentsList || []).some(
    s => !s || !s.department || !s.department.trim()
  );

  const filteredStudents = (studentsList || []).filter(s => {
    if (!s) return false;
    const searchLower = (studentSearch || '').trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      (s.name && s.name.toLowerCase().includes(searchLower)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower)) ||
      (s.email && s.email.toLowerCase().includes(searchLower)) ||
      (s.department && s.department.toLowerCase().includes(searchLower));

    const studentDept = s.department?.trim() || 'Department Not Assigned';
    const matchesDept =
      studentDeptFilter === 'all' || studentDept === studentDeptFilter;

    return matchesSearch && matchesDept;
  });

  const groupedStudentsByDept = filteredStudents.reduce((acc, student) => {
    if (!student) return acc;
    const deptKey = student.department?.trim() || 'Department Not Assigned';
    if (!acc[deptKey]) {
      acc[deptKey] = [];
    }
    acc[deptKey].push(student);
    return acc;
  }, {} as Record<string, StudentProfile[]>);

  const toggleDeptCollapse = (deptName: string) => {
    setCollapsedDepts(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 my-4 min-h-[85vh] relative">
      {/* MOBILE TOP HEADER (Visible on screens < lg) */}
      <header className="lg:hidden bg-[#0B1220] border border-[#24324A] p-3.5 rounded-2xl flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-[#111A2E] text-[#E2E8F0] hover:text-[#14B8A6] border border-[#24324A] cursor-pointer transition-all"
            aria-label="Open Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">LIBRARY</div>
              <div className="text-[9px] font-bold text-[#14B8A6]">MANAGEMENT SYSTEM</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 rounded-xl bg-[#111A2E] text-[#14B8A6] hover:bg-[#14B8A6]/20 border border-[#24324A] cursor-pointer transition-all"
            title="Launch Scanner"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarTab('notifications')}
            className="p-2 rounded-xl bg-[#111A2E] text-[#94A3B8] hover:text-white border border-[#24324A] relative cursor-pointer transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </button>
          <img
            src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt="Profile"
            className="w-8 h-8 rounded-xl object-cover border border-[#2563EB]/40 cursor-pointer"
            onClick={() => setSidebarTab('settings')}
          />
        </div>
      </header>

      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div key="staff-mobile-drawer-wrapper" className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              key="staff-mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.aside
              key="staff-mobile-drawer-aside"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] bg-[#0B1220] border-r border-[#24324A] text-[#E2E8F0] p-4 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Header Logo & Close */}
                <div className="flex items-center justify-between pb-3 border-b border-[#24324A]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-600/30">
                      <Library className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-white">LIBRARY</div>
                      <div className="text-[9px] font-bold text-[#14B8A6]">MANAGEMENT SYSTEM</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl bg-[#111A2E] text-[#94A3B8] hover:text-white border border-[#24324A] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Dashboard Menu Item */}
                <button
                  onClick={() => {
                    setSidebarTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    sidebarTab === 'dashboard'
                      ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${sidebarTab === 'dashboard' ? 'text-white' : 'text-[#94A3B8]'}`} />
                  <span>Dashboard</span>
                </button>

                {/* Group 1: OPERATIONS */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                    OPERATIONS
                  </div>
                  <button
                    onClick={() => {
                      setSidebarTab('issue_book');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      sidebarTab === 'issue_book'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookPlus className={`w-4 h-4 ${sidebarTab === 'issue_book' ? 'text-white' : 'text-[#14B8A6]'}`} />
                      <span>Issue Book</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30">
                      New
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab('return_book');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      sidebarTab === 'return_book'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className={`w-4 h-4 ${sidebarTab === 'return_book' ? 'text-white' : 'text-[#94A3B8]'}`} />
                      <span>Return Book</span>
                    </div>
                    {activeLoansCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {activeLoansCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab('borrow_records');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      sidebarTab === 'borrow_records'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <FileSpreadsheet className={`w-4 h-4 ${sidebarTab === 'borrow_records' ? 'text-white' : 'text-[#94A3B8]'}`} />
                    <span>Borrow Records</span>
                  </button>
                </div>

                {/* Group 2: LIBRARY */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                    LIBRARY
                  </div>
                  <button
                    onClick={() => {
                      setSidebarTab('books');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      sidebarTab === 'books'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-4 h-4 ${sidebarTab === 'books' ? 'text-white' : 'text-[#94A3B8]'}`} />
                      <span>Books Catalog</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#111A2E] text-[#94A3B8] border border-[#24324A]">
                      {books.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab('students');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      sidebarTab === 'students'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-4 h-4 ${sidebarTab === 'students' ? 'text-white' : 'text-[#94A3B8]'}`} />
                      <span>Students</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#111A2E] text-[#94A3B8] border border-[#24324A]">
                      {studentsList.length}
                    </span>
                  </button>
                </div>

                {/* Group 3: INSIGHTS */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                    INSIGHTS
                  </div>
                  <button
                    onClick={() => {
                      setSidebarTab('reports');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      sidebarTab === 'reports'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <BarChart3 className={`w-4 h-4 ${sidebarTab === 'reports' ? 'text-white' : 'text-[#94A3B8]'}`} />
                    <span>Reports & Export</span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab('comment_optimization');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      sidebarTab === 'comment_optimization'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${sidebarTab === 'comment_optimization' ? 'text-white' : 'text-indigo-400'}`} />
                    <span>Comment Optimization</span>
                  </button>
                </div>

                {/* Group 4: SYSTEM */}
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                    SYSTEM
                  </div>
                  <button
                    onClick={() => {
                      setSidebarTab('notifications');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      sidebarTab === 'notifications'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className={`w-4 h-4 ${sidebarTab === 'notifications' ? 'text-white' : 'text-[#94A3B8]'}`} />
                      <span>Notifications</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab('settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      sidebarTab === 'settings'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                        : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                    }`}
                  >
                    <Settings className={`w-4 h-4 ${sidebarTab === 'settings' ? 'text-white' : 'text-[#94A3B8]'}`} />
                    <span>System Settings</span>
                  </button>
                </div>
              </div>

              {/* Drawer Profile Section */}
              <div className="pt-4 border-t border-[#24324A] space-y-3">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full py-2 px-3 bg-[#111A2E] hover:bg-[#14B8A6]/20 border border-[#24324A] hover:border-[#14B8A6]/40 text-[#14B8A6] font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" /> Launch Barcode Scanner
                </button>

                <div
                  onClick={() => {
                    setIsStaffProfileModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#111A2E] border border-[#24324A] hover:border-[#2563EB]/50 transition-all cursor-pointer group"
                  title="Click to view & change profile picture and details"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'}
                        alt={currentStaff?.name || 'Staff'}
                        className="w-10 h-10 rounded-xl object-cover border border-[#2563EB]/40 shrink-0"
                      />
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded bg-blue-600 text-white shadow">
                        <Camera className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-[#E2E8F0] truncate group-hover:text-blue-400 transition-colors">
                        {currentStaff?.name || 'Staff Member'}
                      </div>
                      <div className="text-[10px] font-semibold text-[#14B8A6] truncate">
                        {currentStaff?.position || 'Assistant Librarian'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    Edit
                  </span>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP LEFT SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-[#0B1220] border border-[#24324A] text-[#E2E8F0] p-4 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden scrollbar-none ${
          isSidebarCollapsed ? 'w-[72px] px-2.5' : 'w-64'
        }`}
      >
        <div className="space-y-4">
          {/* 1. TOP LOGO SECTION */}
          <div className={`flex items-center gap-3 pb-3 border-b border-[#24324A] ${isSidebarCollapsed ? 'justify-center' : 'px-1'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#14B8A6] flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/30 shrink-0">
              <Library className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-black tracking-wider text-white uppercase leading-tight font-sans">
                  LIBRARY
                </div>
                <div className="text-[10px] font-bold text-[#14B8A6] tracking-tight truncate">
                  MANAGEMENT SYSTEM
                </div>
              </div>
            )}
          </div>

          {/* 2. DASHBOARD ITEM */}
          <button
            onClick={() => setSidebarTab('dashboard')}
            title={isSidebarCollapsed ? 'Dashboard' : undefined}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
              sidebarTab === 'dashboard'
                ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
            } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${sidebarTab === 'dashboard' ? 'text-white' : 'text-[#94A3B8]'}`} />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          {/* 3. NAVIGATION GROUPS */}
          <nav className="space-y-4">
            {/* GROUP 1: OPERATIONS */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                  OPERATIONS
                </div>
              )}
              <button
                onClick={() => setSidebarTab('issue_book')}
                title={isSidebarCollapsed ? 'Issue Book' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  sidebarTab === 'issue_book'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <BookPlus className={`w-4 h-4 shrink-0 ${sidebarTab === 'issue_book' ? 'text-white' : 'text-[#14B8A6]'}`} />
                  {!isSidebarCollapsed && <span>Issue Book</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30">
                    New
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('return_book')}
                title={isSidebarCollapsed ? 'Return Book' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  sidebarTab === 'return_book'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className={`w-4 h-4 shrink-0 ${sidebarTab === 'return_book' ? 'text-white' : 'text-[#94A3B8]'}`} />
                  {!isSidebarCollapsed && <span>Return Book</span>}
                </div>
                {!isSidebarCollapsed && activeLoansCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {activeLoansCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('borrow_records')}
                title={isSidebarCollapsed ? 'Borrow Records' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  sidebarTab === 'borrow_records'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <FileSpreadsheet className={`w-4 h-4 shrink-0 ${sidebarTab === 'borrow_records' ? 'text-white' : 'text-[#94A3B8]'}`} />
                {!isSidebarCollapsed && <span>Borrow Records</span>}
              </button>
            </div>

            {/* GROUP 2: LIBRARY */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                  LIBRARY
                </div>
              )}
              <button
                onClick={() => setSidebarTab('books')}
                title={isSidebarCollapsed ? 'Books Catalog' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  sidebarTab === 'books'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-4 h-4 shrink-0 ${sidebarTab === 'books' ? 'text-white' : 'text-[#94A3B8]'}`} />
                  {!isSidebarCollapsed && <span>Books Catalog</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#111A2E] text-[#94A3B8] border border-[#24324A]">
                    {books.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('students')}
                title={isSidebarCollapsed ? 'Students' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  sidebarTab === 'students'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 shrink-0 ${sidebarTab === 'students' ? 'text-white' : 'text-[#94A3B8]'}`} />
                  {!isSidebarCollapsed && <span>Students</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#111A2E] text-[#94A3B8] border border-[#24324A]">
                    {studentsList.length}
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 3: INSIGHTS */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                  INSIGHTS
                </div>
              )}
              <button
                onClick={() => setSidebarTab('reports')}
                title={isSidebarCollapsed ? 'Reports & Export' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  sidebarTab === 'reports'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <BarChart3 className={`w-4 h-4 shrink-0 ${sidebarTab === 'reports' ? 'text-white' : 'text-[#94A3B8]'}`} />
                {!isSidebarCollapsed && <span>Reports & Export</span>}
              </button>

              <button
                onClick={() => setSidebarTab('comment_optimization')}
                title={isSidebarCollapsed ? 'Comment Optimization' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  sidebarTab === 'comment_optimization'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 ${sidebarTab === 'comment_optimization' ? 'text-white' : 'text-indigo-400'}`} />
                {!isSidebarCollapsed && <span>Comment Optimization</span>}
              </button>
            </div>

            {/* GROUP 4: SYSTEM */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]/60 px-3 py-1">
                  SYSTEM
                </div>
              )}
              <button
                onClick={() => setSidebarTab('notifications')}
                title={isSidebarCollapsed ? 'Notifications' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  sidebarTab === 'notifications'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Bell className={`w-4 h-4 shrink-0 ${sidebarTab === 'notifications' ? 'text-white' : 'text-[#94A3B8]'}`} />
                  {!isSidebarCollapsed && <span>Notifications</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('settings')}
                title={isSidebarCollapsed ? 'System Settings' : undefined}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  sidebarTab === 'settings'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-[#94A3B8] hover:bg-[#111A2E] hover:text-[#E2E8F0]'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Settings className={`w-4 h-4 shrink-0 ${sidebarTab === 'settings' ? 'text-white' : 'text-[#94A3B8]'}`} />
                {!isSidebarCollapsed && <span>System Settings</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* BOTTOM CONTAINER */}
        <div className="pt-4 border-t border-[#24324A] space-y-3">
          {/* PROFILE SECTION */}
          <div
            onClick={() => setIsStaffProfileModalOpen(true)}
            className={`flex items-center gap-3 p-2.5 rounded-xl bg-[#111A2E] border border-[#24324A] hover:border-[#2563EB]/50 transition-all cursor-pointer group ${
              isSidebarCollapsed ? 'justify-center p-2' : ''
            }`}
            title="Click to view & change profile picture and details"
          >
            <div className="relative shrink-0">
              <img
                src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'}
                alt={currentStaff?.name || 'Staff'}
                className="w-9 h-9 rounded-xl object-cover border border-[#2563EB]/40 shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded bg-blue-600 text-white shadow group-hover:scale-110 transition-transform">
                <Camera className="w-2.5 h-2.5" />
              </span>
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-[#E2E8F0] truncate group-hover:text-blue-400 transition-colors">
                    {currentStaff?.name || 'Staff Member'}
                  </div>
                  <div className="text-[10px] font-semibold text-[#14B8A6] truncate">
                    {currentStaff?.position || 'Assistant Librarian'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStaffProfileModalOpen(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
                  title="Edit staff profile & picture"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* COLLAPSE CONTROL BUTTON */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full py-2 px-3 text-[#94A3B8] hover:text-white hover:bg-[#111A2E] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#14B8A6]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#14B8A6]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Top Hero Banner (Librarian & Staff Operations Center) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <BookOpen className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-200 text-xs font-bold mb-3 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                Librarian & Staff Operations Center
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Library Circulation & Desk Operations
              </h1>
              <p className="text-sm text-blue-100/80 mt-2 font-medium">
                Full operational desk to issue and return books, manage student circulation, inspect catalog availability, and generate reports.
              </p>
            </div>

            {/* Staff Profile Picture Only (No Change Option) */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative">
                <img
                  src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'}
                  alt={currentStaff?.name || 'Staff Profile'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-teal-400 shadow-2xl ring-4 ring-white/15"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD VIEW (CARDS & CHARTS) */}
        {sidebarTab === 'dashboard' && (
          <div className="space-y-6">
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Total Books
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalBooksCount}</div>
                <div className="text-[10px] text-slate-400 font-mono">{totalCopiesCount} total copies</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Available
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {availableBooksCount}
                </div>
                <div className="text-[10px] text-slate-400">Ready on shelves</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <BookPlus className="w-3.5 h-3.5 text-blue-500" /> Issued
                </div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{activeLoansCount}</div>
                <div className="text-[10px] text-slate-400">Currently borrowed</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" /> Returned
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{returnedCount}</div>
                <div className="text-[10px] text-slate-400">Checked back in</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" /> Total Students
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalStudentsCount}</div>
                <div className="text-[10px] text-slate-400">Enrolled patrons</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Overdue Books
                </div>
                <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{overdueLoansCount}</div>
                <div className="text-[10px] text-slate-400">Action required</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Borrowed vs Returned vs Overdue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Borrowed vs Returned Books Status
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Live Circulation</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={borrowReturnChartData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Category-wise Books */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Category-wise Books Breakdown
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">{categoryChartData.length} Categories</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}-${entry.name || 'cat'}-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        formatter={value => <span className="text-slate-700 dark:text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: Monthly Borrow Statistics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Monthly Borrow & Return Statistics
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Academic Year 2026</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyBorrowData}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="issued" name="Books Issued" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="returned" name="Books Returned" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. ISSUE BOOK WORKFLOW PAGE */}
        {sidebarTab === 'issue_book' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Issue Physical Book to Student
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Step 2 Circulation Desk: Verify student credentials, scan or select book ID, and confirm loan record.
                </p>
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="py-2 px-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Scan Barcode
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STUDENT SECTION */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 1. Student Identification & Verification
                    </span>
                    {matchedStudent ? (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Profile Auto-filled
                      </span>
                    ) : issueStudentRoll ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Auto-Generated Info
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Student Roll Number / College ID Card <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Enter Roll No (e.g. 45726, 245863, 22IT012)..."
                          value={issueStudentRoll}
                          onFocus={() => setIsStudentDropdownOpen(true)}
                          onChange={e => {
                            setIssueStudentRoll(e.target.value);
                            setIsStudentDropdownOpen(true);
                            if (studentScanError) setStudentScanError(null);
                          }}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-bold text-slate-900 dark:text-white uppercase font-mono transition-all"
                          required
                        />
                        {issueStudentRoll && (
                          <button
                            type="button"
                            onClick={() => {
                              setIssueStudentRoll('');
                              setIsStudentDropdownOpen(false);
                              setScannedStudentBarcode(null);
                              setStudentScanSuccess(false);
                              setScannedStudentData(null);
                              setStudentScanError(null);
                            }}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}

                        {/* Autocomplete Dropdown Fallback */}
                        {isStudentDropdownOpen && (
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsStudentDropdownOpen(false)}
                          />
                        )}
                        <AnimatePresence>
                          {isStudentDropdownOpen && (
                            <motion.div
                              key="student-drop-menu-container"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                            >
                              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                                <span>Select Registered Student</span>
                                <span>{studentsList.length} Students</span>
                              </div>
                              {studentsList
                                .filter(s => {
                                  if (!issueStudentRoll.trim()) return true;
                                  const q = issueStudentRoll.toLowerCase().trim();
                                  return (
                                    (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
                                    (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
                                    (s.name && s.name.toLowerCase().includes(q)) ||
                                    (s.email && s.email.toLowerCase().includes(q)) ||
                                    (s.barcode && s.barcode.includes(q)) ||
                                    (s.department && s.department.toLowerCase().includes(q))
                                  );
                                })
                                .map((student, idx) => (
                                  <button
                                    key={`student-drop-${student.id || student.rollNumber}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      setIssueStudentRoll(student.rollNo || student.rollNumber);
                                      setScannedStudentData(student);
                                      if (student.barcode) setScannedStudentBarcode(student.barcode);
                                      setStudentScanSuccess(true);
                                      setStudentScanError(null);
                                      setIsStudentDropdownOpen(false);
                                      addToast('Student Loaded', `Auto-filled profile for ${student.name}`, 'info');
                                    }}
                                    className="w-full p-2.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
                                      />
                                      <div className="truncate">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1.5">
                                          {student.name}
                                          {student.barcode && (
                                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono">
                                              ID: {student.barcode.slice(-4)}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                          {student.department} • {student.email}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                      {student.rollNo || student.rollNumber}
                                    </span>
                                  </button>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* SCAN STUDENT ID BUTTON */}
                      <button
                        type="button"
                        id="btn-scan-student-id"
                        onClick={() => setIsStudentScannerOpen(true)}
                        className="py-2 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer border border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        title="Scan CODE128 barcode from Student College ID Card"
                      >
                        <Barcode className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan Student ID</span>
                        <span className="sm:hidden">Scan ID</span>
                      </button>
                    </div>

                    {/* Scanned Barcode Badge Display */}
                    {scannedStudentBarcode && (
                      <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-100 dark:bg-[#0B1322] border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Barcode className="w-3.5 h-3.5 text-emerald-500" />
                          <span>
                            Scanned ID Barcode: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{scannedStudentBarcode}</strong>
                            <span className="ml-1 text-[10px] text-slate-400 font-semibold">(CODE128)</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setScannedStudentBarcode(null);
                            setStudentScanSuccess(false);
                          }}
                          className="text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors cursor-pointer"
                          title="Clear barcode tag"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LOADING ANIMATION WHILE SEARCHING FIRESTORE */}
                  {isSearchingStudentBarcode && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-blue-600 dark:text-blue-400 text-xs font-semibold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                      <span>
                        Searching Firebase Firestore with <code className="font-mono font-bold bg-blue-500/20 px-1 py-0.5 rounded text-[11px]">where(&quot;barcode&quot;, &quot;==&quot;, &quot;{scannedStudentBarcode}&quot;)</code>...
                      </span>
                    </div>
                  )}

                  {/* GREEN SUCCESS MESSAGE */}
                  {studentScanSuccess && matchedStudent && !isSearchingStudentBarcode && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Student Identified Successfully</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold hidden sm:inline">
                        Firebase Verified ✓
                      </span>
                    </motion.div>
                  )}

                  {/* ERROR MESSAGE IF NO STUDENT FOUND */}
                  {studentScanError && !isSearchingStudentBarcode && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{studentScanError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStudentScanError(null)}
                        className="text-rose-500 hover:text-rose-700 dark:hover:text-white text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}

                  {/* Auto-filled Student Details Cards */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-500" /> Student Name (Auto-filled)
                        </span>
                        {matchedStudent && (
                          <span className="text-[9px] text-emerald-500 font-medium">Synced from Firebase</span>
                        )}
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={matchedStudent?.name || (issueStudentRoll ? `Student (${issueStudentRoll})` : '—')}
                        className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/80 border rounded-xl text-slate-800 dark:text-slate-200 font-bold transition-all ${
                          matchedStudent
                            ? 'border-emerald-500/50 ring-2 ring-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">
                          Department (Auto-filled)
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={matchedStudent?.department || (issueStudentRoll ? 'Electronics & Communication' : '—')}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">
                          Email Address (Auto-filled)
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={
                            matchedStudent?.email ||
                            (issueStudentRoll ? `${issueStudentRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}@sritcbe.ac.in` : '—')
                          }
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">
                          Year (Auto-filled)
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={matchedStudent?.year || (issueStudentRoll ? '3rd Year' : '—')}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold block mb-1">
                          Batch (Auto-filled)
                        </span>
                        <input
                          type="text"
                          readOnly
                          value={matchedStudent?.batch || (issueStudentRoll ? '2022-2026' : '—')}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Rich Student Status Preview Banner */}
                    {matchedStudent ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={matchedStudent.avatar}
                            alt={matchedStudent.name}
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
                          />
                          <div className="truncate">
                            <div className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 truncate flex items-center gap-1.5">
                              <span>{matchedStudent.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 font-mono text-emerald-400">
                                {matchedStudent.rollNo || matchedStudent.rollNumber}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                              {matchedStudent.department} • {matchedStudent.year} ({matchedStudent.batch || '2022-2026'})
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            Limit: {matchedStudent.maxBorrowLimit || 5} Books
                          </div>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Eligibility: Active Loan Eligible
                          </span>
                        </div>
                      </div>
                    ) : issueStudentRoll ? (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Roll number <span className="font-mono font-bold text-slate-900 dark:text-white">{issueStudentRoll}</span> not in database.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            addStudent({
                              rollNumber: issueStudentRoll,
                              rollNo: issueStudentRoll,
                              barcode: scannedStudentBarcode || undefined,
                              name: `Student (${issueStudentRoll})`,
                              email: `${issueStudentRoll.toLowerCase().replace(/[^a-z0-9]/g, '')}@sritcbe.ac.in`,
                              department: 'Electronics & Communication',
                              year: '3rd Year',
                              batch: '2022-2026',
                              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                              phone: '+1 (555) 019-2834',
                              joinedDate: new Date().toISOString().split('T')[0],
                              maxBorrowLimit: 5
                            });
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <UserPlus className="w-3 h-3" /> Save Record
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* BOOK SECTION */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 2. Book Lookup & Details
                    </span>
                    {matchedBook && (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Book Found
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Book ID / ISBN <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., BK-1001, BK-1002..."
                          value={issueBookId}
                          onFocus={() => setIsBookDropdownOpen(true)}
                          onChange={e => {
                            setIssueBookId(e.target.value);
                            setIsBookDropdownOpen(true);
                          }}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-bold text-slate-900 dark:text-white uppercase font-mono transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsScannerOpen(true)}
                          className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                          title="Open Scanner"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Book Autocomplete Dropdown */}
                      {isBookDropdownOpen && (
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsBookDropdownOpen(false)}
                        />
                      )}
                      <AnimatePresence>
                        {isBookDropdownOpen && (
                          <motion.div
                            key="book-drop-menu-container"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                          >
                            <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60">
                              Select Library Book
                            </div>
                            {(books || [])
                              .filter(b => {
                                if (!b) return false;
                                if (!issueBookId.trim()) return true;
                                const q = (issueBookId || '').toLowerCase().trim();
                                return (
                                  (b.id && b.id.toLowerCase().includes(q)) ||
                                  (b.title && b.title.toLowerCase().includes(q)) ||
                                  (b.author && b.author.toLowerCase().includes(q)) ||
                                  (b.isbn && b.isbn.toLowerCase().includes(q))
                                );
                              })
                              .map((book, idx) => (
                                <button
                                  key={`book-drop-${book.id || book.isbn || 'bk'}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setIssueBookId(book.id || '');
                                    setIsBookDropdownOpen(false);
                                    addToast('Book Loaded', `Selected "${book.title}"`, 'info');
                                  }}
                                  className="w-full p-2.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2.5 truncate">
                                    <img
                                      src={book.coverImage}
                                      alt={book.title}
                                      className="w-7 h-9 rounded object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                    />
                                    <div className="truncate">
                                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                        {book.title}
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                        {book.author} • {book.category}
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                                      book.availableCopies > 0
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {book.id} ({book.availableCopies} avail)
                                  </span>
                                </button>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Scanned Book Live Preview & Auto-filled Details */}
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    {matchedBook ? (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 shadow-md space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Scanned Book Live Preview
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                            {matchedBook.id}
                          </span>
                        </div>

                        <div className="flex items-start gap-3.5">
                          <img
                            src={matchedBook.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=250'}
                            alt={matchedBook.title}
                            className="w-18 h-24 sm:w-20 sm:h-28 object-cover rounded-xl shadow-lg border border-emerald-500/40 shrink-0"
                          />

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                {matchedBook.category}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {matchedBook.department}
                              </span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                              {matchedBook.title}
                            </h4>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              By <span className="font-semibold text-slate-900 dark:text-white">{matchedBook.author}</span>
                              {matchedBook.edition ? ` • ${matchedBook.edition}` : ''}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px]">
                              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Shelf: <strong className="font-mono text-emerald-700 dark:text-emerald-300">{matchedBook.shelfLocation}</strong>
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="font-mono text-slate-500 dark:text-slate-400">
                                ISBN: {matchedBook.isbn}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Availability Bar */}
                        <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                          <span className={`inline-flex items-center gap-1.5 font-bold ${
                            matchedBook.availableCopies > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              matchedBook.availableCopies > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`} />
                            {matchedBook.availableCopies > 0 ? 'Available for Circulation' : 'Out of Stock / Reserved'}
                          </span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            Available: <span className={matchedBook.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-rose-500'}>{matchedBook.availableCopies}</span> / {matchedBook.totalCopies} Copies
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 text-center space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Scan Barcode for Live Book Preview
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                          Click "Scan Barcode" or enter Book ID/ISBN above. The book cover, author, shelf location, and live stock details will preview here immediately.
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 text-[10px] block mb-1">Book Title (Auto-filled)</span>
                      <input
                        type="text"
                        readOnly
                        value={matchedBook?.title || '—'}
                        className={`w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border rounded-lg font-semibold ${
                          matchedBook ? 'border-emerald-500/50 text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Author</span>
                        <input
                          type="text"
                          readOnly
                          value={matchedBook?.author || '—'}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Edition</span>
                        <input
                          type="text"
                          readOnly
                          value={matchedBook?.edition || '—'}
                          className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Available Copies</span>
                        <input
                          type="text"
                          readOnly
                          value={matchedBook ? `${matchedBook.availableCopies} / ${matchedBook.totalCopies}` : '—'}
                          className={`w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border rounded-lg font-bold text-[11px] ${
                            matchedBook && matchedBook.availableCopies > 0
                              ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOAN DATES & REMARKS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 3. Circulation Dates & Remarks
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Borrow Date (Auto Today)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Loan Period (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={issueDueDays}
                      onChange={e => setIssueDueDays(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Auto Calculated Due Date
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        new Date(Date.now() + (issueDueDays || 10) * 86400000)
                          .toISOString()
                          .split('T')[0]
                      }
                      className="w-full px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Staff Remarks / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Physical copy handed over at Desk 2..."
                    value={issueRemarks}
                    onChange={e => setIssueRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={matchedBook && matchedBook.availableCopies <= 0}
                  className="py-3 px-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BookPlus className="w-4 h-4" /> Issue Book & Sync Firestore
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. RETURN BOOK WORKFLOW PAGE */}
        {sidebarTab === 'return_book' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Return Physical Book Check-in
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Search active student loan, inspect return condition, calculate fine if overdue, and increment inventory.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student roll or book ID..."
                  value={returnSearch}
                  onChange={e => setReturnSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl outline-none font-medium"
                />
              </div>
            </div>

            {/* Active Borrow Records Table for Returning */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Borrow ID & Student</th>
                    <th className="p-3.5">Book Name & Author</th>
                    <th className="p-3.5">Borrow & Due Dates</th>
                    <th className="p-3.5">Overdue Fine</th>
                    <th className="p-3.5 text-right">Submitted Action (Staff Only)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeReturnRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-500 dark:text-slate-400">
                        No active borrowed books match your search. All physical books returned!
                      </td>
                    </tr>
                  ) : (
                    activeReturnRecords.map((record, idx) => {
                      const fine = calculateFine(record.dueDate);
                      const isOverdue = fine > 0 || record.status === 'Overdue';

                      return (
                        <tr key={`active-ret-${record.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3.5">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              {record.id}
                            </span>
                            <div className="font-bold text-slate-900 dark:text-white">{record.studentName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Roll: {record.studentRollNo}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              {record.bookTitle}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              Author: <span className="font-semibold text-slate-700 dark:text-slate-300">{record.bookAuthor}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Book ID: {record.bookId}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap space-y-1">
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Borrow Date: <span className="font-bold text-slate-800 dark:text-slate-200">{record.borrowDate}</span>
                            </div>
                            <div
                              className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              Due Date: {record.dueDate}
                            </div>
                          </td>

                          <td className="p-3.5">
                            {fine > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-extrabold">
                                <DollarSign className="w-3.5 h-3.5" /> ${fine}.00 Fine
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                $0.00 (On Time)
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => markAsSubmitted(record.id)}
                              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition-all inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                              title="Click to mark as Submitted (Staff Only)"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Submitted
                            </button>
                            <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                              Staff Access Only
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. BOOKS INVENTORY CATALOG */}
        {sidebarTab === 'books' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Manage Books Catalog ({books.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add, edit, delete, or search physical library inventory.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  id="download-all-barcodes-btn"
                  onClick={async () => {
                    try {
                      const libName = systemSettings?.libraryName || 'College Central Library';
                      await downloadAllBarcodesPDF(books, libName);
                      addToast('All Barcodes File Downloaded 📄', `Generated accurate printable barcode labels sheet for ${books.length} catalog items.`, 'success');
                    } catch (err: any) {
                      addToast('Download Failed', err?.message || 'Error generating barcodes', 'error');
                    }
                  }}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  title="Download printable PDF sticker sheet with accurate barcode labels"
                >
                  <Download className="w-4 h-4" /> Download All Barcodes (PDF)
                </button>

                <button
                  id="download-all-barcodes-csv-btn"
                  onClick={() => {
                    try {
                      const libName = systemSettings?.libraryName || 'College Central Library';
                      downloadAllBarcodesCSV(books, libName);
                      addToast('Barcodes CSV Exported 📊', `Exported barcode catalog spreadsheet for ${books.length} items.`, 'success');
                    } catch (err: any) {
                      addToast('Export Failed', err?.message || 'Error generating CSV', 'error');
                    }
                  }}
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Export barcodes data as CSV/Excel spreadsheet"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Barcodes CSV
                </button>

                <button
                  onClick={() => {
                    setBookToEdit(null);
                    setIsAddBookModalOpen(true);
                  }}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Add New Book
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Book & ID</th>
                    <th className="p-3.5">Author & Category</th>
                    <th className="p-3.5">Copies Available</th>
                    <th className="p-3.5">Shelf Location</th>
                    <th className="p-3.5 text-right">Barcode & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {books.map((b, idx) => (
                    <tr key={`staff-inv-book-${b.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded shadow shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                            {b.id} • ISBN: {b.isbn}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{b.author}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{b.category}</div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            b.availableCopies > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {b.availableCopies} / {b.totalCopies} Available
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {b.shelfLocation}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const libName = systemSettings?.libraryName || 'College Central Library';
                              downloadSingleBookBarcode(b, 'pdf', libName);
                              addToast('Barcode Sticker Downloaded 🏷️', `Sticker downloaded for ${b.id} ("${b.title}")`, 'success');
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="Download PDF Barcode Sticker for this book"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Barcode</span>
                          </button>
                          <button
                            onClick={() => {
                              setBookToEdit(b);
                              setIsAddBookModalOpen(true);
                            }}
                            className="p-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-semibold cursor-pointer"
                            title="Edit Book Details"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. STUDENTS MANAGEMENT */}
        {sidebarTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Manage Students Directory ({studentsList.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View student roll numbers, departments, active borrowing limits, and profile records.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={purgeDuplicateStudents}
                  title="Remove any duplicate student accounts with matching email or roll number"
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" /> Deduplicate Records
                </button>

                <button
                  onClick={() => setIsAddStudentOpen(true)}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Add Student Record
                </button>
              </div>
            </div>

            {/* Department Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                {/* Department Filter Dropdown */}
                <div className="relative w-full sm:w-72">
                  <select
                    value={studentDeptFilter}
                    onChange={e => setStudentDeptFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-500 font-semibold cursor-pointer shadow-sm"
                  >
                    <option value="all">All Departments ({studentsList.length})</option>
                    {allDepartmentNames.map((dept, deptIdx) => {
                      const count = studentsList.filter(s => s.department?.trim() === dept).length;
                      return (
                        <option key={`dept-filter-opt-${dept}-${deptIdx}`} value={dept}>
                          {dept} ({count})
                        </option>
                      );
                    })}
                    {hasUnassignedDept && (
                      <option value="Department Not Assigned">
                        Department Not Assigned ({studentsList.filter(s => !s.department || !s.department.trim()).length})
                      </option>
                    )}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name or roll number..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-emerald-500 shadow-sm"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {(studentDeptFilter !== 'all' || studentSearch !== '') && (
                <button
                  onClick={() => {
                    setStudentDeptFilter('all');
                    setStudentSearch('');
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 cursor-pointer shrink-0"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Department Sections List */}
            {Object.keys(groupedStudentsByDept).length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No students found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {studentDeptFilter !== 'all'
                    ? `No students found in ${studentDeptFilter}.`
                    : 'No student records match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedStudentsByDept) as [string, StudentProfile[]][]).map(([deptName, studentsInDept], deptIdx) => {
                  const isCollapsed = Boolean(collapsedDepts[deptName]);

                  return (
                    <div
                      key={`dept-card-group-${deptName}-${deptIdx}`}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 overflow-hidden shadow-sm transition-all"
                    >
                      {/* Department Section Header */}
                      <div
                        onClick={() => toggleDeptCollapse(deptName)}
                        className="w-full p-4 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/90 flex items-center justify-between cursor-pointer border-b border-slate-200/80 dark:border-slate-700/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold border border-emerald-500/20">
                            <GraduationCap className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                              <span>{deptName}</span>
                              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                                ({studentsInDept.length})
                              </span>
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <span className="text-[11px] font-semibold hidden sm:inline">
                            {isCollapsed ? 'Expand' : 'Collapse'}
                          </span>
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Department Student List / Table */}
                      {!isCollapsed && (
                        <div>
                          {/* Desktop & Tablet Table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="p-3.5 pl-4">Student & Roll No</th>
                                  <th className="p-3.5">Department & Batch</th>
                                  <th className="p-3.5">Contact Email</th>
                                  <th className="p-3.5">Borrow Limit</th>
                                  <th className="p-3.5 pr-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                                {studentsInDept.map((s, idx) => (
                                  <tr
                                    key={`stu-tbl-${deptName}-${s.id || s.rollNumber || 'stu'}-${idx}`}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                  >
                                    <td
                                      onClick={() => setSelectedStudentForCirculation(s)}
                                      className="p-3.5 pl-4 flex items-center gap-3 cursor-pointer group"
                                      title={`Click to view Book Issue & Return History for ${s.name}`}
                                    >
                                      <img
                                        src={
                                          s.avatar ||
                                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                                        }
                                        alt={s.name}
                                        className="w-9 h-9 rounded-full object-cover border border-emerald-500/30 shrink-0 shadow-sm group-hover:scale-105 group-hover:border-emerald-500 transition-all"
                                      />
                                      <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                                          <span>{s.name}</span>
                                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                          Roll: {s.rollNumber}
                                        </div>
                                      </div>
                                    </td>

                                    <td
                                      onClick={() => setSelectedStudentForCirculation(s)}
                                      className="p-3.5 cursor-pointer"
                                    >
                                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                                        {s.department || 'Department Not Assigned'}
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {s.year || '3rd Year'} • {s.batch || '2022-2026 Batch'}
                                      </div>
                                    </td>

                                    <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                      {s.email}
                                    </td>

                                    <td className="p-3.5">
                                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 inline-block">
                                        Max {s.maxBorrowLimit || 5} Books
                                      </span>
                                    </td>

                                    <td className="p-3.5 pr-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          title={`View Book Issue & Return History for ${s.name}`}
                                          onClick={() => setSelectedStudentForCirculation(s)}
                                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          <span className="hidden xl:inline">Details & History</span>
                                        </button>
                                        <button
                                          title={`Issue book to ${s.name}`}
                                          onClick={() => {
                                            setIssueStudentRoll(s.rollNumber);
                                            setSidebarTab('issue_book');
                                          }}
                                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          <BookOpen className="w-3.5 h-3.5" />
                                          <span className="hidden xl:inline">Issue</span>
                                        </button>
                                        <button
                                          title={`Delete record for ${s.name} (${s.email})`}
                                          onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete student "${s.name}" (${s.rollNumber}, ${s.email})?`)) {
                                              deleteStudent(s.id);
                                            }
                                          }}
                                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span className="hidden xl:inline">Delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards Layout */}
                          <div className="md:hidden p-3 space-y-3 bg-white dark:bg-slate-900/40">
                            {studentsInDept.map((s, idx) => (
                              <div
                                key={`stu-mob-${deptName}-${s.id || s.rollNumber || 'stu'}-${idx}`}
                                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-2"
                              >
                                <div
                                  onClick={() => setSelectedStudentForCirculation(s)}
                                  className="flex items-center gap-3 cursor-pointer group"
                                  title={`Click to view Book Issue & Return History for ${s.name}`}
                                >
                                  <img
                                    src={
                                      s.avatar ||
                                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                                    }
                                    alt={s.name}
                                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shrink-0 group-hover:border-emerald-500 transition-colors"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1.5">
                                      <span>{s.name}</span>
                                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                      Roll: {s.rollNumber}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/50">
                                  <div>
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                                      Dept & Batch:
                                    </span>{' '}
                                    {s.department || 'Not Assigned'} ({s.year || '3rd Year'}, {s.batch || 'Batch'})
                                  </div>
                                  <div className="truncate">
                                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                                      Email:
                                    </span>{' '}
                                    {s.email}
                                  </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50">
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                                    Max {s.maxBorrowLimit || 5} Books
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setSelectedStudentForCirculation(s)}
                                      className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold border border-blue-500/20 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" /> Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIssueStudentRoll(s.rollNumber);
                                        setSidebarTab('issue_book');
                                      }}
                                      className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1 cursor-pointer"
                                    >
                                      <BookOpen className="w-3 h-3" /> Issue
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Delete student "${s.name}" (${s.rollNumber}, ${s.email})?`)) {
                                          deleteStudent(s.id);
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold border border-rose-500/20 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. BORROW RECORDS & AUDIT HISTORY */}
        {sidebarTab === 'borrow_records' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Borrow Records & Audit History ({borrowRecords.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete transactional ledger of issued, returned, and overdue college library books.
                </p>
              </div>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Export PDF / CSV
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, roll, or book title..."
                  value={borrowRecordSearch}
                  onChange={e => setBorrowRecordSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Statuses ({borrowRecords.length})</option>
                <option value="Not Submitted">Active Loans ({activeLoansCount})</option>
                <option value="Submitted">Returned ({returnedCount})</option>
                <option value="Overdue">Overdue ({overdueLoansCount})</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Borrow ID & Student</th>
                    <th className="p-3.5">Book Name & Author</th>
                    <th className="p-3.5">Borrow & Due Dates</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Submitted Action (Staff Only)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredBorrowRecords.map((r, idx) => (
                    <tr key={`borrow-rec-${r.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td
                        className="p-3.5 cursor-pointer group"
                        title={`Click to view full circulation profile for ${r.studentName}`}
                        onClick={() => {
                          const foundStudent = studentsList.find(s => 
                            (s.rollNumber && s.rollNumber.toLowerCase() === (r.studentRollNo || '').toLowerCase()) ||
                            (s.name && s.name.toLowerCase() === (r.studentName || '').toLowerCase())
                          ) || {
                            id: r.studentId || r.studentRollNo,
                            rollNumber: r.studentRollNo,
                            name: r.studentName,
                            email: r.studentEmail || `${(r.studentRollNo || 'student').toLowerCase()}@sritcbe.ac.in`,
                            department: r.studentDepartment || 'Engineering',
                            year: '3rd Year',
                            batch: '2022-2026 Batch',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                            phone: '',
                            joinedDate: r.borrowDate || '2024-01-01',
                            maxBorrowLimit: 5
                          };
                          setSelectedStudentForCirculation(foundStudent);
                        }}
                      >
                        <span className="font-mono font-bold text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {r.id}
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                          <span>{r.studentName}</span>
                          <Eye className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Roll: {r.studentRollNo}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {r.bookTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Author: {r.bookAuthor}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Book ID: {r.bookId}</div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] space-y-0.5">
                        <div>Borrow Date: <span className="font-bold text-slate-800 dark:text-slate-200">{r.borrowDate}</span></div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">Due Date: {r.dueDate}</div>
                        {r.returnDate && <div className="text-slate-400 text-[10px]">Returned: {r.returnDate}</div>}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            r.status === 'Submitted'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : r.status === 'Overdue'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {r.status === 'Submitted' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {r.status === 'Submitted' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                          </span>
                        ) : (
                          <button
                            onClick={() => markAsSubmitted(r.id)}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                            title="Click to mark as Submitted (Staff Only Access)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                          </button>
                        )}
                        <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                          Verified by {r.handledByStaffId || 'STAFF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. REPORTS & EXPORT */}
        {sidebarTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Library Reports & Export Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generate formatted PDF reports and CSV data dumps for department audits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm">Borrowing Audit Ledger PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export complete transaction history including student roll numbers, book IDs, issue dates, and return statuses.
                </p>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <h3 className="font-bold text-sm">Catalog Books Inventory Dump</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export catalog inventory listing total copies, available shelf counts, and category classifications.
                </p>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Inventory CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMMENT OPTIMIZATION */}
        {sidebarTab === 'comment_optimization' && (
          <StaffCommentOptimization />
        )}

        {/* 8. NOTIFICATIONS */}
        {sidebarTab === 'notifications' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Notifications & System Reminders
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automated due-date alerts dispatched to student dashboards.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-600 dark:text-amber-400">
                    Automated Due-Date Reminder Policy Active
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Students with books due within 48 hours receive automatic toast alerts on login.
                  </p>
                </div>
              </div>

              {borrowRecords
                .filter(r => r.status === 'Overdue')
                .map((r, idx) => (
                  <div key={`overdue-alert-${r.id}-${idx}`} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400">Overdue Alert:</span> {r.studentName} ({r.studentRollNo}) - "{r.bookTitle}" (Due: {r.dueDate})
                    </div>
                    <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-mono">Fine: ${calculateFine(r.dueDate)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 9. SYSTEM SETTINGS */}
        {sidebarTab === 'settings' && (
          <div className="space-y-6">
            {/* STAFF ACCOUNT & PROFILE PICTURE MANAGEMENT */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    My Staff Profile & Picture
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage your staff account credentials, department assignment, and profile photo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStaffProfileModalOpen(true)}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 border border-blue-400/30 transition-all inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Full Profile</span>
                </button>
              </div>

              {/* Profile Overview Card */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A]">
                {/* Avatar with Camera Button */}
                <div className="relative group shrink-0">
                  <img
                    src={currentStaff?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'}
                    alt={currentStaff?.name || 'Staff Member'}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-500 shadow-xl"
                  />
                  
                  <button
                    type="button"
                    onClick={() => staffQuickFileInputRef.current?.click()}
                    disabled={isUploadingStaffPhoto}
                    title="Click to choose a new photo"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-2xl text-white text-[10px] font-bold transition-all cursor-pointer backdrop-blur-[2px]"
                  >
                    {isUploadingStaffPhoto ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-teal-300 mb-1" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 mb-1 text-teal-300" />
                        <span>Change Photo</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => staffQuickFileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-transform hover:scale-110"
                    title="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details & Actions */}
                <div className="flex-1 w-full space-y-4 text-center md:text-left">
                  <div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        Staff ID: {currentStaff?.staffId || 'LIB-001'}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                        {currentStaff?.position || 'Assistant Librarian'}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {currentStaff?.name || 'Staff Member'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {currentStaff?.department || 'Central Library Admin'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{currentStaff?.email || 'staff@university.edu'}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{currentStaff?.phone || '+1 (555) 019-2834'}</span>
                    </div>
                  </div>

                  {/* Quick Change Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => staffQuickFileInputRef.current?.click()}
                      disabled={isUploadingStaffPhoto}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 border border-blue-400/30 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isUploadingStaffPhoto ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading Photo...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change Profile Picture</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStaffProfileModalOpen(true)}
                      className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-[#1E293B] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-[#334155] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Edit Profile Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM CONFIGURATION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Library System Configuration Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure default loan durations, daily fine amounts, and maximum student borrowing limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Standard Loan Duration (Days)</label>
                  <input
                    type="number"
                    value={settingsForm.maxLoanDays}
                    onChange={e => setSettingsForm({ ...settingsForm, maxLoanDays: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Overdue Fine Amount ($)</label>
                  <input
                    type="number"
                    value={settingsForm.finePerDay}
                    onChange={e => setSettingsForm({ ...settingsForm, finePerDay: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Max Books Allowed Per Student</label>
                  <input
                    type="number"
                    value={settingsForm.maxBooksPerStudent}
                    onChange={e => setSettingsForm({ ...settingsForm, maxBooksPerStudent: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Library Display Title</label>
                  <input
                    type="text"
                    value={settingsForm.libraryName}
                    onChange={e => setSettingsForm({ ...settingsForm, libraryName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => updateSystemSettings(settingsForm)}
                  className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save Settings Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AddEditBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => {
          setIsAddBookModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={code => {
          const trimmedCode = code.trim();
          setIssueBookId(trimmedCode);
          setSidebarTab('issue_book');
          const cleanCode = trimmedCode.toLowerCase().replace(/[-\s]/g, '');
          const found = (books || []).find(b => {
            if (!b) return false;
            const bId = b.id?.toLowerCase().trim().replace(/[-\s]/g, '');
            const bIsbn = b.isbn?.toLowerCase().trim().replace(/[-\s]/g, '');
            return bId === cleanCode || bIsbn === cleanCode;
          });
          if (found) {
            addToast('Book Identified 📖', `Scanned: "${found.title}" (${found.id})`, 'success');
          } else {
            addToast('Code Scanned', `Scanned Code: ${trimmedCode}`, 'info');
          }
        }}
      />

      {/* Real-time Student College ID Card Barcode Scanner Modal */}
      <StudentIDScannerModal
        isOpen={isStudentScannerOpen}
        onClose={() => setIsStudentScannerOpen(false)}
        onScanComplete={handleStudentBarcodeScan}
      />

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base">Add New Student Record</h3>
            <form onSubmit={handleCreateStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 12346"
                  value={newStudent.rollNumber}
                  onChange={e => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Email</label>
                <input
                  type="email"
                  placeholder="student@sritcbe.ac.in"
                  value={newStudent.email}
                  onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student Book Issue & Return Circulation Modal */}
      <StudentCirculationModal
        isOpen={Boolean(selectedStudentForCirculation)}
        onClose={() => setSelectedStudentForCirculation(null)}
        student={selectedStudentForCirculation}
        borrowRecords={borrowRecords}
        onMarkSubmitted={markAsSubmitted}
        onIssueBookForStudent={roll => {
          setIssueStudentRoll(roll);
          setSidebarTab('issue_book');
          addToast('Student Selected', `Ready to issue book to roll number ${roll}`, 'info');
        }}
      />

      {/* Staff Profile & Picture Modal */}
      <StaffProfileModal
        isOpen={isStaffProfileModalOpen}
        onClose={() => setIsStaffProfileModalOpen(false)}
      />
    </div>
  );
};
