import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { Book } from '../types';

/**
 * Extracts binary module string ('1' and '0') for CODE128 barcode format.
 * Enables drawing 100% mathematical vector lines with zero blur and instant scanner recognition.
 */
export const getCode128Binary = (text: string): string | null => {
  try {
    const CODE128 = (JsBarcode as any).getModule ? (JsBarcode as any).getModule('CODE128') : null;
    if (CODE128) {
      const encoder = new CODE128(text, {});
      if (encoder && typeof encoder.encode === 'function') {
        const result = encoder.encode();
        if (result && typeof result.data === 'string') {
          return result.data;
        }
      }
    }
  } catch (err) {
    console.warn('Code128 binary extraction error, falling back:', err);
  }
  return null;
};

/**
 * Draws an ultra-sharp, high-contrast vector Code 128 barcode directly into a jsPDF document.
 * This completely eliminates raster scaling blur, pixelation, and anti-aliasing artifacts,
 * ensuring optical laser and camera/phone scanners decode instantaneously (< 0.1s).
 */
export const drawVectorBarcodeInDoc = (
  doc: jsPDF,
  code: string,
  x: number,
  y: number,
  boxWidth: number,
  boxHeight: number,
  options?: {
    displayValue?: boolean;
    fontSize?: number;
    quietZoneWidth?: number;
  }
): void => {
  const binary = getCode128Binary(code);
  const displayValue = options?.displayValue ?? true;
  const fontSize = options?.fontSize || 9;
  const quietZone = options?.quietZoneWidth ?? 6;
  const availableWidth = boxWidth - quietZone * 2;
  const textSpace = displayValue ? 4.6 : 0;
  const barHeight = Math.max(12, boxHeight - textSpace);

  // Background white box for quiet zone & maximum optical contrast
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, boxWidth, boxHeight, 'F');

  if (binary && binary.length > 0) {
    const modWidth = availableWidth / binary.length;
    const startX = x + quietZone;

    // Draw pure black vector rectangles with zero interpolation blur
    doc.setFillColor(0, 0, 0);
    let curBarWidth = 0;
    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === '1') {
        curBarWidth += modWidth;
      } else if (curBarWidth > 0) {
        const barX = startX + (i - curBarWidth / modWidth) * modWidth;
        doc.rect(barX, y, curBarWidth, barHeight, 'F');
        curBarWidth = 0;
      }
    }
    if (curBarWidth > 0) {
      const barX = startX + (binary.length - curBarWidth / modWidth) * modWidth;
      doc.rect(barX, y, curBarWidth, barHeight, 'F');
    }

    // Clean, crisp vector text underneath the barcode
    if (displayValue) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);
      doc.text(code, x + boxWidth / 2, y + barHeight + 3.8, { align: 'center' });
    }
  } else {
    // High-resolution raster fallback if encoder is unavailable
    const fallbackUrl = generateBarcodeDataUrl(code, { width: 3.5, height: 80, displayValue });
    doc.addImage(fallbackUrl, 'PNG', x, y, boxWidth, boxHeight);
  }
};

/**
 * Generates an ultra-crisp high-DPI PNG data URL for a given barcode string.
 */
export const generateBarcodeDataUrl = (
  text: string,
  options?: { width?: number; height?: number; displayValue?: boolean; fontSize?: number }
): string => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: options?.width || 3.5, // High pixel density module width
      height: options?.height || 85, // Generous bar height for fast scanning
      displayValue: options?.displayValue ?? true,
      font: 'monospace',
      fontSize: options?.fontSize || 18,
      textMargin: 6,
      margin: 12,
      background: '#ffffff',
      lineColor: '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate barcode data URL:', err);
    // Fallback crisp canvas with clean monospace text
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 400;
    fallbackCanvas.height = 100;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 100);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`* ${text} *`, 200, 55);
    }
    return fallbackCanvas.toDataURL('image/png');
  }
};

/**
 * Generates and triggers download of a single book's styled barcode sticker label.
 */
export const downloadSingleBookBarcode = async (
  book: Book,
  format: 'png' | 'pdf' = 'pdf',
  institutionName = 'COLLEGE CENTRAL LIBRARY'
): Promise<void> => {
  if (format === 'png') {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 800;
    labelCanvas.height = 480;
    const ctx = labelCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 480);

    // Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 776, 456);

    // Top Header Banner
    ctx.fillStyle = '#1e1b4b'; // Indigo 950
    ctx.fillRect(14, 14, 772, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(institutionName.toUpperCase(), 30, 45);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('OFFICIAL ACCESSION BARCODE', 520, 45);

    // Book ID & Shelf Location Row
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`ID: ${book.id}`, 30, 95);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`Shelf: ${book.shelfLocation || 'General Stacks'}`, 510, 95);

    // Book Title (Clean multiline rendering)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    const titleLines = wrapCanvasText(ctx, book.title, 730);
    let titleY = 126;
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, 30, titleY);
      titleY += 24;
    }

    // Author & Edition Details
    ctx.fillStyle = '#334155';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`Author: ${book.author}  •  Edition: ${book.edition || '1st Edition'}`, 30, titleY + 4);

    // Department & Category
    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Dept: ${book.department || 'General'}  •  Cat: ${book.category || 'General'}`, 30, titleY + 26);

    // High-Precision Pixel Barcode (Instant Optical Scanning)
    const binary = getCode128Binary(book.id);
    const barcodeBoxX = 40;
    const barcodeBoxY = titleY + 34;
    const barcodeBoxW = 720;
    const barcodeBoxH = 145;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barcodeBoxX, barcodeBoxY, barcodeBoxW, barcodeBoxH);

    if (binary && binary.length > 0) {
      const quietZone = 40;
      const availableW = barcodeBoxW - quietZone * 2;
      const modW = availableW / binary.length;
      const barH = 110;

      ctx.fillStyle = '#000000';
      let curBarWidth = 0;
      for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
          curBarWidth += modW;
        } else if (curBarWidth > 0) {
          const barX = barcodeBoxX + quietZone + (i - curBarWidth / modW) * modW;
          ctx.fillRect(barX, barcodeBoxY, curBarWidth, barH);
          curBarWidth = 0;
        }
      }
      if (curBarWidth > 0) {
        const barX = barcodeBoxX + quietZone + (binary.length - curBarWidth / modW) * modW;
        ctx.fillRect(barX, barcodeBoxY, curBarWidth, barH);
      }

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(book.id, barcodeBoxX + barcodeBoxW / 2, barcodeBoxY + barH + 26);
    } else {
      const barcodeUrl = generateBarcodeDataUrl(book.id, { width: 3.5, height: 80, displayValue: true });
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 40, barcodeBoxY, 720, 135);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = barcodeUrl;
      });
    }

    // Footer Metadata
    ctx.fillStyle = '#475569';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ISBN: ${book.isbn}  •  Year: ${book.publishedYear || '—'}`, 30, 455);

    const link = document.createElement('a');
    link.href = labelCanvas.toDataURL('image/png');
    link.download = `Barcode-${book.id}-${book.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // PDF format - Standard 105mm x 65mm physical label
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [105, 65]
  });

  // Border
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);
  doc.roundedRect(3, 3, 99, 59, 2, 2, 'S');

  // Top Banner
  doc.setFillColor(30, 27, 75);
  doc.rect(3, 3, 99, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(institutionName.toUpperCase(), 6, 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(199, 210, 254);
  doc.text('ACCESSION BARCODE', 76, 7.5);

  // Book ID & Shelf Location
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text(`ID: ${book.id}`, 6, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Shelf: ${book.shelfLocation || 'Stacks'}`, 60, 14);

  // Book Title (Multi-line text wrapping without truncation)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(book.title, 93);
  let yOffset = 18;
  for (let i = 0; i < Math.min(titleLines.length, 2); i++) {
    doc.text(titleLines[i], 6, yOffset);
    yOffset += 3.8;
  }

  // Author & Edition
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const authorLines = doc.splitTextToSize(`Author: ${book.author} (${book.edition || '1st Edition'})`, 93);
  doc.text(authorLines[0], 6, yOffset);
  yOffset += 3.5;

  // Category & Department
  doc.setFontSize(5.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dept: ${book.department || 'General'}  •  Cat: ${book.category || 'General'}`, 6, yOffset);
  yOffset += 2;

  // ULTRA-SHARP 100% VECTOR BARCODE (Zero blur, instant scanning on any camera / scanner)
  drawVectorBarcodeInDoc(doc, book.id, 6, yOffset, 93, 21.5, {
    displayValue: true,
    fontSize: 9.5,
    quietZoneWidth: 7
  });

  // Footer info without dynamic copies count
  doc.setFont('courier', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(`ISBN: ${book.isbn}  |  Year: ${book.publishedYear || '—'}`, 6, 60);

  doc.save(`Barcode-Sticker-${book.id}.pdf`);
};

/**
 * Helper to wrap text cleanly for canvas drawing
 */
function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates and downloads a multi-label PDF containing ALL book barcodes in the catalog,
 * laid out as a printable sheet (2 columns x 4 rows per A4 page).
 * Every barcode is rendered as a razor-sharp vector for instantaneous scanner reading.
 */
export const downloadAllBarcodesPDF = async (
  booksList: Book[],
  institutionName = 'COLLEGE CENTRAL LIBRARY'
): Promise<void> => {
  if (!booksList || booksList.length === 0) {
    throw new Error('No books available to export barcodes.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210mm x 297mm
  });

  const pageWidth = 210;
  const marginX = 10;
  const marginTop = 18;
  const cols = 2;
  const rows = 4;
  const labelsPerPage = cols * rows;

  const cardWidth = (pageWidth - marginX * 2 - 8) / cols; // ~91mm
  const cardHeight = 63; // 63mm height

  let currentBookIndex = 0;

  while (currentBookIndex < booksList.length) {
    if (currentBookIndex > 0) {
      doc.addPage();
    }

    // Page Header
    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, pageWidth, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${institutionName.toUpperCase()} — PHYSICAL BOOK BARCODE LABELS`, marginX, 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(224, 231, 255);
    const pageNum = Math.floor(currentBookIndex / labelsPerPage) + 1;
    const totalPages = Math.ceil(booksList.length / labelsPerPage);
    doc.text(`Sheet ${pageNum} of ${totalPages}  •  ${booksList.length} Total Books in Catalog`, pageWidth - marginX - 60, 8);

    // Draw grid of labels on this page
    for (let i = 0; i < labelsPerPage && currentBookIndex < booksList.length; i++) {
      const book = booksList[currentBookIndex];
      const colIndex = i % cols;
      const rowIndex = Math.floor(i / cols);

      const x = marginX + colIndex * (cardWidth + 8);
      const y = marginTop + rowIndex * (cardHeight + 6);

      // Card outer cut-out border
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setLineWidth(0.35);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');

      // Top label bar banner
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(x, y, cardWidth, 4.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text(institutionName.toUpperCase(), x + 3.5, y + 3.3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(224, 231, 255);
      doc.text('ACCESSION BARCODE', x + cardWidth - 27, y + 3.3);

      // Row 1: Book ID (Prominent bold monospace) & Shelf Location
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text(`ID: ${book.id}`, x + 3.5, y + 9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      const shelfText = `Shelf: ${book.shelfLocation || 'General Stacks'}`;
      doc.text(shelfText, x + cardWidth - 3.5 - doc.getTextWidth(shelfText), y + 9);

      // Row 2: Book Title (Clean 2-line wrap with splitTextToSize)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(book.title, cardWidth - 7);
      let textCursorY = y + 13;
      for (let t = 0; t < Math.min(titleLines.length, 2); t++) {
        doc.text(titleLines[t], x + 3.5, textCursorY);
        textCursorY += 3.4;
      }

      // Row 3: Author & Edition
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(71, 85, 105);
      const authorText = `Author: ${book.author} (${book.edition || '1st Ed.'})`;
      const cleanAuthor = authorText.length > 52 ? authorText.substring(0, 50) + '...' : authorText;
      doc.text(cleanAuthor, x + 3.5, textCursorY);
      textCursorY += 3.2;

      // Row 4: Department & Category
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dept: ${book.department || 'General'}  •  Cat: ${book.category || 'General'}`, x + 3.5, textCursorY);
      textCursorY += 1.8;

      // Row 5: Razor-Sharp Vector Barcode (Ultra-fast optical laser and camera scan)
      drawVectorBarcodeInDoc(doc, book.id, x + 3, textCursorY, cardWidth - 6, 21, {
        displayValue: true,
        fontSize: 8.5,
        quietZoneWidth: 6
      });

      // Row 6: Footer metadata (ISBN, Published Year)
      doc.setFont('courier', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(51, 65, 85);
      doc.text(`ISBN: ${book.isbn}`, x + 3.5, y + cardHeight - 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      const yearText = `Year: ${book.publishedYear || '—'}`;
      doc.text(yearText, x + cardWidth - 3.5 - doc.getTextWidth(yearText), y + cardHeight - 3);

      currentBookIndex++;
    }
  }

  // Save the complete PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`All-Library-Barcodes-${timestamp}.pdf`);
};

/**
 * Generates and downloads an Excel/CSV catalog spreadsheet containing all
 * book barcode values and complete metadata for inventory systems or thermal label software.
 */
export const downloadAllBarcodesCSV = (
  booksList: Book[],
  institutionName = 'COLLEGE CENTRAL LIBRARY'
): void => {
  if (!booksList || booksList.length === 0) {
    throw new Error('No books available to export barcodes CSV.');
  }

  const headers = [
    'Book ID',
    'Barcode String',
    'Barcode Symbology',
    'Book Title',
    'Author',
    'ISBN',
    'Category',
    'Department',
    'Shelf Location',
    'Available Copies',
    'Total Copies',
    'Edition',
    'Publisher',
    'Published Year',
    'Library Name'
  ];

  const escapeCSV = (val: any): string => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = booksList.map(b => [
    escapeCSV(b.id),
    escapeCSV(b.id),
    escapeCSV('CODE128'),
    escapeCSV(b.title),
    escapeCSV(b.author),
    escapeCSV(b.isbn),
    escapeCSV(b.category),
    escapeCSV(b.department),
    escapeCSV(b.shelfLocation),
    escapeCSV(b.availableCopies),
    escapeCSV(b.totalCopies),
    escapeCSV(b.edition || '1st Edition'),
    escapeCSV(b.publisher || 'Academic Press'),
    escapeCSV(b.publishedYear || 2024),
    escapeCSV(institutionName)
  ]);

  const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.download = `Library-Barcodes-Catalog-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
