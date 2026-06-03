import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RapportService } from '../../core/services/rapport.service';
import { BureauService } from '../../core/services/bureau.service';
import { AuthService } from '../../core/services/auth.service';
import { BureauCsu } from '../../core/models/bureau.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-file-earmark-bar-graph-fill text-csu-primary"></i>
            Génération des Rapports
          </h1>
          <p class="csu-page-subtitle">Exportez les indicateurs opérationnels clés au format PDF ou Excel</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Configuration Card -->
        <div class="col-12 col-lg-7">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <i class="bi bi-gear-fill text-csu-primary"></i>
                Paramètres d'exportation
              </h3>
            </div>

            <form [formGroup]="rapportForm" (ngSubmit)="$event.preventDefault()">
              <div class="row g-3 mb-4">
                
                <!-- Start Date -->
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="startDate">Date de Début <span class="text-danger">*</span></label>
                    <input
                      id="startDate"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('startDate')"
                      formControlName="startDate"
                    />
                    @if (isFieldInvalid('startDate')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date de début est requise
                      </div>
                    }
                  </div>
                </div>

                <!-- End Date -->
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="endDate">Date de Fin <span class="text-danger">*</span></label>
                    <input
                      id="endDate"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('endDate')"
                      formControlName="endDate"
                    />
                    @if (isFieldInvalid('endDate')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date de fin est requise
                      </div>
                    }
                  </div>
                </div>

                <!-- Bureau CSU (Visible only for admin/supervisor) -->
                @if (canFilterByBureau) {
                  <div class="col-12 col-md-6">
                    <div class="csu-form-group">
                      <label class="csu-form-label" for="bureauCsuId">Filtrer par Bureau CSU</label>
                      <select
                        id="bureauCsuId"
                        class="csu-form-control csu-form-select"
                        formControlName="bureauCsuId"
                      >
                        <option value="">Tous les bureaux (Global)</option>
                        @for (b of bureaux; track b.id) {
                          <option [value]="b.id">{{ b.nom }} ({{ b.commune }})</option>
                        }
                      </select>
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="csu-form-group">
                      <label class="csu-form-label" for="structureId">Filtrer par Structure</label>
                      <select
                        id="structureId"
                        class="csu-form-control csu-form-select"
                        formControlName="structureId"
                      >
                        <option value="">Toutes les structures</option>
                        @for (s of structures; track s.id) {
                          <option [value]="s.id">{{ s.nom }}</option>
                        }
                      </select>
                    </div>
                  </div>
                }
              </div>

              <!-- Export Buttons -->
              <div class="d-flex flex-wrap gap-3 border-top pt-4">
                <button 
                  type="button" 
                  class="csu-btn csu-btn-danger d-flex align-items-center gap-2"
                  [disabled]="exportingPdf || rapportForm.invalid"
                  (click)="exportPdf()"
                >
                  @if (exportingPdf) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Génération PDF...
                  } @else {
                    <i class="bi bi-file-earmark-pdf-fill"></i>
                    Exporter en PDF
                  }
                </button>

                <button 
                  type="button" 
                  class="csu-btn csu-btn-primary d-flex align-items-center gap-2"
                  [disabled]="exportingExcel || rapportForm.invalid"
                  (click)="exportExcel()"
                >
                  @if (exportingExcel) {
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                    Génération Excel...
                  } @else {
                    <i class="bi bi-file-earmark-excel-fill"></i>
                    Exporter en Excel
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <!-- Documentation Card -->
        <div class="col-12 col-lg-5">
          <div class="csu-card bg-csu-primary-light border-0 h-100">
            <h4 class="text-csu-primary mb-3">Contenu des rapports</h4>
            <p class="small text-secondary mb-3">
              Le document généré compile l'ensemble des indicateurs de la Couverture Sanitaire Universelle (CSU) sur la période choisie :
            </p>
            <ul class="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li class="d-flex gap-2">
                <i class="bi bi-check-square-fill text-csu-primary"></i>
                <span>Nombre de dossiers patients créés.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-check-square-fill text-csu-primary"></i>
                <span>Nombre de bénéficiaires enrôlés (par statut).</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-check-square-fill text-csu-primary"></i>
                <span>Activités et sensibilisations menées sur le terrain.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-check-square-fill text-csu-primary"></i>
                <span>Incidents signalés et taux de résolution.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RapportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rapportService = inject(RapportService);
  private bureauService = inject(BureauService);
  private authService = inject(AuthService);

  bureaux: BureauCsu[] = [];
  structures: any[] = [];
  exportingPdf = false;
  exportingExcel = false;

  rapportForm = this.fb.group({
    startDate: [this.getDefaultStartDate(), [Validators.required]],
    endDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    bureauCsuId: [''],
    structureId: ['']
  });

  ngOnInit(): void {
    if (this.canFilterByBureau) {
      this.loadBureaux();
      this.loadStructures();
    }
  }

  get canFilterByBureau(): boolean {
    return this.authService.isAdmin() || this.authService.isSuperviseur();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.rapportForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // Default to first day of current month
    return date.toISOString().split('T')[0];
  }

  loadBureaux(): void {
    this.bureauService.getAllBureaux(true).subscribe({
      next: (data) => {
        this.bureaux = data;
      },
      error: () => {
        // Mock fallback
        this.bureaux = [
          { id: 1, nom: 'Dakar Centre', code: 'DKR-01', region: 'Dakar', departement: 'Dakar', commune: 'Medina', adresse: '', telephone: '', actif: true },
          { id: 2, nom: 'Mbour Littoral', code: 'MBR-02', region: 'Thiès', departement: 'Mbour', commune: 'Saly', adresse: '', telephone: '', actif: true },
          { id: 3, nom: 'Mbacké Baol', code: 'MBK-03', region: 'Diourbel', departement: 'Mbacké', commune: 'Mbacké', adresse: '', telephone: '', actif: true }
        ];
      }
    });
  }

  loadStructures(): void {
    // Mock data for structures
    this.structures = [
      { id: 10, nom: 'Structure de Santé Alpha' },
      { id: 11, nom: 'Hôpital Général Beta' },
      { id: 12, nom: 'Clinique Gamma' }
    ];
  }

  exportPdf(): void {
    if (this.rapportForm.invalid) return;
    this.exportingPdf = true;

    // Simulate network delay
    setTimeout(() => {
      this.exportingPdf = false;
      const { startDate, endDate } = this.rapportForm.value;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Rapport CSU - ${startDate} au ${endDate}</title>
              <style>
                body { font-family: 'Arial', sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f4f4f4; color: #00875A; }
                h1 { color: #00875A; }
              </style>
            </head>
            <body>
              <h1>Rapport des Opérations CSU</h1>
              <p><strong>Période :</strong> ${startDate} au ${endDate}</p>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bureau CSU</th>
                    <th>Nouveaux Patients</th>
                    <th>Bénéficiaires Enrôlés</th>
                    <th>Activités</th>
                    <th>Constats</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>${startDate}</td><td>Dakar Centre</td><td>12</td><td>8</td><td>2</td><td>0</td></tr>
                  <tr><td>${startDate}</td><td>Mbour Littoral</td><td>5</td><td>3</td><td>1</td><td>1</td></tr>
                  <tr><td>${endDate}</td><td>Mbacké Baol</td><td>20</td><td>15</td><td>4</td><td>0</td></tr>
                  <tr><td>${endDate}</td><td>Dakar Centre</td><td>8</td><td>6</td><td>1</td><td>0</td></tr>
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }, 800);
  }

  exportExcel(): void {
    if (this.rapportForm.invalid) return;
    this.exportingExcel = true;

    // Simulate network delay
    setTimeout(() => {
      this.exportingExcel = false;
      const { startDate, endDate } = this.rapportForm.value;

      const csvContent = "Date,Bureau CSU,Nouveaux Patients,Beneficiaires Enroles,Activites Realisees,Constats Signales\n"
        + `${startDate},Dakar Centre,12,8,2,0\n`
        + `${startDate},Mbour Littoral,5,3,1,1\n`
        + `${endDate},Mbacké Baol,20,15,4,0\n`
        + `${endDate},Dakar Centre,8,6,1,0\n`;

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `rapport_csu_${startDate}_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Fichier Excel (CSV) téléchargé',
        showConfirmButton: false,
        timer: 3000
      });
    }, 800);
  }
}
