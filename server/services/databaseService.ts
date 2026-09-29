import type { Book, StudentProfile, StaffProfile, BorrowRecord, SupportReport } from '../types.ts';

// Initial books seeded in backend
const INITIAL_BOOKS: Book[] = [
  {
    id: 'BK-1011',
    title: 'Introduction to Algorithms, 4th Edition',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '978-0262046305',
    publisher: 'MIT Press',
    edition: '4th Edition',
    category: 'Computer Science',
    department: 'Computer Science & Engineering',
    totalCopies: 12,
    availableCopies: 8,
    description: 'Comprehensive update of the leading textbook on algorithms, with new chapters on bipartite graphs, online algorithms, and machine learning.',
    coverImage: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=400',
    shelfLocation: 'Stack CS-A1-04',
    publishedYear: 2022,
    language: 'English',
    featured: true
  },
  {
    id: 'BK-1012',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0134610993',
    publisher: 'Pearson',
    edition: '4th Global Edition',
    category: 'Computer Science',
    department: 'Artificial Intelligence & Data Science',
    totalCopies: 10,
    availableCopies: 5,
    description: 'The authoritative, most widely adopted introducing textbook to the theory and practice of artificial intelligence.',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=400',
    shelfLocation: 'Stack AI-B2-12',
    publishedYear: 2021,
    language: 'English',
    featured: true
  },
  {
    id: 'BK-1013',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    category: 'Software Engineering',
    department: 'Information Technology',
    totalCopies: 8,
    availableCopies: 4,
    description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
    shelfLocation: 'Stack SE-C3-01',
    publishedYear: 2008,
    language: 'English',
    featured: false
  },
  {
    id: 'BK-1014',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    publisher: 'Addison-Wesley',
    edition: '1st Edition',
    category: 'Software Engineering',
    department: 'Computer Science & Engineering',
    totalCopies: 6,
    availableCopies: 2,
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=400',
    shelfLocation: 'Stack SE-C3-08',
    publishedYear: 1994,
    language: 'English',
    featured: false
  },
  {
    id: 'BK-1015',
    title: 'Database System Concepts, 7th Edition',
    author: 'Abraham Silberschatz, Henry Korth, S. Sudarshan',
    isbn: '978-0078022159',
    publisher: 'McGraw-Hill Education',
    edition: '7th Edition',
    category: 'Database Systems',
    department: 'Computer Science & Engineering',
    totalCopies: 14,
    availableCopies: 9,
    description: 'Database System Concepts presents the fundamental concepts of database management in an intuitive manner.',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400',
    shelfLocation: 'Stack DB-D4-05',
    publishedYear: 2019,
    language: 'English',
    featured: false
  }
];

const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-001',
    rollNumber: 'STU-1001',
    name: 'Aiden Vance',
    email: 'aiden.vance@university.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    batch: '2022-2026 Batch',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 019-2831',
    joinedDate: '2022-08-15',
    maxBorrowLimit: 5,
    emailVerified: true
  },
  {
    id: 'stu-002',
    rollNumber: 'STU-1002',
    name: 'Maya Lin',
    email: 'maya.lin@university.edu',
    department: 'Artificial Intelligence & Data Science',
    year: '2nd Year',
    batch: '2023-2027 Batch',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 019-2832',
    joinedDate: '2023-08-10',
    maxBorrowLimit: 5,
    emailVerified: true
  },
  {
    id: 'stu-003',
    rollNumber: 'STU-1003',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@university.edu',
    department: 'Information Technology',
    year: '4th Year',
    batch: '2021-2025 Batch',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 019-2833',
    joinedDate: '2021-08-12',
    maxBorrowLimit: 5,
    emailVerified: true
  }
];

const INITIAL_STAFF: StaffProfile[] = [
  {
    id: 'staff-001',
    staffId: 'LIB-8291',
    name: 'Eleanor Sterling',
    email: 's.connor@university.edu',
    department: 'Central University Library',
    position: 'Chief Acquisitions Archivist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 892-1001',
    joinedDate: '2019-03-15',
    role: 'staff',
    issuedBooksCount: 142
  },
  {
    id: 'staff-002',
    staffId: 'LIB-8292',
    name: 'Dr. Robert Vance',
    email: 'r.vance@university.edu',
    department: 'Central University Library',
    position: 'Director of Library Services & Systems',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 892-1002',
    joinedDate: '2016-01-10',
    role: 'admin',
    issuedBooksCount: 388
  }
];

const INITIAL_BORROWS: BorrowRecord[] = [
  {
    id: 'BR-2026-001',
    studentId: 'stu-001',
    studentName: 'Aiden Vance',
    studentRollNo: 'STU-1001',
    studentDepartment: 'Computer Science & Engineering',
    studentEmail: 'aiden.vance@university.edu',
    bookId: 'BK-1011',
    bookTitle: 'Introduction to Algorithms, 4th Edition',
    bookAuthor: 'Thomas H. Cormen, Charles E. Leiserson',
    bookCover: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=400',
    bookEdition: '4th Edition',
    borrowDate: '2026-03-01',
    dueDate: '2026-03-22',
    status: 'Not Submitted',
    handledByStaffId: 'LIB-8291',
    remarks: 'Issued in good condition.'
  }
];

class DatabaseService {
  private books: Book[] = [...INITIAL_BOOKS];
  private students: StudentProfile[] = [...INITIAL_STUDENTS];
  private staff: StaffProfile[] = [...INITIAL_STAFF];
  private borrowRecords: BorrowRecord[] = [...INITIAL_BORROWS];
  private supportReports: SupportReport[] = [];

  // Books CRUD
  public async getBooks(queryStr?: string, category?: string): Promise<Book[]> {
    let result = [...this.books];
    if (category && category !== 'All') {
      result = result.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }
    if (queryStr) {
      const q = queryStr.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public async getBookById(idOrIsbn: string): Promise<Book | null> {
    const term = idOrIsbn.toLowerCase().trim();
    return this.books.find(b => b.id.toLowerCase() === term || b.isbn.toLowerCase() === term) || null;
  }

  public async createBook(data: Omit<Book, 'id'>): Promise<Book> {
    const id = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBook: Book = { ...data, id };
    this.books.unshift(newBook);
    return newBook;
  }

  public async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const index = this.books.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.books[index] = { ...this.books[index], ...updates };
    return this.books[index];
  }

  public async deleteBook(id: string): Promise<boolean> {
    const prevLen = this.books.length;
    this.books = this.books.filter(b => b.id !== id);
    return this.books.length < prevLen;
  }

  // Students CRUD
  public async getStudents(): Promise<StudentProfile[]> {
    return [...this.students];
  }

  public async getStudentById(idOrRoll: string): Promise<StudentProfile | null> {
    const term = idOrRoll.toLowerCase().trim();
    return this.students.find(s => s.id.toLowerCase() === term || s.rollNumber.toLowerCase() === term || s.email.toLowerCase() === term) || null;
  }

  public async createStudent(data: Omit<StudentProfile, 'id'>): Promise<StudentProfile> {
    const id = `stu-${Date.now()}`;
    const newStudent: StudentProfile = { ...data, id };
    this.students.unshift(newStudent);
    return newStudent;
  }

  public async updateStudent(id: string, updates: Partial<StudentProfile>): Promise<StudentProfile | null> {
    const index = this.students.findIndex(s => s.id === id || s.rollNumber === id);
    if (index === -1) return null;
    this.students[index] = { ...this.students[index], ...updates };
    return this.students[index];
  }

  public async deleteStudent(id: string): Promise<boolean> {
    const prevLen = this.students.length;
    this.students = this.students.filter(s => s.id !== id && s.rollNumber !== id);
    return this.students.length < prevLen;
  }

  // Staff CRUD
  public async getStaff(): Promise<StaffProfile[]> {
    return [...this.staff];
  }

  public async getStaffById(idOrStaffId: string): Promise<StaffProfile | null> {
    const term = idOrStaffId.toLowerCase().trim();
    return this.staff.find(s => s.id.toLowerCase() === term || s.staffId.toLowerCase() === term || s.email.toLowerCase() === term) || null;
  }

  public async createStaff(data: Omit<StaffProfile, 'id'>): Promise<StaffProfile> {
    const id = `staff-${Date.now()}`;
    const newStaff: StaffProfile = { ...data, id, issuedBooksCount: data.issuedBooksCount || 0 };
    this.staff.unshift(newStaff);
    return newStaff;
  }

  public async updateStaff(id: string, updates: Partial<StaffProfile>): Promise<StaffProfile | null> {
    const index = this.staff.findIndex(s => s.id === id || s.staffId === id);
    if (index === -1) return null;
    this.staff[index] = { ...this.staff[index], ...updates };
    return this.staff[index];
  }

  public async deleteStaff(id: string): Promise<boolean> {
    const prevLen = this.staff.length;
    this.staff = this.staff.filter(s => s.id !== id && s.staffId !== id);
    return this.staff.length < prevLen;
  }

  // Borrow Records
  public async getBorrowRecords(studentId?: string): Promise<BorrowRecord[]> {
    if (studentId) {
      return this.borrowRecords.filter(r => r.studentId === studentId || r.studentRollNo === studentId);
    }
    return [...this.borrowRecords];
  }

  public async issueBook(data: {
    studentRollNo: string;
    bookId: string;
    dueDateDays?: number;
    remarks?: string;
    handledByStaffId?: string;
  }): Promise<{ success: boolean; record?: BorrowRecord; error?: string }> {
    const student = await this.getStudentById(data.studentRollNo);
    if (!student) {
      return { success: false, error: `Student with roll number "${data.studentRollNo}" not found.` };
    }

    const book = await this.getBookById(data.bookId);
    if (!book) {
      return { success: false, error: `Book with ID/ISBN "${data.bookId}" not found.` };
    }

    if (book.availableCopies <= 0) {
      return { success: false, error: `Book "${book.title}" is currently out of stock.` };
    }

    // Decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (data.dueDateDays || 21));

    const recordId = `BR-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: BorrowRecord = {
      id: recordId,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNumber,
      studentDepartment: student.department,
      studentEmail: student.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage,
      bookEdition: book.edition,
      borrowDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Not Submitted',
      handledByStaffId: data.handledByStaffId || 'LIB-8291',
      remarks: data.remarks || 'Standard loan issued by circulation desk.'
    };

    this.borrowRecords.unshift(newRecord);
    return { success: true, record: newRecord };
  }

  public async returnBook(borrowRecordId: string, remarks?: string): Promise<{ success: boolean; record?: BorrowRecord; error?: string }> {
    const record = this.borrowRecords.find(r => r.id === borrowRecordId);
    if (!record) {
      return { success: false, error: `Borrow record "${borrowRecordId}" not found.` };
    }

    if (record.status === 'Submitted') {
      return { success: false, error: `This book has already been returned.` };
    }

    record.status = 'Submitted';
    record.returnDate = new Date().toISOString().split('T')[0];
    if (remarks) record.remarks = remarks;

    // Increment available book copies
    const book = this.books.find(b => b.id === record.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    return { success: true, record };
  }

  // Analytics
  public async getAnalytics() {
    const totalTitles = this.books.length;
    const totalCopies = this.books.reduce((acc, b) => acc + b.totalCopies, 0);
    const availableCopies = this.books.reduce((acc, b) => acc + b.availableCopies, 0);
    const activeLoans = this.borrowRecords.filter(r => r.status === 'Not Submitted').length;
    const submittedLoans = this.borrowRecords.filter(r => r.status === 'Submitted').length;
    const overdueLoans = this.borrowRecords.filter(r => {
      if (r.status === 'Submitted') return false;
      return new Date(r.dueDate) < new Date();
    }).length;

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      borrowedCopies: totalCopies - availableCopies,
      totalStudents: this.students.length,
      totalStaff: this.staff.length,
      activeLoans,
      submittedLoans,
      overdueLoans,
      circulationRate: totalCopies > 0 ? Math.round(((totalCopies - availableCopies) / totalCopies) * 100) : 0
    };
  }

  // Support Reports
  public async createSupportReport(data: Omit<SupportReport, 'id' | 'createdAt' | 'status'>): Promise<SupportReport> {
    const report: SupportReport = {
      ...data,
      id: `RPT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Open'
    };
    this.supportReports.unshift(report);
    return report;
  }

  public async getSupportReports(): Promise<SupportReport[]> {
    return [...this.supportReports];
  }
}

export const dbService = new DatabaseService();
