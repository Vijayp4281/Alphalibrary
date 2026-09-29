import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { CATEGORIES, DEPARTMENTS } from '../../data/mockData';
import { X, Plus, Save, Sparkles, Barcode, CheckCircle2, RefreshCw, Download, FileText, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarcodeScannerModal } from '../Scanner/BarcodeScannerModal';
import { downloadAllBarcodesPDF, downloadSingleBookBarcode } from '../../utils/barcodeService';

interface AddEditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
}

export const AddEditBookModal: React.FC<AddEditBookModalProps> = ({ isOpen, onClose, bookToEdit }) => {
  const { addBook, updateBook, addToast, books, systemSettings, borrowRecords } = useLibrary();

  const [bookId, setBookId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBadge, setScannedBadge] = useState<string | null>(null);
  const [downloadBarcodesOnFile, setDownloadBarcodesOnFile] = useState(true);
  const [barcodeDownloadScope, setBarcodeDownloadScope] = useState<'all' | 'single'>('all');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    edition: '1st Edition',
    category: CATEGORIES[1],
    department: DEPARTMENTS[1],
    totalCopies: 10,
    availableCopies: 10,
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
    shelfLocation: 'Shelf CS-01-A',
    publishedYear: 2024
  });

  const effectiveBookId = (bookToEdit ? bookToEdit.id : bookId).trim();
  const issuedCopiesCount = (borrowRecords || []).filter(
    r => r.bookId && effectiveBookId && r.bookId.toLowerCase().trim() === effectiveBookId.toLowerCase().trim() && r.status !== 'Submitted'
  ).length;
  const computedAvailableCopies = Math.max(0, (formData.totalCopies || 0) - issuedCopiesCount);

  useEffect(() => {
    if (bookToEdit) {
      setBookId(bookToEdit.id);
      setScannedBadge(null);
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        publisher: bookToEdit.publisher,
        edition: bookToEdit.edition,
        category: bookToEdit.category,
        department: bookToEdit.department,
        totalCopies: bookToEdit.totalCopies,
        availableCopies: bookToEdit.availableCopies,
        description: bookToEdit.description,
        coverImage: bookToEdit.coverImage,
        shelfLocation: bookToEdit.shelfLocation,
        publishedYear: bookToEdit.publishedYear
      });
    } else {
      const autoId = `BK-${1000 + books.length + 1}`;
      setBookId(autoId);
      setScannedBadge(null);
      setFormData({
        title: '',
        author: '',
        isbn: '978-0' + Math.floor(100000000 + Math.random() * 900000000),
        publisher: 'Academic Press',
        edition: '1st Edition',
        category: CATEGORIES[1],
        department: DEPARTMENTS[1],
        totalCopies: 10,
        availableCopies: 10,
        description: '',
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
        shelfLocation: 'Shelf CS-05-A',
        publishedYear: 2024
      });
    }
  }, [bookToEdit, isOpen, books.length]);

  if (!isOpen) return null;

  const handleScanBarcodeComplete = (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    setIsScannerOpen(false);
    setBookId(trimmedCode);
    setScannedBadge(`Scanned: ${trimmedCode}`);

    // Check if the scanned barcode matches an existing book in the catalog
    const cleanCode = trimmedCode.toLowerCase().replace(/[-\s]/g, '');
    const matched = books.find(b => {
      const bId = b.id.toLowerCase().replace(/[-\s]/g, '');
      const bIsbn = b.isbn.toLowerCase().replace(/[-\s]/g, '');
      return bId === cleanCode || bIsbn === cleanCode;
    });

    if (matched) {
      setFormData({
        title: matched.title,
        author: matched.author,
        isbn: matched.isbn,
        publisher: matched.publisher,
        edition: matched.edition,
        category: matched.category,
        department: matched.department,
        totalCopies: matched.totalCopies,
        availableCopies: matched.availableCopies,
        description: matched.description,
        coverImage: matched.coverImage,
        shelfLocation: matched.shelfLocation,
        publishedYear: matched.publishedYear
      });
      setBookId(matched.id);
      addToast('Book Identified 📖', `Loaded "${matched.title}" (${matched.id}) from catalog`, 'success');
    } else {
      // If code resembles an ISBN, also fill ISBN if placeholder
      const isIsbnFormat = /^(978|979|\d{10,13})/.test(cleanCode);
      if (isIsbnFormat && (!formData.isbn || formData.isbn.startsWith('978-0'))) {
        setFormData(prev => ({ ...prev, isbn: trimmedCode }));
      }
      addToast('Barcode Scanned ✓', `Book ID set to: ${trimmedCode}`, 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      addToast('Validation Error', 'Book title and author are required.', 'error');
      return;
    }

    const cleanId = bookToEdit ? bookToEdit.id : bookId.trim();
    if (!cleanId) {
      addToast('Validation Error', 'Book ID is required. Please type or scan an ID.', 'error');
      return;
    }

    const calculatedAvailable = Math.max(0, (formData.totalCopies || 0) - issuedCopiesCount);
    const savedBookRecord: Book = {
      ...formData,
      availableCopies: calculatedAvailable,
      id: cleanId
    };

    if (bookToEdit) {
      updateBook(bookToEdit.id, { ...formData, availableCopies: calculatedAvailable, id: bookToEdit.id });
    } else {
      addBook({ ...formData, availableCopies: calculatedAvailable, id: cleanId });
    }

    // Automatically download barcode file if user selected option
    if (downloadBarcodesOnFile) {
      setTimeout(async () => {
        try {
          const libName = systemSettings?.libraryName || 'College Central Library';
          if (barcodeDownloadScope === 'all') {
            const allBooksCombined = [savedBookRecord, ...books.filter(b => b.id.toLowerCase() !== cleanId.toLowerCase())];
            await downloadAllBarcodesPDF(allBooksCombined, libName);
            addToast('All Barcodes File Downloaded 📄', `Exported printable barcode sheet for ${allBooksCombined.length} catalog items.`, 'success');
          } else {
            await downloadSingleBookBarcode(savedBookRecord, 'pdf', libName);
            addToast('Barcode Sticker Downloaded 🏷️', `Exported barcode sticker for "${savedBookRecord.title}" (${cleanId}).`, 'success');
          }
        } catch (err: any) {
          console.error('Failed to download barcode file:', err);
          addToast('Download Failed', err?.message || 'Error creating barcode file', 'error');
        }
      }, 350);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div
        key="add-edit-book-backdrop"
        id="add-edit-book-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          key="add-edit-book-modal-container"
          id="add-edit-book-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-slate-900/90 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-2xl w-full overflow-hidden my-8 text-white"
        >
          {/* Header */}
          <div className="p-6 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
                {bookToEdit ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{bookToEdit ? `Edit Book (${bookToEdit.id})` : 'Add New Book to Inventory'}</span>
                  {scannedBadge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                      Barcode Scanned
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in book metadata or scan physical barcode to auto-populate
                </p>
              </div>
            </div>

            <button
              id="close-add-edit-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BOOK ID & ACCESSION NUMBER */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-indigo-400" />
                    <label htmlFor="form-book-id" className="text-xs font-bold text-indigo-200">
                      Book ID / Accession Number *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {bookToEdit ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20 font-semibold">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Locked on Edit</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const nextId = `BK-${1000 + books.length + 1}`;
                          setBookId(nextId);
                          setScannedBadge(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors cursor-pointer"
                        title="Auto-generate standard Book ID"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Auto ID</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="form-book-id"
                    type="text"
                    required
                    disabled={!!bookToEdit}
                    readOnly={!!bookToEdit}
                    placeholder="e.g. BK-1008 or scan barcode"
                    value={bookId}
                    onChange={e => {
                      if (!bookToEdit) {
                        setBookId(e.target.value);
                        setScannedBadge(null);
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all font-mono font-bold tracking-wide ${
                      bookToEdit
                        ? 'bg-slate-950/80 border border-slate-700/60 text-slate-400 cursor-not-allowed select-none opacity-90'
                        : 'bg-slate-900/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400'
                    }`}
                  />
                  {bookToEdit && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span>Book ID cannot be changed during edit to preserve barcode consistency and accession history.</span>
                    </div>
                  )}
                  {scannedBadge && !bookToEdit && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{scannedBadge} — Scanned successfully</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Book Title *
                </label>
                <input
                  id="form-book-title"
                  type="text"
                  required
                  placeholder="e.g. Modern Software Engineering Architecture"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Author(s) *
                </label>
                <input
                  id="form-book-author"
                  type="text"
                  required
                  placeholder="e.g. Martin Fowler"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ISBN Number
                </label>
                <input
                  id="form-book-isbn"
                  type="text"
                  placeholder="978-0132350884"
                  value={formData.isbn}
                  onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="form-book-category"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All Categories').map((c, idx) => (
                    <option key={`edit-book-cat-${c}-${idx}`} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <select
                  id="form-book-department"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md cursor-pointer"
                >
                  {DEPARTMENTS.filter(d => d !== 'All Departments').map((d, idx) => (
                    <option key={`edit-book-dept-${d}-${idx}`} value={d} className="bg-slate-900 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Publisher
                </label>
                <input
                  id="form-book-publisher"
                  type="text"
                  placeholder="O'Reilly Media"
                  value={formData.publisher}
                  onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Edition
                </label>
                <input
                  id="form-book-edition"
                  type="text"
                  placeholder="3rd Edition"
                  value={formData.edition}
                  onChange={e => setFormData({ ...formData, edition: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label htmlFor="form-book-total-copies" className="block text-xs font-semibold text-slate-300 mb-1">
                  Total / Original Copies *
                </label>
                <input
                  id="form-book-total-copies"
                  type="number"
                  min="1"
                  required
                  value={formData.totalCopies}
                  onChange={e => {
                    const total = Math.max(1, parseInt(e.target.value) || 1);
                    setFormData(prev => ({
                      ...prev,
                      totalCopies: total,
                      availableCopies: Math.max(0, total - issuedCopiesCount)
                    }));
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="form-book-available-copies" className="block text-xs font-semibold text-slate-300">
                    Available Copies
                  </label>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    Auto Calculated
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="form-book-available-copies"
                    type="number"
                    readOnly
                    disabled
                    value={computedAvailableCopies}
                    className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-indigo-500/30 text-emerald-400 font-bold font-mono rounded-xl outline-none cursor-not-allowed select-none opacity-90 transition-all backdrop-blur-md"
                  />
                  <div className="absolute right-3 top-2 flex items-center gap-1.5 text-xs text-slate-400 pointer-events-none">
                    <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                      {computedAvailableCopies} / {formData.totalCopies} Available
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Total ({formData.totalCopies}) - Issued to students ({issuedCopiesCount}) = <strong className="text-emerald-400">{computedAvailableCopies} copies</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shelf Location
                </label>
                <input
                  id="form-book-shelf"
                  type="text"
                  placeholder="Shelf CS-02-A"
                  value={formData.shelfLocation}
                  onChange={e => setFormData({ ...formData, shelfLocation: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Published Year
                </label>
                <input
                  id="form-book-year"
                  type="number"
                  placeholder="2023"
                  value={formData.publishedYear}
                  onChange={e => setFormData({ ...formData, publishedYear: parseInt(e.target.value) || 2024 })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  id="form-book-cover"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Synopsis / Description
                </label>
                <textarea
                  id="form-book-description"
                  rows={3}
                  placeholder="Detailed summary of book contents..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl outline-none focus:border-indigo-400 transition-all backdrop-blur-md"
                />
              </div>

              {/* BARCODE FILE EXPORT SETTINGS */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 shadow-inner space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                      <Barcode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Barcode File Export</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Automatically download printable barcode stickers file after adding book
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const libName = systemSettings?.libraryName || 'College Central Library';
                        const currentId = bookId.trim() || `BK-${1000 + books.length + 1}`;
                        const currentPreviewBook: Book = { ...formData, id: currentId };
                        const combinedList = [currentPreviewBook, ...books.filter(b => b.id.toLowerCase() !== currentId.toLowerCase())];
                        await downloadAllBarcodesPDF(combinedList, libName);
                        addToast('All Barcodes File Downloaded 📄', `Exported printable PDF sheet for all ${combinedList.length} books.`, 'success');
                      } catch (err: any) {
                        addToast('Download Failed', err?.message || 'Error generating barcodes', 'error');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-indigo-200 border border-white/15 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    title="Download barcode stickers PDF sheet for all books in the catalog right now"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download All Barcodes Now ({books.length})</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-indigo-500/20">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={downloadBarcodesOnFile}
                      onChange={e => setDownloadBarcodesOnFile(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span>Download Barcodes in File After Adding</span>
                  </label>

                  {downloadBarcodesOnFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Scope:</span>
                      <select
                        value={barcodeDownloadScope}
                        onChange={e => setBarcodeDownloadScope(e.target.value as 'all' | 'single')}
                        className="px-2.5 py-1 text-xs bg-slate-900 border border-indigo-500/30 text-white rounded-lg outline-none cursor-pointer font-medium"
                      >
                        <option value="all">All Barcodes in File (PDF Sticker Sheet)</option>
                        <option value="single">This Book Barcode Sticker (PDF)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors backdrop-blur-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {bookToEdit ? 'Save Changes' : 'Publish to Catalog'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Barcode / QR Scanner for Book ID */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanBarcodeComplete}
        title="Scan Physical Book Barcode / QR Code"
      />
    </AnimatePresence>
  );
};
