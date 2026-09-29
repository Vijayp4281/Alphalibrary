import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.ts';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.ts';
import { getStaff, getStaffById, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.ts';
import { getBorrowRecords, issueBook, returnBook } from '../controllers/borrowController.ts';
import { getAnalytics, getHealth, createSupportReport, getSupportReports } from '../controllers/analyticsController.ts';

const router = Router();

// Health check
router.get('/health', getHealth);

// Books API
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Students API
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Staff API
router.get('/staff', getStaff);
router.get('/staff/:id', getStaffById);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Borrow Circulation API
router.get('/borrow-records', getBorrowRecords);
router.post('/borrow-records/issue', issueBook);
router.post('/borrow-records/return/:borrowRecordId', returnBook);

// Analytics & Reports API
router.get('/analytics', getAnalytics);
router.get('/support', getSupportReports);
router.post('/support', createSupportReport);

export default router;
