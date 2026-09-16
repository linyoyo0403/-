import { Student } from '../types';

/**
 * Parse text or CSV content into a list of Student objects.
 * Handles:
 * - Direct Excel/Sheets copy-paste (Tab-separated)
 * - Standard CSV (comma-separated with/without quotes)
 * - Simple newline list of names
 * - Seat numbers if present (e.g., "01, 王小明" or "1\t王小明" or "王小明")
 */
export function parseStudentInput(rawText: string): Student[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const parsedStudents: Student[] = [];
  let seatCounter = 1;

  // Check if first line looks like a header (e.g., contains '姓名', 'name', '座號', '學號', 'id')
  const firstLine = lines[0].toLowerCase();
  const isHeader =
    firstLine.includes('姓名') ||
    firstLine.includes('name') ||
    firstLine.includes('座號') ||
    firstLine.includes('學號') ||
    firstLine.includes('student');

  const startIndex = isHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    // Detect delimiter: tab, comma, semicolon
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(',')) {
      // Split by comma respecting quotes
      parts = parseCSVLine(line);
    } else if (line.includes(';')) {
      parts = line.split(';');
    } else if (/\s{2,}/.test(line)) {
      // Multiple spaces
      parts = line.split(/\s{2,}/);
    } else {
      // Single token or space separated
      const spaceIdx = line.indexOf(' ');
      if (spaceIdx > 0 && /^\d+$/.test(line.slice(0, spaceIdx).trim())) {
        parts = [line.slice(0, spaceIdx).trim(), line.slice(spaceIdx + 1).trim()];
      } else {
        parts = [line];
      }
    }

    const cleanParts = parts.map((p) => p.replace(/^["']|["']$/g, '').trim()).filter(Boolean);

    if (cleanParts.length === 0) continue;

    let number = '';
    let name = '';
    let note = '';

    if (cleanParts.length === 1) {
      name = cleanParts[0];
      number = String(seatCounter).padStart(2, '0');
    } else if (cleanParts.length === 2) {
      // Check which one is number and which is name
      if (/^\d+$/.test(cleanParts[0])) {
        number = cleanParts[0].padStart(2, '0');
        name = cleanParts[1];
      } else if (/^\d+$/.test(cleanParts[1])) {
        name = cleanParts[0];
        number = cleanParts[1].padStart(2, '0');
      } else {
        number = String(seatCounter).padStart(2, '0');
        name = cleanParts[0];
        note = cleanParts[1];
      }
    } else {
      // 3 or more parts
      // Find if one part is purely numeric
      const numIdx = cleanParts.findIndex((p) => /^\d+$/.test(p));
      if (numIdx !== -1) {
        number = cleanParts[numIdx].padStart(2, '0');
        const remaining = cleanParts.filter((_, idx) => idx !== numIdx);
        name = remaining[0];
        note = remaining.slice(1).join(' - ');
      } else {
        number = String(seatCounter).padStart(2, '0');
        name = cleanParts[0];
        note = cleanParts.slice(1).join(' - ');
      }
    }

    if (name) {
      parsedStudents.push({
        id: `std-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        number,
        name,
        note: note || undefined,
      });
      seatCounter++;
    }
  }

  return parsedStudents;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function exportRosterToCSV(students: Student[]): string {
  const rows = ['座號,姓名,備註'];
  students.forEach((s) => {
    rows.push(`"${s.number || ''}","${s.name.replace(/"/g, '""')}","${(s.note || '').replace(/"/g, '""')}"`);
  });
  return rows.join('\n');
}
