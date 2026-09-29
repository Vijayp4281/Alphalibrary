import type { Request, Response } from 'express';
import { dbService } from '../services/databaseService.ts';

export const getBorrowRecords = async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string | undefined;
    const records = await dbService.getBorrowRecords(studentId);
    res.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch borrow records' });
  }
};

export const issueBook = async (req: Request, res: Response) => {
  try {
    const { studentRollNo, bookId, dueDateDays, remarks, handledByStaffId } = req.body;
    if (!studentRollNo || !bookId) {
      return res.status(400).json({ success: false, error: 'Student Roll Number and Book ID are required' });
    }

    const result = await dbService.issueBook({
      studentRollNo,
      bookId,
      dueDateDays: Number(dueDateDays) || 21,
      remarks,
      handledByStaffId
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(201).json({ success: true, message: 'Book issued successfully', data: result.record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to issue book' });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const { borrowRecordId } = req.params;
    const { remarks } = req.body;

    const result = await dbService.returnBook(borrowRecordId, remarks);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Book returned successfully', data: result.record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to return book' });
  }
};
