import { jsPDF } from 'jspdf';

export const exportToExcel = (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];
  
  // Title & Timestamp header
  csvRows.push(`"${title} - Generated on ${new Date().toLocaleString()}"`);
  csvRows.push('');
  
  // Header row
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  
  // Data rows
  data.forEach(row => {
    const values = headers.map(h => {
      const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Microsoft Excel
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToTxt = (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  let txt = `================================================================================\n`;
  txt += `                      ${title.toUpperCase()}                      \n`;
  txt += `                Generated on: ${new Date().toLocaleString()}              \n`;
  txt += `================================================================================\n\n`;

  data.forEach((item, idx) => {
    txt += `--- Record #${idx + 1} ---\n`;
    headers.forEach(key => {
      txt += `${key.padEnd(20)}: ${item[key] ?? 'N/A'}\n`;
    });
    txt += `\n`;
  });

  txt += `================================================================================\n`;
  txt += `Total Records: ${data.length}\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);

  const doc = new jsPDF('landscape');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text("CAMPUS LIBRARY MANAGEMENT SYSTEM", 14, 15);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`${title} • Generated on ${new Date().toLocaleString()}`, 14, 23);
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 27, 283, 27);

  let y = 35;
  const filteredHeaders = headers.filter(h => {
    const lower = h.toLowerCase();
    return !lower.includes('review') && !lower.includes('rating') && !lower.includes('action');
  });

  const colWidths = filteredHeaders.map(h => {
    const lower = h.toLowerCase();
    if (lower.includes('id') || lower.includes('date') || lower.includes('isbn') || lower.includes('copies') || lower.includes('status')) return 26;
    if (lower.includes('title') || lower.includes('name') || lower.includes('author') || lower.includes('email') || lower.includes('department')) return 36;
    return 32;
  });
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  // Draw Header background
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 5, Math.min(totalWidth, 269), 8, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  
  let x = 14;
  filteredHeaders.forEach((h, i) => {
    doc.text(String(h).substring(0, 18), x + 2, y);
    x += colWidths[i];
  });

  y += 6;
  doc.line(14, y - 3, 14 + Math.min(totalWidth, 269), y - 3);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  data.forEach((row, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
      // Repeat header on new page
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 5, Math.min(totalWidth, 269), 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      let hx = 14;
      filteredHeaders.forEach((h, i) => {
        doc.text(String(h).substring(0, 18), hx + 2, y);
        hx += colWidths[i];
      });
      y += 6;
      doc.line(14, y - 3, 14 + Math.min(totalWidth, 269), y - 3);
      y += 3;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, Math.min(totalWidth, 269), 7, 'F');
    }

    x = 14;
    filteredHeaders.forEach((h, i) => {
      const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '-';
      doc.text(val.substring(0, 25), x + 2, y);
      x += colWidths[i];
    });
    y += 7;
  });

  doc.save(`${filename}.pdf`);
};

export const exportToJson = (data: any[], filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
