import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, StudentProfile, StaffProfile } from '../../types';
import { downloadAllBarcodesPDF, downloadSingleBookBarcode } from '../../utils/barcodeService';
import { AddEditBookModal } from '../Catalog/AddEditBookModal';
import { StudentCirculationModal } from './StudentCirculationModal';
import { AdminProfileModal } from './AdminProfileModal';
import {
  Shield,
  BookOpen,
  Users,
  UserCheck,
  FolderTree,
  BarChart3,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Mail,
  Building2,
  DollarSign,
  X,
  FileSpreadsheet,
  BookMarked,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  GraduationCap,
  Eye,
  LayoutDashboard,
  BookPlus,
  RotateCcw,
  Menu,
  Library,
  PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const {
    books,
    borrowRecords,
    studentsList,
    staffList,
    categoriesList,
    systemSettings,
    addStudent,
    updateStudent,
    deleteStudent,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    addCategory,
    editCategory,
    deleteCategory,
    deleteBook,
    updateSystemSettings,
    addToast,
    currentRole,
    currentAdmin,
    updateAdminProfile,
    setIsAuthModalOpen
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'books' | 'students' | 'librarians' | 'categories' | 'reports' | 'settings'
  >('overview');

  // Admin Profile Modal State
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false);

  // Sidebar Collapse & Mobile Menu State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);

  // Student Modal / Form State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudentForCirculation, setSelectedStudentForCirculation] = useState<StudentProfile | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Computer Science & Eng',
    year: '1st Year',
    batch: '2023-2027 Batch'
  });

  // Staff Modal / Form State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    staffId: '',
    email: '',
    password: '',
    department: 'Central Library Admin',
    position: 'Assistant Librarian'
  });

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  // System Settings State
  const [settingsForm, setSettingsForm] = useState(systemSettings);

  // Search/Filters
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Key Statistics Metrics
  const stats = useMemo(() => {
    const totalBooksCount = (books || []).reduce((acc, b) => acc + (b?.totalCopies || 0), 0);
    const totalAvailableCopies = (books || []).reduce((acc, b) => acc + (b?.availableCopies || 0), 0);
    const totalBorrowedCopies = Math.max(0, totalBooksCount - totalAvailableCopies);

    const activeLoans = (borrowRecords || []).filter(r => r && (r.status === 'Issued' || r.status === 'Not Submitted' || r.status === 'Overdue'));
    const overdueLoans = (borrowRecords || []).filter(r => r && r.status === 'Overdue');
    const returnedLoans = (borrowRecords || []).filter(r => r && r.status === 'Submitted');

    const totalFines = (borrowRecords || []).reduce((acc, r) => acc + (r?.fineAmount || 0), 0);

    return {
      totalTitles: (books || []).length,
      totalBooksCount,
      totalAvailableCopies,
      totalBorrowedCopies,
      totalStudents: (studentsList || []).length,
      totalStaff: (staffList || []).length,
      activeLoansCount: activeLoans.length,
      overdueCount: overdueLoans.length,
      returnedCount: returnedLoans.length,
      totalFinesCollected: totalFines
    };
  }, [books, borrowRecords, studentsList, staffList]);

  if (currentRole !== 'admin') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-10 text-center space-y-4 my-8 max-w-xl mx-auto shadow-xl text-slate-900 dark:text-white transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Admin Control Panel Access Restricted</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Access is restricted strictly to System Administrators. Staff members and students cannot view or modify administrative controls.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/25 border border-amber-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4" /> Sign In as Administrator
        </button>
      </div>
    );
  }

  // Handlers for Student CRUD
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      rollNumber: `SRIT-${Date.now().toString().slice(-4)}`,
      email: '',
      department: 'Computer Science & Eng',
      year: '1st Year',
      batch: '2023-2027 Batch'
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: StudentProfile) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department || 'Computer Science & Eng',
      year: student.year || '1st Year',
      batch: student.batch || '2023-2027 Batch'
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.rollNumber.trim() || !studentForm.email.trim()) {
      addToast('Validation Error', 'Student name, roll number, and email are required.', 'error');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, studentForm);
    } else {
      addStudent({
        ...studentForm,
        issuedBooksCount: 0,
        fineBalance: 0
      });
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete student profile for "${name}"?`)) {
      deleteStudent(id);
    }
  };

  // Handlers for Staff / Librarian CRUD
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      staffId: `LIB-${Date.now().toString().slice(-4)}`,
      email: '',
      password: '',
      department: 'Central Library Admin',
      position: 'Assistant Librarian'
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: StaffProfile) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      staffId: staff.staffId,
      email: staff.email,
      password: '',
      department: staff.department || 'Central Library Admin',
      position: staff.position || 'Librarian'
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.staffId.trim() || !staffForm.email.trim()) {
      addToast('Validation Error', 'Name, Staff ID, and Email are required.', 'error');
      return;
    }

    if (editingStaff) {
      updateStaffMember(editingStaff.id, staffForm);
    } else {
      addStaffMember({
        ...staffForm,
        issuedBooksCount: 0
      });
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove librarian account for "${name}"?`)) {
      deleteStaffMember(id);
    }
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleSaveEditedCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.newName.trim()) return;
    editCategory(editingCategory.oldName, editingCategory.newName.trim());
    setEditingCategory(null);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settingsForm);
  };

  // Filtered Lists
  const filteredBooksList = books.filter(
    b =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.includes(bookSearch) ||
      b.id.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredStudentsList = studentsList.filter(
    s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredStaffList = staffList.filter(
    s =>
      s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.staffId.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-12 min-h-[calc(100vh-6rem)]">
      {/* MOBILE TOP BAR TOGGLE */}
      <div className="lg:hidden flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black shadow-md shadow-amber-600/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-slate-900 dark:text-white">ADMIN PORTAL</div>
            <div className="text-[10px] font-bold text-amber-500">LIBRARY MANAGEMENT</div>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#111A2E] text-slate-700 dark:text-[#94A3B8] hover:text-amber-500 border border-slate-200 dark:border-[#24324A] cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div key="admin-mobile-drawer-wrapper" className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              key="admin-mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.aside
              key="admin-mobile-drawer-aside"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0B1220] border-r border-slate-200 dark:border-[#24324A] text-slate-900 dark:text-[#E2E8F0] p-4 flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Header Logo & Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#24324A]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-extrabold shadow-md shadow-amber-600/30">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-slate-900 dark:text-white">ADMIN PORTAL</div>
                      <div className="text-[9px] font-bold text-amber-500">MANAGEMENT SUITE</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] hover:text-amber-500 border border-slate-200 dark:border-[#24324A] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Navigation Links */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('books');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      activeTab === 'books'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-4 h-4 ${activeTab === 'books' ? 'text-white' : 'text-amber-500'}`} />
                      <span>Books Management</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                      {books.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('students');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      activeTab === 'students'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-white' : 'text-emerald-500'}`} />
                      <span>Students Directory</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                      {studentsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('librarians');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      activeTab === 'librarians'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className={`w-4 h-4 ${activeTab === 'librarians' ? 'text-white' : 'text-indigo-500'}`} />
                      <span>Librarians & Staff</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                      {staffList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('categories');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      activeTab === 'categories'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderTree className={`w-4 h-4 ${activeTab === 'categories' ? 'text-white' : 'text-amber-500'}`} />
                      <span>Categories</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                      {categoriesList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('reports');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'reports' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Reports & Analytics</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-amber-500'}`} />
                    <span>System Settings</span>
                  </button>
                </div>
              </div>

              {/* Bottom Administrator Info */}
              <div
                onClick={() => {
                  setIsAdminProfileModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="pt-4 border-t border-slate-200 dark:border-[#24324A] flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] cursor-pointer hover:border-amber-500 transition-all group"
                title="Click to update Admin Profile"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                    {currentAdmin?.avatar || currentAdmin?.photoURL ? (
                      <img src={currentAdmin?.avatar || currentAdmin?.photoURL} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-[#E2E8F0] truncate">
                      {currentAdmin?.name || 'System Administrator'}
                    </div>
                    <div className="text-[10px] font-semibold text-amber-500 truncate">
                      {currentAdmin?.position || 'Root Access Control'}
                    </div>
                  </div>
                </div>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                  <Edit className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP LEFT SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] text-slate-900 dark:text-[#E2E8F0] p-4 rounded-3xl shadow-xl transition-all duration-300 ease-in-out sticky top-4 h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden scrollbar-none ${
          isSidebarCollapsed ? 'w-[76px] px-2.5' : 'w-64'
        }`}
      >
        <div className="space-y-4">
          {/* Logo Section */}
          <div className={`flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#24324A] ${isSidebarCollapsed ? 'justify-center' : 'px-1'}`}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-extrabold shadow-lg shadow-amber-600/30 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase leading-tight">
                  ADMIN SUITE
                </div>
                <div className="text-[10px] font-bold text-amber-500 tracking-tight truncate">
                  CENTRAL CONTROL
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              title={isSidebarCollapsed ? 'Dashboard Overview' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'overview' ? 'text-white' : 'text-amber-500'}`} />
              {!isSidebarCollapsed && <span>Dashboard Overview</span>}
            </button>

            <button
              onClick={() => setActiveTab('books')}
              title={isSidebarCollapsed ? 'Books Management' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'books' ? 'text-white' : 'text-amber-500'}`} />
                {!isSidebarCollapsed && <span>Books Management</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                  {books.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              title={isSidebarCollapsed ? 'Students Directory' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className={`w-4 h-4 shrink-0 ${activeTab === 'students' ? 'text-white' : 'text-emerald-500'}`} />
                {!isSidebarCollapsed && <span>Students Directory</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                  {studentsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('librarians')}
              title={isSidebarCollapsed ? 'Librarians & Staff' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeTab === 'librarians'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'librarians' ? 'text-white' : 'text-indigo-500'}`} />
                {!isSidebarCollapsed && <span>Librarians & Staff</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                  {staffList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              title={isSidebarCollapsed ? 'Categories' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <FolderTree className={`w-4 h-4 shrink-0 ${activeTab === 'categories' ? 'text-white' : 'text-amber-500'}`} />
                {!isSidebarCollapsed && <span>Categories</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-[#111A2E] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#24324A]">
                  {categoriesList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              title={isSidebarCollapsed ? 'Reports & Analytics' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-white' : 'text-amber-500'}`} />
              {!isSidebarCollapsed && <span>Reports & Analytics</span>}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              title={isSidebarCollapsed ? 'System Settings' : undefined}
              className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111A2E] hover:text-slate-900 dark:hover:text-[#E2E8F0]'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-amber-500'}`} />
              {!isSidebarCollapsed && <span>System Settings</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#24324A] space-y-2">
          {!isSidebarCollapsed ? (
            <div
              id="admin-sidebar-profile-card"
              onClick={() => setIsAdminProfileModalOpen(true)}
              className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] hover:border-amber-500 transition-all cursor-pointer group shadow-xs"
              title="Click to edit Administrator Profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
                  {currentAdmin?.avatar || currentAdmin?.photoURL ? (
                    <img src={currentAdmin?.avatar || currentAdmin?.photoURL} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 dark:text-[#E2E8F0] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {currentAdmin?.name || 'System Administrator'}
                  </div>
                  <div className="text-[10px] font-semibold text-amber-500 truncate">
                    {currentAdmin?.position || 'Root Access'}
                  </div>
                </div>
              </div>
              <button
                id="btn-sidebar-edit-admin-profile"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdminProfileModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-white dark:bg-[#0B1220] text-slate-400 group-hover:text-amber-500 border border-slate-200 dark:border-[#24324A] group-hover:border-amber-500 transition-all shrink-0 cursor-pointer"
                title="Edit Profile"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-sidebar-collapsed-admin-profile"
              onClick={() => setIsAdminProfileModalOpen(true)}
              className="w-full flex justify-center p-2 rounded-xl bg-slate-50 dark:bg-[#111A2E] text-amber-500 hover:border-amber-500 border border-slate-200 dark:border-[#24324A] cursor-pointer transition-colors"
              title="Click to edit Administrator Profile"
            >
              {currentAdmin?.avatar || currentAdmin?.photoURL ? (
                <img src={currentAdmin?.avatar || currentAdmin?.photoURL} alt="Admin" className="w-6 h-6 rounded-lg object-cover" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Collapse Sidebar Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-[#111A2E] hover:bg-slate-200 dark:hover:bg-[#1A2640] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#24324A] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <Shield className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold mb-3 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              System Administrator Control Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Library Management & Administrative Suite
            </h1>
            <p className="text-sm text-amber-100/80 mt-2 font-medium">
              Full control panel to manage catalog books, student profiles, librarians, categories, analytics reports, and system settings.
            </p>
          </div>
        </div>

        {/* TAB CONTENT: 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Total Titles</span>
                  <BookOpen className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTitles}</div>
                <p className="text-[10px] text-slate-500 mt-1">{stats.totalBooksCount} physical copies</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Registered Students</span>
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</div>
                <p className="text-[10px] text-slate-500 mt-1">Active borrowers</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Librarians & Staff</span>
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStaff}</div>
                <p className="text-[10px] text-slate-500 mt-1">Authorized personnel</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Active Loans</span>
                  <BookMarked className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeLoansCount}</div>
                <p className="text-[10px] text-slate-500 mt-1">{stats.totalAvailableCopies} in stock</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Overdue Items</span>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.overdueCount}</div>
                <p className="text-[10px] text-slate-500 mt-1">Requires fine collection</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">Total Fines</span>
                  <DollarSign className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">${stats.totalFinesCollected}</div>
                <p className="text-[10px] text-slate-500 mt-1">${systemSettings.finePerDay}/day overdue rate</p>
              </div>
            </div>

            {/* Recent Active Borrow Records */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recent Library Circulation Activity ({borrowRecords.length} records)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Borrow Record ID</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                    {borrowRecords.slice(0, 8).map((r, idx) => (
                      <tr key={`admin-overview-borrow-${r.id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{r.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.bookTitle}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {r.studentName} ({r.studentRollNo || r.studentRollNumber || '—'})
                        </td>
                        <td className="py-3 px-4 text-slate-500">{r.issueDate}</td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{r.dueDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              r.status === 'Submitted'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : r.status === 'Overdue'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      {/* TAB CONTENT: 2. BOOKS MANAGEMENT */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  Library Books Database ({filteredBooksList.length} items)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add, edit details, or remove books directly from the central catalog database.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-search-books"
                    type="text"
                    placeholder="Search by title, author, ISBN..."
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  id="admin-btn-download-barcodes"
                  onClick={async () => {
                    try {
                      await downloadAllBarcodesPDF(books);
                      addToast('All Barcodes File Downloaded 📄', `Generated printable barcode sheet for ${books.length} catalog items.`, 'success');
                    } catch (err: any) {
                      addToast('Download Failed', err?.message || 'Error generating barcodes', 'error');
                    }
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                  title="Download printable PDF sticker sheet with all barcodes"
                >
                  <Download className="w-4 h-4" />
                  Download All Barcodes
                </button>

                <button
                  id="admin-btn-add-book"
                  onClick={() => {
                    setSelectedBookForEdit(null);
                    setIsBookModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Book
                </button>
              </div>
            </div>

            {/* Books Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Book ID</th>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Copies (Avail/Total)</th>
                    <th className="py-3 px-4">Shelf Location</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredBooksList.map((book, idx) => (
                    <tr key={`admin-book-row-${book.id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{book.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{book.title}</div>
                        <div className="text-[11px] text-slate-500">{book.author} ({book.publishedYear})</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{book.isbn}</td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {book.availableCopies}
                        </span>
                        <span className="text-slate-400"> / {book.totalCopies}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{book.shelfLocation}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              downloadSingleBookBarcode(book, 'pdf');
                              addToast('Barcode Sticker Downloaded 🏷️', `Sticker downloaded for ${book.id} ("${book.title}")`, 'success');
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                            title="Download Barcode Sticker (PDF)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBookForEdit(book);
                              setIsBookModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
                            title="Edit Book"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete book "${book.title}"?`)) {
                                deleteBook(book.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  Student Directory ({filteredStudentsList.length} students)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage registered student accounts, update Roll Numbers, and track borrowed books limits.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-search-students"
                    type="text"
                    placeholder="Search name, Roll No, email..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  id="admin-btn-add-student"
                  onClick={handleOpenAddStudent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student ID / Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Department & Year</th>
                    <th className="py-3 px-4">Active Loans</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredStudentsList.map((student, idx) => (
                    <tr key={`admin-stu-row-${student.id || student.rollNumber}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td
                        onClick={() => setSelectedStudentForCirculation(student)}
                        className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                        title={`Click to view Book Issue & Return History for ${student.name}`}
                      >
                        {student.rollNumber}
                      </td>
                      <td
                        onClick={() => setSelectedStudentForCirculation(student)}
                        className="py-3.5 px-4 cursor-pointer group"
                        title={`Click to view Book Issue & Return History for ${student.name}`}
                      >
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                          <span>{student.name}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="text-[10px] text-slate-400">{student.batch || '2022-2026 Batch'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{student.email}</div>
                        {student.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 mt-0.5">
                            <AlertCircle className="w-2.5 h-2.5" /> Unverified Email
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{student.department || 'Computer Science'}</div>
                        <div className="text-[10px] text-slate-400">{student.year || '3rd Year'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                          {student.issuedBooksCount || 0} / {systemSettings.maxBooksPerStudent} books
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudentForCirculation(student)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                            title="View Book Issue & Return History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditStudent(student)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. LIBRARIANS / STAFF */}
      {activeTab === 'librarians' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  Library Archivists & Staff ({filteredStaffList.length} staff)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage library staff accounts with authorization to issue and return books.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-search-staff"
                    type="text"
                    placeholder="Search name, Staff ID, email..."
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  id="admin-btn-add-staff"
                  onClick={handleOpenAddStaff}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Librarian
                </button>
              </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredStaffList.map((staff, idx) => (
                    <tr key={`admin-staff-row-${staff.id || staff.staffId}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {staff.staffId}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{staff.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{staff.email}</td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{staff.department || 'Central Library Admin'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                          {staff.position || 'Assistant Librarian'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`admin-btn-edit-staff-${staff.id || staff.staffId}`}
                            onClick={() => handleOpenEditStaff(staff)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                            title="Edit Staff Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`admin-btn-delete-staff-${staff.id || staff.staffId}`}
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600 text-slate-600 dark:text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
                            title="Remove Staff Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-500" />
                Category & Classification Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage subject categories, add new engineering domains, or update existing taxonomy tags.
              </p>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-3 max-w-lg">
              <input
                id="input-new-category"
                type="text"
                placeholder="Enter new category name (e.g. Cyber Security)"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white"
              />
              <button
                id="btn-add-category-submit"
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </form>

            {/* Existing Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {categoriesList.map((cat, idx) => {
                const count = books.filter(b => b.category === cat).length;
                const isEditing = editingCategory?.oldName === cat;

                return (
                  <div
                    key={`admin-cat-card-${cat}-${idx}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3"
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEditedCategory} className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editingCategory.newName}
                          onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                          className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-amber-500 text-xs rounded-xl outline-none text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{cat}</div>
                          <div className="text-[11px] text-slate-500">{count} book(s) assigned</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                            title="Rename Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove category "${cat}"?`)) {
                                deleteCategory(cat);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                  Library Circulation & Management Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export metrics, review overdue logs, and print summary statements.
                </p>
              </div>

              <button
                id="btn-print-report"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Print / Export Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                  Circulation Efficiency
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {Math.round((stats.totalBorrowedCopies / (stats.totalBooksCount || 1)) * 100)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.totalBorrowedCopies} of {stats.totalBooksCount} copies in active circulation
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  Return Reliability
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.returnedCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">Total books successfully submitted back to shelf</p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1">
                  Fine Collection Rate
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">${stats.totalFinesCollected}</div>
                <p className="text-xs text-slate-500 mt-1">Accrued late fees collected across sessions</p>
              </div>
            </div>

            {/* Popular Books Breakdown */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Top Requested Catalog Titles</h4>
              <div className="space-y-2">
                {books.slice(0, 5).map((b, idx) => (
                  <div key={`admin-top-book-${b.id}-${idx}`} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                        <div className="text-[10px] text-slate-500">{b.author} • {b.category}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      {b.totalCopies - b.availableCopies} borrowed / {b.totalCopies} total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Administrator Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Administrator Profile & Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your administrative profile information, contact email, and system identity.
                  </p>
                </div>
              </div>
              <button
                id="btn-settings-open-admin-profile-modal"
                onClick={() => setIsAdminProfileModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Admin Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-amber-500 font-bold">
                  {currentAdmin?.avatar || currentAdmin?.photoURL ? (
                    <img src={currentAdmin?.avatar || currentAdmin?.photoURL} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    currentAdmin?.name?.charAt(0) || 'A'
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentAdmin?.name || 'System Administrator'}
                  </div>
                  <div className="text-[11px] text-amber-500 font-semibold truncate">
                    {currentAdmin?.position || 'Chief Administrator'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ID: {currentAdmin?.adminId || currentAdmin?.staffId || 'ADM-001'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Email & Office
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentAdmin?.email || 'admin@university.edu'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {currentAdmin?.department || 'Central University Library'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Contact & Permissions
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentAdmin?.phone || '+1 (555) 019-2834'}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Root Admin • Full Access
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                Library Configuration & Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure global loan policies, maximum borrowing quotas, and automated fine calculations.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institution Library Name
                </label>
                <input
                  type="text"
                  value={settingsForm.libraryName}
                  onChange={e => setSettingsForm({ ...settingsForm, libraryName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Max Loan Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settingsForm.maxLoanDays}
                    onChange={e => setSettingsForm({ ...settingsForm, maxLoanDays: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Daily Fine Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={settingsForm.finePerDay}
                    onChange={e => setSettingsForm({ ...settingsForm, finePerDay: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Max Books / Student
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settingsForm.maxBooksPerStudent}
                    onChange={e => setSettingsForm({ ...settingsForm, maxBooksPerStudent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-2xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.autoEmailReminders}
                    onChange={e => setSettingsForm({ ...settingsForm, autoEmailReminders: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Enable Automated Due Date Email Notifications
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Sends automated email alerts 48 hours prior to loan expiry.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button
                  id="btn-save-system-settings"
                  type="submit"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save System Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>

      {/* BOOK ADD/EDIT MODAL */}
      <AddEditBookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setSelectedBookForEdit(null);
        }}
        bookToEdit={selectedBookForEdit}
      />

      {/* STUDENT ADD/EDIT MODAL */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div key="admin-student-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              key="admin-student-modal-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full relative"
            >
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {editingStudent ? 'Edit Student Profile' : 'Register New Student'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter official academic credentials for student library account.
              </p>

              <form onSubmit={handleSaveStudent} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={studentForm.name}
                    onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SRIT-2024-001"
                      value={studentForm.rollNumber}
                      onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@university.edu"
                      value={studentForm.email}
                      onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={studentForm.department}
                      onChange={e => setStudentForm({ ...studentForm, department: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      value={studentForm.year}
                      onChange={e => setStudentForm({ ...studentForm, year: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {editingStudent ? 'Save Changes' : 'Create Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STAFF ADD/EDIT MODAL */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div key="admin-staff-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              key="admin-staff-modal-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full relative"
            >
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {editingStaff ? 'Edit Staff Profile' : 'Authorize New Librarian / Staff'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Assign staff permissions to issue, return, and oversee catalog circulation.
              </p>

              <form onSubmit={handleSaveStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Vance"
                    value={staffForm.name}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Staff ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LIB-2024-001"
                      value={staffForm.staffId}
                      onChange={e => setStaffForm({ ...staffForm, staffId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vance@university.edu"
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={staffForm.department}
                      onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Position / Title
                    </label>
                    <input
                      type="text"
                      value={staffForm.position}
                      onChange={e => setStaffForm({ ...staffForm, position: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {!editingStaff && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account Password {editingStaff ? '(Leave blank to keep current)' : '*'}
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters (e.g. Staff@123)"
                      value={staffForm.password}
                      onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      This password allows the staff member to log in via Firebase Auth with their email or Staff ID.
                    </p>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {editingStaff ? 'Save Changes' : 'Authorize Staff'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Book Issue & Return Circulation Modal */}
      <StudentCirculationModal
        isOpen={Boolean(selectedStudentForCirculation)}
        onClose={() => setSelectedStudentForCirculation(null)}
        student={selectedStudentForCirculation}
        borrowRecords={borrowRecords}
      />

      {/* Admin Profile Update Modal */}
      <AdminProfileModal
        isOpen={isAdminProfileModalOpen}
        onClose={() => setIsAdminProfileModalOpen(false)}
      />
    </div>
  );
};
