import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { RapportService } from '../../core/services/rapport.service';
import { BureauService } from '../../core/services/bureau.service';
import { AuthService } from '../../core/services/auth.service';
import { BureauCsu } from '../../core/models/bureau.model';
import { RapportSummary } from '../../core/models/rapport-summary.model';
import { RapportSummaryViewComponent } from './rapport-summary-view.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RapportSummaryViewComponent],
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
              <!-- Raccourcis de période -->
              <div class="preset-row mb-3">
                <button type="button" class="preset" [class.active]="activePreset === 'today'" (click)="setPreset('today')">Aujourd'hui</button>
                <button type="button" class="preset" [class.active]="activePreset === '7d'" (click)="setPreset('7d')">7 jours</button>
                <button type="button" class="preset" [class.active]="activePreset === 'month'" (click)="setPreset('month')">Ce mois</button>
                <button type="button" class="preset" [class.active]="activePreset === '30d'" (click)="setPreset('30d')">30 jours</button>
                <button type="button" class="preset" [class.active]="activePreset === 'quarter'" (click)="setPreset('quarter')">Trimestre</button>
                <button type="button" class="preset" [class.active]="activePreset === 'year'" (click)="setPreset('year')">Année</button>
              </div>

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

                <!-- Only My Data (Toggle for Agents/All users) -->
                <div class="col-12 mt-2">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="onlyMyData"
                      formControlName="onlyMyData"
                    >
                    <label class="form-check-label text-secondary small" for="onlyMyData">
                      N'exporter que mes saisies (données associées à mon compte agent)
                    </label>
                  </div>
                </div>
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

      <!-- Aperçu de la synthèse (période sélectionnée) -->
      <div class="csu-card mt-4">
        <div class="csu-card-header">
          <h3 class="csu-card-title">
            <i class="bi bi-clipboard-data text-csu-primary"></i>
            Aperçu de la synthèse
            @if (summary) { <span class="period-tag">{{ summary.bureauNom }} · {{ rapportForm.value.startDate }} → {{ rapportForm.value.endDate }}</span> }
          </h3>
          <button type="button" class="csu-btn csu-btn-light btn-sm" (click)="loadSummary()" [disabled]="loadingSummary">
            <i class="bi bi-arrow-clockwise" [class.spin]="loadingSummary"></i> Actualiser
          </button>
        </div>
        <app-rapport-summary-view [summary]="summary" [loading]="loadingSummary"></app-rapport-summary-view>
      </div>
    </div>
  `,
  styles: [`
    .preset-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .preset { background: #fff; border: 1px solid var(--csu-border-light, rgba(0,0,0,0.1)); color: var(--csu-text-muted);
      font-size: 0.78rem; font-weight: 600; padding: 5px 12px; border-radius: 20px; cursor: pointer; transition: all 0.15s ease; }
    .preset:hover { border-color: var(--csu-primary); color: var(--csu-primary); }
    .preset.active { background: var(--csu-primary); border-color: var(--csu-primary); color: #fff; }
    .period-tag { font-size: 0.7rem; font-weight: 600; color: var(--csu-text-muted); background: var(--csu-bg, #f1f5f9); padding: 2px 9px; border-radius: 12px; margin-left: 8px; }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
    .spin { display: inline-block; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
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
    structureId: [''],
    onlyMyData: [false]
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
      error: (err) => {
        console.error('Erreur lors du chargement des bureaux:', err);
        this.bureaux = [];
      }
    });
  }

  loadStructures(): void {
    // TODO: Replace with real API call when structure service is available
    this.structures = [];
  }

  exportPdf(): void {
    if (this.rapportForm.invalid) return;
    this.exportingPdf = true;

    const { startDate, endDate, bureauCsuId, structureId, onlyMyData } = this.rapportForm.value;
    
    let actualBureauId = bureauCsuId ? Number(bureauCsuId) : undefined;
    if (this.authService.isAgent()) {
      actualBureauId = this.authService.currentUserValue?.bureau_id;
    }
    
    let actualAgentId = onlyMyData ? this.authService.currentUserValue?.agent_id : undefined;

    this.rapportService.downloadPdf(
      startDate!, 
      endDate!, 
      actualBureauId, 
      structureId ? Number(structureId) : undefined,
      actualAgentId
    ).subscribe({
      next: () => {
        this.exportingPdf = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Rapport PDF téléchargé avec succès',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        this.exportingPdf = false;
        console.error('Erreur exportation PDF:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la génération du rapport PDF.'
        });
      }
    });
  }

  exportExcel(): void {
    if (this.rapportForm.invalid) return;
    this.exportingExcel = true;

    const { startDate, endDate, bureauCsuId, structureId, onlyMyData } = this.rapportForm.value;

    let actualBureauId = bureauCsuId ? Number(bureauCsuId) : undefined;
    if (this.authService.isAgent()) {
      actualBureauId = this.authService.currentUserValue?.bureau_id;
    }

    let actualAgentId = onlyMyData ? this.authService.currentUserValue?.agent_id : undefined;

    this.rapportService.downloadExcel(
      startDate!, 
      endDate!, 
      actualBureauId, 
      structureId ? Number(structureId) : undefined,
      actualAgentId
    ).subscribe({
      next: () => {
        this.exportingExcel = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Rapport Excel téléchargé avec succès',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: (err) => {
        this.exportingExcel = false;
        console.error('Erreur exportation Excel:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la génération du rapport Excel.'
        });
      }
    });
  }
}

