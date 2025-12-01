import { Component, EventEmitter, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CsvImportService, ImportResult } from 'src/app/services/csv-import.service';
import { TeamMemberService } from 'src/app/services/team-member.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CsvImportComponent {

  @Output() importCompleted = new EventEmitter<void>();

  visible = false;
  loading = false;
  selectedFile: File | null = null;
  importResult: ImportResult | null = null;

  constructor(
    private csvImportService: CsvImportService,
    private teamMemberService: TeamMemberService,
    private settingsService: SettingsService,
    private messageService: MessageService
  ) { }

  showDialog() {
    this.visible = true;
    this.selectedFile = null;
    this.importResult = null;
    this.loading = false;
  }

  hideDialog() {
    this.visible = false;
    this.selectedFile = null;
    this.importResult = null;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validationError = this.csvImportService.validateFile(file);

      if (validationError) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: validationError
        });
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.importResult = null;
    }
  }

  async importCsv() {
    if (!this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un archivo CSV'
      });
      return;
    }

    this.loading = true;

    try {
      const content = await this.readFileContent(this.selectedFile);
      const { result, teamMembers } = this.csvImportService.parseAndImport(content);

      this.importResult = result;

      if (result.success && teamMembers.length > 0) {
        // Clear current storage and save new team members
        this.teamMemberService.setStorageKey('teamMembers');
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));

        // Update settings with root member's data
        const rootMember = teamMembers.find(m => !m.parentId);
        if (rootMember) {
          const settings = this.settingsService.getSettings();
          settings.name = rootMember.name;
          settings.personalVolume = rootMember.personalVolume;
          this.settingsService.saveSettings(settings);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Importación exitosa',
          detail: `Se importaron ${result.importedCount} miembros. FI Principal: ${result.rootMember}`
        });

        this.importCompleted.emit();
        this.hideDialog();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error en la importación',
          detail: result.errors.join('. ')
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo leer el archivo'
      });
    } finally {
      this.loading = false;
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  getExpectedColumns(): string[] {
    return [
      'Consultant No',
      'First Name',
      'Last Name',
      'Personal Points This Month',
      'Sponsor Code',
      'Generation'
    ];
  }
}
