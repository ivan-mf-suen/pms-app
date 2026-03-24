/**
 * Export utilities for Excel and CSV file generation
 * Uses SheetJS CDN for Excel; falls back to CSV for robustness
 */

export interface ExportColumn {
  key: string;
  label: string;
}

/**
 * Export data to CSV format string
 * @param data - Array of objects to export
 * @param columns - Column definitions with key and label
 * @returns CSV string
 */
export function generateCSV(
  data: Record<string, any>[],
  columns: ExportColumn[]
): string {
  // Header row
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';

        // Escape quotes and wrap in quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file to user's browser
 * @param csv - CSV string content
 * @param filename - File name (without extension)
 */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format using SheetJS
 * Falls back to CSV if XLSX library is not available
 * @param data - Array of objects to export
 * @param columns - Column definitions with key and label
 * @param filename - File name (without extension)
 */
export async function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
) {
  // Try to load SheetJS from CDN
  try {
    // Check if XLSX is already loaded
    if (typeof (window as any).XLSX !== 'undefined') {
      performExcelExport(data, columns, filename);
      return;
    }

    // Load SheetJS from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.async = true;

    script.onload = () => {
      performExcelExport(data, columns, filename);
    };

    script.onerror = () => {
      console.warn('Failed to load XLSX library, falling back to CSV');
      fallbackToCSV(data, columns, filename);
    };

    document.body.appendChild(script);
  } catch (error) {
    console.error('Error loading Excel export:', error);
    fallbackToCSV(data, columns, filename);
  }
}

/**
 * Perform the actual Excel export using SheetJS
 */
function performExcelExport(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
) {
  try {
    const XLSX = (window as any).XLSX;

    // Prepare worksheet data
    const wsData = [
      columns.map((col) => col.label),
      ...data.map((row) => columns.map((col) => row[col.key] ?? '')),
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Set column widths
    const colWidths = columns.map((col) => ({ wch: Math.max(col.label.length, 12) }));
    ws['!cols'] = colWidths;

    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error performing Excel export:', error);
    fallbackToCSV(data, columns, filename);
  }
}

/**
 * Fallback to CSV export if Excel export fails
 */
function fallbackToCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
) {
  const csv = generateCSV(data, columns);
  downloadCSV(csv, filename);
}

/**
 * Format number as currency for export
 */
export function formatCurrencyForExport(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date as YYYY-MM-DD for export
 */
export function formatDateForExport(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}
