import type { Request, Response } from 'express';
import { dbService } from '../services/databaseService.ts';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await dbService.getStudents();
    res.json({ success: true, count: students.length, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch students' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await dbService.getStudentById(id);
    if (!student) {
      return res.status(404).json({ success: false, error: `Student '${id}' not found` });
    }
    res.json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch student' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, rollNumber, email, department, year, batch, phone, avatar, maxBorrowLimit } = req.body;
    if (!name || !rollNumber) {
      return res.status(400).json({ success: false, error: 'Name and Roll Number are required' });
    }

    const existing = await dbService.getStudentById(rollNumber);
    if (existing) {
      return res.status(409).json({ success: false, error: `Student with roll number ${rollNumber} already exists` });
    }

    const newStudent = await dbService.createStudent({
      name,
      rollNumber,
      email: email || `${rollNumber.toLowerCase()}@university.edu`,
      department: department || 'Computer Science & Engineering',
      year: year || '1st Year',
      batch: batch || '2024-2028 Batch',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      phone: phone || '+1 (555) 000-0000',
      joinedDate: new Date().toISOString().split('T')[0],
      maxBorrowLimit: Number(maxBorrowLimit) || 5,
      emailVerified: true
    });

    res.status(201).json({ success: true, message: 'Student registered successfully', data: newStudent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbService.updateStudent(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Student '${id}' not found` });
    }
    res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update student' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deleteStudent(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Student '${id}' not found` });
    }
    res.json({ success: true, message: `Student '${id}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete student' });
  }
};
