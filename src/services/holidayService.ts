import { Connection } from 'jsforce';
import { parse } from 'csv-parse/sync';
import  XLSX from 'xlsx';

export class HolidayService {
  constructor(private conn: Connection) {}

  // Add holidays from array (admin only)
  async addHolidays(
    userEmail: string,
    holidays: Array<{ date: string; name: string; type: string; optional: boolean }>
  ): Promise<{ success: boolean; errors?: string[] }> {
    if (userEmail !== 'admin@winfomi.com') {
      return { success: false, errors: ['Only admin can add holidays.'] };
    }
    const errors: string[] = [];
    for (const h of holidays) {
      try {
        if (!h.date || !h.name || !h.type) {
          errors.push(`Missing fields for holiday: ${JSON.stringify(h)}`);
          continue;
        }
        await this.conn.sobject('Holiday__c').create({
          Date__c: h.date,
          Name: h.name,
          Type__c: h.type,
          Optional__c: h.optional || false,
        });
      } catch (err: any) {
        errors.push(`Failed to add ${h.name}: ${err.message}`);
      }
    }
    return { success: errors.length === 0, errors: errors.length ? errors : undefined };
  }

  // Parse CSV file buffer to holidays array
  parseCsv(buffer: Buffer): Array<{ date: string; name: string; type: string; optional: boolean }> {
    const records = parse(buffer, { columns: true, skip_empty_lines: true });
    return records.map((r: any) => ({
      date: r.Date || r.date,
      name: r.Name || r.name,
      type: r.Type || r.type,
      optional: r.Optional === 'true' || r.optional === 'true' || false,
    }));
  }

  // Parse Excel file buffer to holidays array
  parseExcel(buffer: Buffer): Array<{ date: string; name: string; type: string; optional: boolean }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const records = XLSX.utils.sheet_to_json(sheet);
    return (records as any[]).map((r: any) => ({
      date: r.Date || r.date,
      name: r.Name || r.name,
      type: r.Type || r.type,
      optional: r.Optional === 'true' || r.optional === 'true' || false,
    }));
  }

  // Retrieve holidays (optionally filter by year/month)
  async getHolidays(year?: number, month?: number) {
    let soql = 'SELECT Id, Date__c, Name, Type__c, Optional__c FROM Holiday__c';
    const filters: string[] = [];
    if (year) filters.push(`CALENDAR_YEAR(Date__c) = ${year}`);
    if (month) filters.push(`CALENDAR_MONTH(Date__c) = ${month}`);
    if (filters.length) soql += ' WHERE ' + filters.join(' AND ');
    soql += ' ORDER BY Date__c ASC';
    const result = await this.conn.query(soql);
    return result.records;
  }
}
