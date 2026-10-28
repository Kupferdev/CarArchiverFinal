/** Offline Excel-compatible CSV export. Deliberately excludes media bytes. */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getDb } from './db';

function cell(value: unknown): string {
  const content = value == null ? '' : String(value);
  // Excel treats cells starting with these characters as formulas. Escape user content.
  const safe = /^[\s]*[=+@\-\t\r]/.test(content) ? `'${content}` : content;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function exportRecords(destinationParent: string): string {
  const root = path.resolve(destinationParent);
  const folder = path.join(root, `CarArchiver-CSV-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0,6)}`);
  fs.mkdirSync(folder);
  try {
    // Identifiers are fixed; never interpolate user-provided SQL identifiers.
    for (const table of ['Customers', 'Cars', 'Services'] as const) {
      const columns = (getDb().pragma(`table_info(${table})`) as Array<{name:string}>).map(col=>col.name);
      const rows = getDb().prepare(`SELECT * FROM ${table}`).all() as Record<string,unknown>[];
      const csv = [columns.map(cell).join(','), ...rows.map(row=>columns.map(col=>cell(row[col])).join(','))].join('\r\n');
      fs.writeFileSync(path.join(folder, `${table}.csv`), `\ufeff${csv}\r\n`, 'utf8');
    }
    fs.writeFileSync(path.join(folder, 'README.txt'), 'CarArchiver CSV export. Files may contain sensitive customer information. Store securely. Image files are not included; use Backup for complete transfer.\r\n');
    return folder;
  } catch (error) {
    fs.rmSync(folder, {recursive:true, force:true});
    throw error;
  }
}
