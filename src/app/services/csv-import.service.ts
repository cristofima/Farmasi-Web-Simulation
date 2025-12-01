import { Injectable } from '@angular/core';
import { TeamMemberModel } from '../models/team-member.model';

export interface CsvRow {
  consultantNo: string;
  firstName: string;
  lastName: string;
  personalPointsThisMonth: number;
  sponsorCode: string;
  generation: number;
  signUpDate: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedCount: number;
  rootMember?: string;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CsvImportService {

  /**
   * Parses a CSV file content and converts it to TeamMemberModel array
   * @param csvContent The raw CSV content as string
   * @returns ImportResult with the parsed team members
   */
  parseAndImport(csvContent: string): { result: ImportResult; teamMembers: TeamMemberModel[] } {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      importedCount: 0,
      errors: []
    };

    const teamMembers: TeamMemberModel[] = [];

    try {
      const rows = this.parseCsv(csvContent);
      result.totalRows = rows.length;

      if (rows.length === 0) {
        result.errors.push('El archivo CSV está vacío o no tiene formato válido');
        return { result, teamMembers };
      }

      // Validate required columns
      const requiredColumns = ['Consultant No', 'First Name', 'Last Name', 'Personal Points This Month', 'Sponsor Code', 'Generation'];
      const headers = Object.keys(rows[0]);
      const missingColumns = requiredColumns.filter(col => !headers.some(h => h.toLowerCase().trim() === col.toLowerCase()));

      if (missingColumns.length > 0) {
        result.errors.push(`Columnas faltantes: ${missingColumns.join(', ')}`);
        return { result, teamMembers };
      }

      // Convert CSV rows to CsvRow objects
      const csvRows: CsvRow[] = rows.map(row => this.mapRowToCsvRow(row));

      // Get all consultant IDs for reference
      const consultantIds = new Set(csvRows.map(r => r.consultantNo));

      // Find root member (Generation = 0 or sponsor not in list)
      const rootMember = csvRows.find(r =>
        r.generation === 0 ||
        !consultantIds.has(r.sponsorCode)
      );

      if (!rootMember) {
        result.errors.push('No se pudo determinar el miembro raíz (FI principal)');
        return { result, teamMembers };
      }

      result.rootMember = `${rootMember.firstName} ${rootMember.lastName}`;

      // Check if member is new (registered in the current month)
      const isNewMember = (signUpDate: string): boolean => {
        if (!signUpDate) return false;
        try {
          const date = new Date(signUpDate);
          const now = new Date();
          const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
          return monthsAgo <= 1; // Consider new if registered within last month
        } catch {
          return false;
        }
      };

      // Convert to TeamMemberModel array
      for (const csvRow of csvRows) {
        const isRoot = csvRow.consultantNo === rootMember.consultantNo;
        const teamMember: TeamMemberModel = {
          id: csvRow.consultantNo,
          name: `${csvRow.firstName} ${csvRow.lastName}`.trim(),
          personalVolume: csvRow.personalPointsThisMonth || 0,
          parentId: isRoot ? undefined : csvRow.sponsorCode,
          isNew: isNewMember(csvRow.signUpDate)
        };

        teamMembers.push(teamMember);
        result.importedCount++;
      }

      result.success = true;

    } catch (error) {
      result.errors.push(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    return { result, teamMembers };
  }

  /**
   * Parses CSV content into an array of objects
   * Handles multiline values (values containing newlines within quotes)
   */
  private parseCsv(csvContent: string): Record<string, string>[] {
    // First, normalize the CSV by handling multiline values
    const normalizedContent = this.normalizeMultilineCSV(csvContent);
    const lines = normalizedContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Handle both comma and semicolon separators
    const separator = lines[0].includes(';') ? ';' : ',';

    // Parse headers - handle quoted values
    const headers = this.parseCSVLine(lines[0], separator);

    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], separator);
      // Be more lenient - if we have at least the required columns, process the row
      if (values.length < 25) continue; // Skip if we don't have enough columns for required fields

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      result.push(row);
    }

    return result;
  }

  /**
   * Normalizes CSV content by merging multiline values into single lines
   * This handles cases where values contain newlines (common in address fields)
   */
  private normalizeMultilineCSV(content: string): string {
    const lines = content.split(/\r?\n/);
    const result: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (const line of lines) {
      if (currentLine === '') {
        currentLine = line;
      } else {
        // We're continuing a previous line (multiline value)
        currentLine += ' ' + line.trim();
      }

      // Count quotes to determine if we're inside a quoted value
      const quoteCount = (currentLine.match(/"/g) || []).length;
      inQuotes = quoteCount % 2 !== 0;

      if (!inQuotes) {
        // Line is complete, add it to result
        result.push(currentLine);
        currentLine = '';
      }
    }

    // Add any remaining content
    if (currentLine) {
      result.push(currentLine);
    }

    return result.join('\n');
  }

  /**
   * Parses a single CSV line handling quoted values
   */
  private parseCSVLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current); // Add last value
    return result;
  }

  /**
   * Maps a CSV row object to CsvRow interface
   */
  private mapRowToCsvRow(row: Record<string, string>): CsvRow {
    // Helper to find column value by partial name match
    const getValue = (partialName: string): string => {
      const key = Object.keys(row).find(k =>
        k.toLowerCase().includes(partialName.toLowerCase())
      );
      return key ? row[key] : '';
    };

    return {
      consultantNo: getValue('Consultant No') || getValue('consultant'),
      firstName: getValue('First Name'),
      lastName: getValue('Last Name'),
      personalPointsThisMonth: parseFloat(getValue('Personal Points This Month')) || 0,
      sponsorCode: getValue('Sponsor Code'),
      generation: parseInt(getValue('Generation')) || 0,
      signUpDate: getValue('Sign Up Date')
    };
  }

  /**
   * Validates if the file is a valid CSV
   */
  validateFile(file: File): string | null {
    if (!file) {
      return 'No se seleccionó ningún archivo';
    }

    const validExtensions = ['.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      return 'El archivo debe ser un CSV (.csv)';
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return 'El archivo no debe superar los 5MB';
    }

    return null;
  }
}
