import type { Request, Response } from 'express';
import { dbService } from '../services/databaseService.ts';

export const getStaff = async (req: Request, res: Response) => {
  try {
    const staff = await dbService.getStaff();
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch staff members' });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await dbService.getStaffById(id);
    if (!staff) {
      return res.status(404).json({ success: false, error: `Staff member '${id}' not found` });
    }
    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch staff member' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, staffId, email, department, position, avatar, phone, role } = req.body;
    if (!name || !staffId) {
      return res.status(400).json({ success: false, error: 'Name and Staff ID are required' });
    }

    const existing = await dbService.getStaffById(staffId);
    if (existing) {
      return res.status(409).json({ success: false, error: `Staff member with ID ${staffId} already exists` });
    }

    const newStaff = await dbService.createStaff({
      name,
      staffId,
      email: email || `${staffId.toLowerCase()}@university.edu`,
      department: department || 'Central Library Administration',
      position: position || 'Assistant Librarian',
      avatar: avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      phone: phone || '+1 (555) 000-0000',
      joinedDate: new Date().toISOString().split('T')[0],
      role: role || 'staff',
      issuedBooksCount: 0
    });

    res.status(201).json({ success: true, message: 'Staff member authorized successfully', data: newStaff });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to authorize staff member' });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbService.updateStaff(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Staff member '${id}' not found` });
    }
    res.json({ success: true, message: 'Staff member updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update staff member' });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deleteStaff(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Staff member '${id}' not found` });
    }
    res.json({ success: true, message: `Staff member '${id}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete staff member' });
  }
};
