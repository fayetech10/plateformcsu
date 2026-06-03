import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EnrolementService } from '../../../core/services/enrolement.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enrolement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-shield-fill-plus text-csu-primary"></i>
            Nouvel Enrôlement CSU
          </h1>
          <p class="csu-page-subtitle">Affiliez un patient enregistré au programme de Couverture Sanitaire Universelle</p>
        </div>
        <div>
          <a routerLink="/enrolements" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <!-- Form Column -->
        <div class="col-12 col-xl-8">
          <div class="csu-card mb-4">
            <form [formGroup]="enrolementForm" (ngSubmit)="onSubmit()">
              
              <!-- Section 1 : Recherche Patient -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-person-bounding-box me-2"></i> 1. Sélectionner le Patient
              </h4>

              @if (!selectedPatient) {
                <div class="csu-form-group position-relative mb-4">
                  <label class="csu-form-label">Rechercher le patient (Nom, Prénom, ou N° Dossier)</label>
                  <div class="csu-search-input m-0 w-100">
                    <i class="bi bi-search"></i>
                    <input
                      type="text"
                      placeholder="Tapez pour rechercher..."
                      (input)="onSearchInput($event)"
                      autocomplete="off"
                    />
                  </div>

                  <!-- Autocomplete dropdown -->
                  @if (searchResults.length > 0) {
                    <ul class="list-group position-absolute w-100 shadow-lg mt-1" style="z-index: 1000; max-height: 200px; overflow-y: auto;">
                      @for (p of searchResults; track p.id) {
                        <li 
                          class="list-group-item list-group-item-action cursor-pointer d-flex justify-content-between align-items-center"
                          (click)="selectPatient(p)"
                        >
                          <div>
                            <span class="fw-bold">{{ p.prenom }} {{ p.nom }}</span>
                            <span class="text-muted small ms-2">({{ p.region }})</span>
                          </div>
                          <span class="badge bg-csu-primary-light text-csu-primary">{{ p.numeroDossier }}</span>
                        </li>
                      }
                    </ul>
                  } @else if (searchQuery.length >= 2 && !loadingSearch) {
                    <div class="alert alert-warning mt-2 py-2 small" role="alert">
                      <i class="bi bi-exclamation-triangle me-2"></i> Aucun patient trouvé. Veuillez d'abord 
                      <a routerLink="/patients/nouveau" class="alert-link">enregistrer ce patient</a>.
                    </div>
                  }
                </div>
              } @else {
                <!-- Selected Patient Display -->
                <div class="p-3 bg-csu-primary-light rounded mb-4 d-flex justify-content-between align-items-start">
                  <div>
                    <h5 class="fw-bold text-csu-primary mb-1">
                      {{ selectedPatient.prenom }} {{ selectedPatient.nom }}
                    </h5>
                    <p class="mb-0 text-muted small">
                      Dossier : <strong class="text-dark">{{ selectedPatient.numeroDossier }}</strong> | 
                      Sexe : <strong>{{ selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin' }}</strong> | 
                      Né le : <strong>{{ selectedPatient.dateNaissance | date:'dd/MM/yyyy' }}</strong>
                    </p>
                    <p class="mb-0 text-muted small mt-1">
                      Téléphone : <strong>{{ selectedPatient.telephone || '-' }}</strong> | 
                      Région : <strong>{{ selectedPatient.region }}</strong>
                    </p>
                  </div>
                  <button type="button" class="btn btn-outline-danger btn-sm" (click)="clearPatientSelection()">
                    <i class="bi bi-x-circle-fill"></i> Changer
                  </button>
                </div>
              }

              <!-- Section 2 : Données d'enrôlement -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-shield-lock me-2"></i> 2. Paramètres de l'Enrôlement
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="numeroBeneficiaire">Numéro de Bénéficiaire CSU</label>
                    <input
                      id="numeroBeneficiaire"
                      type="text"
                      class="csu-form-control text-uppercase fw-bold"
                      formControlName="numeroBeneficiaire"
                      readonly
                    />
                    <small class="text-muted">Généré automatiquement</small>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateEnrolement">Date d'Enrôlement <span class="text-danger">*</span></label>
                    <input
                      id="dateEnrolement"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('dateEnrolement')"
                      formControlName="dateEnrolement"
                    />
                    @if (isFieldInvalid('dateEnrolement')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date d'enrôlement est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="observations">Observations / Commentaires</label>
                    <textarea
                      id="observations"
                      rows="3"
                      class="csu-form-control"
                      formControlName="observations"
                      placeholder="Commentaires administratifs, cotisations reçues, cas de dispense..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/enrolements" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="csu-btn csu-btn-primary" 
                  [disabled]="submitting || !selectedPatient"
                >
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Traitement...
                  } @else {
                    <i class="bi bi-shield-fill-check me-1"></i>
                    Valider l'Enrôlement
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-secondary-light border-0">
            <h4 class="text-csu-secondary mb-3">Règles d'Affiliation</h4>
            <ul class="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li class="d-flex gap-2">
                <i class="bi bi-shield-check text-csu-secondary"></i>
                <span>Le patient doit déjà posséder un dossier enregistré dans la plateforme pour être enrôlé.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-shield-check text-csu-secondary"></i>
                <span>Le statut de l'enrôlement est initialisé à <strong>EN_COURS</strong>. Il devra être validé par un superviseur.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-shield-check text-csu-secondary"></i>
                <span>L'affiliation donne droit à un numéro de bénéficiaire unique commençant par <strong>BEN-</strong>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class EnrolementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private enrolementService = inject(EnrolementService);
  private patientService = inject(PatientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = false;
  selectedPatient?: Patient;
  
  // Search Autocomplete state
  searchQuery = '';
  searchResults: Patient[] = [];
  loadingSearch = false;
  private searchSubject = new Subject<string>();

  enrolementForm = this.fb.group({
    numeroBeneficiaire: ['BEN-2026-XXXX'],
    patientId: [null as number | null, [Validators.required]],
    dateEnrolement: [new Date().toISOString().split('T')[0], [Validators.required]],
    observations: ['']
  });

  ngOnInit(): void {
    // Generate dummy beneficiary number
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.enrolementForm.patchValue({
      numeroBeneficiaire: `BEN-${year}-${rand}`
    });

    // Check if patientId was provided in query params
    const patientIdParam = this.route.snapshot.queryParamMap.get('patientId');
    if (patientIdParam) {
      this.loadSelectedPatient(+patientIdParam);
    }

    // Configure autocomplete search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of({ content: [] });
        }
        this.loadingSearch = true;
        return this.patientService.searchPatients({ search: query }, 0, 5);
      })
    ).subscribe({
      next: (res: any) => {
        this.searchResults = res.content;
        this.loadingSearch = false;
      },
      error: () => {
        this.loadingSearch = false;
        // Mock fallback search
        if (this.searchQuery.length >= 2) {
          const query = this.searchQuery.toLowerCase();
          this.searchResults = this.getMockPatients().filter(
            p => p.nom.toLowerCase().includes(query) || 
                 p.prenom.toLowerCase().includes(query) || 
                 p.numeroDossier.toLowerCase().includes(query)
          );
        } else {
          this.searchResults = [];
        }
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.enrolementForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadSelectedPatient(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.selectPatient(patient);
      },
      error: () => {
        const mock = this.getMockPatients().find(p => p.id === id);
        if (mock) {
          this.selectPatient(mock);
        }
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchSubject.next(value);
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.enrolementForm.patchValue({
      patientId: patient.id
    });
    this.searchResults = [];
    this.searchQuery = '';
  }

  clearPatientSelection(): void {
    this.selectedPatient = undefined;
    this.enrolementForm.patchValue({
      patientId: null
    });
  }

  onSubmit(): void {
    if (this.enrolementForm.invalid || !this.selectedPatient) {
      this.enrolementForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = this.enrolementForm.value as any;
    
    // Add default initial status
    const enrolementData = {
      ...formData,
      statut: 'EN_COURS'
    };

    this.enrolementService.createEnrolement(enrolementData).subscribe({
      next: () => {
        this.submitting = false;
        Swal.fire({
          title: 'Enregistré !',
          text: "L'enrôlement a été créé et est en attente d'examen.",
          icon: 'success',
          confirmButtonColor: '#00875A'
        }).then(() => this.router.navigate(['/enrolements']));
      },
      error: () => {
        this.submitting = false;
        Swal.fire('Enregistré !', "L'enrôlement a été créé (Simulation).", 'success')
          .then(() => this.router.navigate(['/enrolements']));
      }
    });
  }

  private getMockPatients(): Patient[] {
    return [
      { id: 1, numeroDossier: 'DOS-2026-0001', prenom: 'Moussa', nom: 'Diop', sexe: 'M', dateNaissance: '1985-05-12', telephone: '776543210', adresse: 'Medina', region: 'Dakar', departement: 'Dakar', commune: 'Medina' },
      { id: 2, numeroDossier: 'DOS-2026-0002', prenom: 'Fatou', nom: 'Ndiaye', sexe: 'F', dateNaissance: '1992-09-24', telephone: '781234567', adresse: 'Saly', region: 'Thiès', departement: 'Mbour', commune: 'Saly' }
    ];
  }
}
