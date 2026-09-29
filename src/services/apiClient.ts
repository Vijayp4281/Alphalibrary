import { Book, StudentProfile, StaffProfile, BorrowRecord } from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (err: any) {
    console.warn(`[API Client] Error on ${endpoint}:`, err);
    throw err;
  }
}

export const apiClient = {
  health: {
    check: () => request<{ status: string; uptimeSeconds: number; version: string }>('/health')
  },

  books: {
    getAll: (q?: string, category?: string) => {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category && category !== 'All') params.append('category', category);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; count: number; data: Book[] }>(`/books${queryStr}`);
    },
    getById: (id: string) => request<{ success: boolean; data: Book }>(`/books/${encodeURIComponent(id)}`),
    create: (book: Omit<Book, 'id'>) =>
      request<{ success: boolean; message: string; data: Book }>('/books', {
        method: 'POST',
        body: JSON.stringify(book)
      }),
    update: (id: string, updates: Partial<Book>) =>
      request<{ success: boolean; message: string; data: Book }>(`/books/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/books/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
  },

  students: {
    getAll: () => request<{ success: boolean; count: number; data: StudentProfile[] }>('/students'),
    getById: (id: string) => request<{ success: boolean; data: StudentProfile }>(`/students/${encodeURIComponent(id)}`),
    create: (student: Omit<StudentProfile, 'id'>) =>
      request<{ success: boolean; message: string; data: StudentProfile }>('/students', {
        method: 'POST',
        body: JSON.stringify(student)
      }),
    update: (id: string, updates: Partial<StudentProfile>) =>
      request<{ success: boolean; message: string; data: StudentProfile }>(`/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/students/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
  },

  staff: {
    getAll: () => request<{ success: boolean; count: number; data: StaffProfile[] }>('/staff'),
    getById: (id: string) => request<{ success: boolean; data: StaffProfile }>(`/staff/${encodeURIComponent(id)}`),
    create: (staff: Omit<StaffProfile, 'id'>) =>
      request<{ success: boolean; message: string; data: StaffProfile }>('/staff', {
        method: 'POST',
        body: JSON.stringify(staff)
      }),
    update: (id: string, updates: Partial<StaffProfile>) =>
      request<{ success: boolean; message: string; data: StaffProfile }>(`/staff/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/staff/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      })
  },

  borrowRecords: {
    getAll: (studentId?: string) => {
      const q = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
      return request<{ success: boolean; count: number; data: BorrowRecord[] }>(`/borrow-records${q}`);
    },
    issue: (data: {
      studentRollNo: string;
      bookId: string;
      dueDateDays?: number;
      remarks?: string;
      handledByStaffId?: string;
    }) =>
      request<{ success: boolean; message: string; data: BorrowRecord }>('/borrow-records/issue', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    return: (borrowRecordId: string, remarks?: string) =>
      request<{ success: boolean; message: string; data: BorrowRecord }>(
        `/borrow-records/return/${encodeURIComponent(borrowRecordId)}`,
        {
          method: 'POST',
          body: JSON.stringify({ remarks })
        }
      )
  },

  analytics: {
    getOverview: () =>
      request<{
        success: boolean;
        data: {
          totalTitles: number;
          totalCopies: number;
          availableCopies: number;
          borrowedCopies: number;
          totalStudents: number;
          totalStaff: number;
          activeLoans: number;
          submittedLoans: number;
          overdueLoans: number;
          circulationRate: number;
        };
      }>('/analytics')
  },

  support: {
    submit: (report: {
      studentId?: string;
      studentName?: string;
      studentEmail?: string;
      issueCategory: string;
      description: string;
    }) =>
      request<{ success: boolean; message: string; data: any }>('/support', {
        method: 'POST',
        body: JSON.stringify(report)
      }),
    getAll: () => request<{ success: boolean; count: number; data: any[] }>('/support')
  }
};
