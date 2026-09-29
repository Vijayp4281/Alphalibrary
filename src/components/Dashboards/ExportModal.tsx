import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, FileCode, Check, Layers, Users, History, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToExcel, exportToPdf, exportToTxt, exportToJson } from '../../utils/exportUtils';
import { BorrowRecord, Book } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowRecords: BorrowRecord[];
  books: Book[];
  addToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  borrowRecords,
  books,
  addToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'borrowers' | 'inventory' | 'history'>('borrowers');
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf' | 'txt' | 'json'>('excel');

  if (!isOpen) return null;

  const handleExport = () => {
    const timestamp = Date.now();
    let dataToExport: any[] = [];
    let title = '';
    let filename = '';

    if (selectedCategory === 'borrowers') {
      title = 'Student Circulation & Borrowing Report';
      filename = `library_borrow_report_${timestamp}`;
      dataToExport = borrowRecords.map(r => ({
        'Record ID': r.id,
        'Student Name': r.studentName,
        'Roll Number': r.studentRollNo,
        'Department': r.studentDepartment,
        'Book Title': r.bookTitle,
        'Book ID': r.bookId,
        'Borrow Date': r.borrowDate,
        'Due Date': r.dueDate,
        'Status': r.status,
        'Return Date': r.returnDate || 'Pending Submission',
        'Handled By Staff': r.handledByStaffId || 'System Auto'
      }));
    } else if (selectedCategory === 'inventory') {
      title = 'Library Catalog Inventory Report';
      filename = `library_catalog_inventory_${timestamp}`;
      dataToExport = books.map(b => ({
        'Book ID': b.id,
        'Title': b.title,
        'Author': b.author,
        'ISBN': b.isbn,
        'Category': b.category,
        'Department': b.department,
        'Shelf Location': b.shelfLocation,
        'Available Copies': b.availableCopies,
        'Total Copies': b.totalCopies,
        'Rating': b.rating
      }));
    } else if (selectedCategory === 'history') {
      title = 'Library Audit Trail & Transaction Logs';
      filename = `library_audit_logs_${timestamp}`;
      dataToExport = borrowRecords.map(r => ({
        'Transaction ID': r.id,
        'Student Name': r.studentName,
        'Roll Number': r.studentRollNo,
        'Book Title': r.bookTitle,
        'Borrow Date': r.borrowDate,
        'Return Date': r.returnDate || 'Pending Submission',
        'Status': r.status,
        'Verified Staff ID': r.handledByStaffId || 'System Auto'
      }));
    }

    if (dataToExport.length === 0) {
      addToast('Export Failed', 'No records available to export.', 'error');
      return;
    }

    switch (selectedFormat) {
      case 'excel':
        exportToExcel(dataToExport, filename, title);
        addToast('Excel Export Ready', `Downloaded ${filename}.csv formatted for MS Excel.`, 'success');
        break;
      case 'pdf':
        exportToPdf(dataToExport, filename, title);
        addToast('PDF Export Generated', `Created printable PDF document report for ${title}.`, 'success');
        break;
      case 'txt':
        exportToTxt(dataToExport, filename, title);
        addToast('TXT Export Ready', `Downloaded text document ${filename}.txt.`, 'success');
        break;
      case 'json':
        exportToJson(dataToExport, filename);
        addToast('JSON Export Ready', `Downloaded structured ${filename}.json file.`, 'success');
        break;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-900 dark:text-white overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Export Data Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select dataset and download format
                </p>
              </div>
            </div>
            <button
              id="btn-close-export-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 my-6">
            {/* Step 1: Select Dataset */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                1. Select Dataset to Export
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="export-data-type-borrowers"
                  type="button"
                  onClick={() => setSelectedCategory('borrowers')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selectedCategory === 'borrowers'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold block leading-snug">Borrowing Records</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {borrowRecords.length} Items
                  </span>
                </button>

                <button
                  id="export-data-type-inventory"
                  type="button"
                  onClick={() => setSelectedCategory('inventory')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selectedCategory === 'inventory'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold block leading-snug">Book Catalog</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {books.length} Books
                  </span>
                </button>

                <button
                  id="export-data-type-history"
                  type="button"
                  onClick={() => setSelectedCategory('history')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    selectedCategory === 'history'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold block leading-snug">Audit Trail</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                    Full Logs
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Select Download Format */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                2. Select Download Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Excel */}
                <button
                  id="export-format-excel"
                  type="button"
                  onClick={() => setSelectedFormat('excel')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedFormat === 'excel'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between">
                      Excel (.csv)
                      {selectedFormat === 'excel' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Spreadsheet format ready for MS Excel & Google Sheets
                    </div>
                  </div>
                </button>

                {/* PDF */}
                <button
                  id="export-format-pdf"
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedFormat === 'pdf'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between">
                      PDF Document (.pdf)
                      {selectedFormat === 'pdf' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Printable formatted document with header & summary
                    </div>
                  </div>
                </button>

                {/* TXT */}
                <button
                  id="export-format-txt"
                  type="button"
                  onClick={() => setSelectedFormat('txt')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedFormat === 'txt'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-600 text-white shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between">
                      Text Document (.txt)
                      {selectedFormat === 'txt' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Clean plain text report with formatted alignment
                    </div>
                  </div>
                </button>

                {/* JSON */}
                <button
                  id="export-format-json"
                  type="button"
                  onClick={() => setSelectedFormat('json')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedFormat === 'json'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center justify-between">
                      JSON Data (.json)
                      {selectedFormat === 'json' && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      Structured developer JSON payload
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Auto-formatted export
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-export-modal"
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-download-export"
                type="button"
                onClick={handleExport}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
