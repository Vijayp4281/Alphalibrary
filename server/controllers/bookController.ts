import type { Request, Response } from 'express';
import { dbService } from '../services/databaseService.ts';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const queryStr = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    const books = await dbService.getBooks(queryStr, category);
    res.json({ success: true, count: books.length, data: books });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch books' });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await dbService.getBookById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: `Book '${id}' not found` });
    }
    res.json({ success: true, data: book });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch book' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, isbn, publisher, edition, category, department, totalCopies, description, coverImage, shelfLocation, publishedYear } = req.body;
    if (!title || !author) {
      return res.status(400).json({ success: false, error: 'Title and author are required' });
    }

    const newBook = await dbService.createBook({
      title,
      author,
      isbn: isbn || `ISBN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: publisher || 'Alpha Academic Press',
      edition: edition || '1st Edition',
      category: category || 'General Collection',
      department: department || 'General Studies',
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(totalCopies) || 1,
      description: description || 'No summary available.',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      shelfLocation: shelfLocation || 'Stack Gen-01',
      publishedYear: Number(publishedYear) || new Date().getFullYear()
    });

    res.status(201).json({ success: true, message: 'Book created successfully', data: newBook });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create book' });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbService.updateBook(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Book '${id}' not found` });
    }
    res.json({ success: true, message: 'Book updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update book' });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Book '${id}' not found` });
    }
    res.json({ success: true, message: `Book '${id}' deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete book' });
  }
};
