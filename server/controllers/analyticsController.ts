import type { Request, Response } from 'express';
import { dbService } from '../services/databaseService.ts';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await dbService.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch analytics' });
  }
};

export const getHealth = async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Alpha Library Professional System Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0'
  });
};

export const createSupportReport = async (req: Request, res: Response) => {
  try {
    const { studentId, studentName, studentEmail, issueCategory, description } = req.body;
    if (!issueCategory || !description) {
      return res.status(400).json({ success: false, error: 'Issue category and description are required' });
    }

    const report = await dbService.createSupportReport({
      studentId,
      studentName,
      studentEmail,
      issueCategory,
      description
    });

    res.status(201).json({ success: true, message: 'Support report logged successfully', data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create support report' });
  }
};

export const getSupportReports = async (req: Request, res: Response) => {
  try {
    const reports = await dbService.getSupportReports();
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch support reports' });
  }
};
