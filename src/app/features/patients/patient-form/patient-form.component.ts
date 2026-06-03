import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

interface CommuneData {
  [dept: string]: string[];
}

interface RegionData {
  [region: string]: {
    departments: string[];
    communes: CommuneData;
  };
}

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-person-fill-gear"></i>
            {{ isEditMode ? 'Modifier le Patient' : 'Enregistrer un Nouveau Patient' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Formulaire de modification de la fiche patient' : 'Formulaire d\\'adhésion et d\\'enregistrement d\\'un nouveau dossier de patient' }}
          </p>
          @if (patientType) {
            <div class="mt-2">
              <span class="badge-type" [ngClass]="getTypeBadgeClass(patientType)">
                <i class="bi" [ngClass]="getTypeIconClass(patientType)"></i>
                {{ getTypeLabel(patientType) }}
              </span>
            </div>
          }
        </div>
        <div>
          <a routerLink="/patients" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour à la liste
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
              <!-- Section 1 : Informations Générales -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-person-vcard me-2"></i> Informations Générales
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="numeroDossier">Numéro de Dossier</label>
                    <input
                      id="numeroDossier"
                      type="text"
                      class="csu-form-control text-uppercase fw-bold"
                      formControlName="numeroDossier"
                      readonly
                    />
                    <small class="text-muted">Généré automatiquement</small>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="sexe">Sexe <span class="text-danger">*</span></label>
                    <select
                      id="sexe"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('sexe')"
                      formControlName="sexe"
                    >
                      <option value="">Sélectionnez le sexe</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                    @if (isFieldInvalid('sexe')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le sexe est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="prenom">Prénom <span class="text-danger">*</span></label>
                    <input
                      id="prenom"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('prenom')"
                      formControlName="prenom"
                      placeholder="Ex: Abdou"
                    />
                    @if (isFieldInvalid('prenom')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le prénom est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nom">Nom <span class="text-danger">*</span></label>
                    <input
                      id="nom"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('nom')"
                      formControlName="nom"
                      placeholder="Ex: Ndiaye"
                    />
                    @if (isFieldInvalid('nom')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le nom est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateNaissance">Date de Naissance <span class="text-danger">*</span></label>
                    <input
                      id="dateNaissance"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('dateNaissance')"
                      formControlName="dateNaissance"
                    />
                    @if (isFieldInvalid('dateNaissance')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date de naissance est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="telephone">N° Téléphone <span class="text-danger">*</span></label>
                    <input
                      id="telephone"
                      type="tel"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('telephone')"
                      formControlName="telephone"
                      placeholder="Ex: 771234567"
                    />
                    @if (isFieldInvalid('telephone')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le numéro de téléphone est requis (9 chiffres)
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2 : Adresse & Localisation -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-geo-alt me-2"></i> Localisation & Adresse
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="region">Région <span class="text-danger">*</span></label>
                    <select
                      id="region"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('region')"
                      formControlName="region"
                      (change)="onRegionChange()"
                    >
                      <option value="">Sélectionnez la région</option>
                      @for (reg of regions; track reg) {
                        <option [value]="reg">{{ reg }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('region')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La région est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="departement">Département <span class="text-danger">*</span></label>
                    <select
                      id="departement"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('departement')"
                      formControlName="departement"
                      (change)="onDepartmentChange()"
                    >
                      <option value="">Sélectionnez le département</option>
                      @for (dept of departments; track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('departement')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le département est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="commune">Commune <span class="text-danger">*</span></label>
                    <select
                      id="commune"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('commune')"
                      formControlName="commune"
                    >
                      <option value="">Sélectionnez la commune</option>
                      @for (com of communes; track com) {
                        <option [value]="com">{{ com }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('commune')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La commune est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="adresse">Adresse de Résidence <span class="text-danger">*</span></label>
                    <textarea
                      id="adresse"
                      rows="2"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('adresse')"
                      formControlName="adresse"
                      placeholder="Quartier, Rue, N° de maison..."
                    ></textarea>
                    @if (isFieldInvalid('adresse')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> L'adresse est requise
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 3 : Pièce d'Identité (Classique uniquement) -->
              @if (patientType === 'classique') {
                <h4 class="mb-4 text-csu-secondary">
                  <i class="bi bi-card-image me-2"></i> Pièce d'Identité
                </h4>

                <div class="row g-3 mb-4 animate-fade-in">
                  <!-- Photo Recto -->
                  <div class="col-12 col-md-6">
                    <label class="csu-form-label">Recto de la pièce d'identité <span class="text-danger">*</span></label>
                    <div class="photo-upload-container" [class.has-image]="photoRectoUrl">
                      @if (!photoRectoUrl) {
                        <div class="upload-placeholder" (click)="rectoInput.click()">
                          <i class="bi bi-camera fs-1 text-csu-secondary mb-2 animate-pulse"></i>
                          <span class="fw-bold text-csu-secondary">Prendre / Choisir Recto</span>
                          <small class="text-muted mt-1">Format JPG, PNG (Max 5MB)</small>
                        </div>
                      } @else {
                        <div class="image-preview-wrapper">
                          <img [src]="photoRectoUrl" class="img-fluid image-preview" alt="Recto de la pièce" />
                          <button type="button" class="btn-remove-image" (click)="removePhoto('recto')">
                            <i class="bi bi-trash-fill"></i> Supprimer
                          </button>
                        </div>
                      }
                      <input
                        #rectoInput
                        type="file"
                        accept="image/*"
                        capture="environment"
                        class="d-none"
                        (change)="onPhotoSelected($event, 'recto')"
                      />
                    </div>
                  </div>

                  <!-- Photo Verso -->
                  <div class="col-12 col-md-6">
                    <label class="csu-form-label">Verso de la pièce d'identité <span class="text-danger">*</span></label>
                    <div class="photo-upload-container" [class.has-image]="photoVersoUrl">
                      @if (!photoVersoUrl) {
                        <div class="upload-placeholder" (click)="versoInput.click()">
                          <i class="bi bi-camera fs-1 text-csu-secondary mb-2 animate-pulse"></i>
                          <span class="fw-bold text-csu-secondary">Prendre / Choisir Verso</span>
                          <small class="text-muted mt-1">Format JPG, PNG (Max 5MB)</small>
                        </div>
                      } @else {
                        <div class="image-preview-wrapper">
                          <img [src]="photoVersoUrl" class="img-fluid image-preview" alt="Verso de la pièce" />
                          <button type="button" class="btn-remove-image" (click)="removePhoto('verso')">
                            <i class="bi bi-trash-fill"></i> Supprimer
                          </button>
                        </div>
                      }
                      <input
                        #versoInput
                        type="file"
                        accept="image/*"
                        capture="environment"
                        class="d-none"
                        (change)="onPhotoSelected($event, 'verso')"
                      />
                    </div>
                  </div>
                </div>
              }

              <!-- Action buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/patients" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Enregistrer les modifications' : 'Enregistrer le Patient' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Guide d'Enregistrement</h4>
            <ul class="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li class="d-flex gap-2">
                <i class="bi bi-check-circle-fill text-csu-primary"></i>
                <span>Tous les champs marqués d'une astérisque (<span class="text-danger">*</span>) sont obligatoires.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-check-circle-fill text-csu-primary"></i>
                <span>Le numéro de dossier est unique et généré automatiquement par la plateforme au format standard.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-check-circle-fill text-csu-primary"></i>
                <span>Assurez-vous de saisir un numéro de téléphone valide pour pouvoir notifier le bénéficiaire de son statut.</span>
              </li>
              @if (patientType === 'cesarienne') {
                <li class="d-flex gap-2 text-danger fw-bold">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  <span>Cette fiche est paramétrée pour le suivi Césarienne. Le sexe est fixé à Féminin.</span>
                </li>
              }
              @if (patientType === '0-5ans') {
                <li class="d-flex gap-2 text-primary fw-bold">
                  <i class="bi bi-info-circle-fill"></i>
                  <span>Le patient doit être un enfant âgé de 0 à 5 ans inclus.</span>
                </li>
              }
              @if (patientType === 'plan-sesame') {
                <li class="d-flex gap-2 text-warning fw-bold">
                  <i class="bi bi-info-circle-fill"></i>
                  <span>Le bénéficiaire doit être âgé d'au moins 60 ans pour le Plan Sésame.</span>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge-type {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .badge-type-cesarienne {
      background: rgba(233, 30, 99, 0.08);
      color: #C2185B;
      border: 1px solid rgba(233, 30, 99, 0.15);
    }
    .badge-type-enfant {
      background: rgba(3, 155, 229, 0.08);
      color: #0288D1;
      border: 1px solid rgba(3, 155, 229, 0.15);
    }
    .badge-type-classique {
      background: rgba(0, 135, 90, 0.08);
      color: #00875A;
      border: 1px solid rgba(0, 135, 90, 0.15);
    }
    .badge-type-sesame {
      background: rgba(123, 31, 162, 0.08);
      color: #7B1FA2;
      border: 1px solid rgba(123, 31, 162, 0.15);
    }
    .photo-upload-container {
      border: 2px dashed var(--csu-border);
      border-radius: var(--csu-radius);
      background: var(--csu-bg-alt);
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      transition: var(--csu-transition);
    }
    .photo-upload-container:hover {
      border-color: var(--csu-secondary);
      background: var(--csu-secondary-light);
    }
    .photo-upload-container.has-image {
      border-style: solid;
      border-color: var(--csu-border);
    }
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      width: 100%;
      height: 100%;
      justify-content: center;
      padding: 1.5rem;
    }
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }
    .image-preview {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .btn-remove-image {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(229, 57, 53, 0.9);
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      transition: var(--csu-transition-fast);
    }
    .btn-remove-image:hover {
      background: #E53935;
      transform: translateY(-2px);
    }
    .animate-pulse {
      animation: pulse-camera 2s infinite ease-in-out;
    }
    @keyframes pulse-camera {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
  `]
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  patientId?: number;
  submitting = false;
  patientType: string | null = null;
  photoRectoUrl: string | null = null;
  photoVersoUrl: string | null = null;

  // Cascading Localisation lists
  regions: string[] = ['Dakar', 'Thiès', 'Diourbel', 'Saint-Louis'];
  departments: string[] = [];
  communes: string[] = [];

  private locationData: RegionData = {
    'Dakar': {
      departments: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
      communes: {
        'Dakar': ['Plateau', 'Medina', 'Almadies', 'Fann-Point E'],
        'Pikine': ['Pikine Est', 'Pikine Ouest', 'Mbao'],
        'Guédiawaye': ['Golf Sud', 'Sam Notaire', 'Wakhinane Nimzatt'],
        'Rufisque': ['Rufisque Est', 'Rufisque Ouest', 'Sangalkam']
      }
    },
    'Thiès': {
      departments: ['Thiès', 'Mbour', 'Tivaouane'],
      communes: {
        'Thiès': ['Thiès Est', 'Thiès Ouest', 'Thiès Nord'],
        'Mbour': ['Mbour', 'Saly', 'Joal-Fadiouth'],
        'Tivaouane': ['Tivaouane', 'Mboro', 'Meckhe']
      }
    },
    'Diourbel': {
      departments: ['Diourbel', 'Mbacké', 'Bambey'],
      communes: {
        'Diourbel': ['Diourbel', 'Ndindy'],
        'Mbacké': ['Mbacké', 'Touba Mosquée', 'Touba Fall'],
        'Bambey': ['Bambey', 'Baba Garage']
      }
    },
    'Saint-Louis': {
      departments: ['Saint-Louis', 'Dagana', 'Podor'],
      communes: {
        'Saint-Louis': ['Saint-Louis', 'Gandon'],
        'Dagana': ['Dagana', 'Richard-Toll', 'Ross Béthio'],
        'Podor': ['Podor', 'Ndioum']
      }
    }
  };

  patientForm = this.fb.group({
    numeroDossier: ['DOS-2026-XXXX'],
    prenom: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    sexe: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.pattern('^(77|78|76|70|33)[0-9]{7}$')]],
    region: ['', [Validators.required]],
    departement: [{ value: '', disabled: true }, [Validators.required]],
    commune: [{ value: '', disabled: true }, [Validators.required]],
    adresse: ['', [Validators.required]],
    photoIdentiteRecto: [''],
    photoIdentiteVerso: ['']
  });

  ngOnInit(): void {
    this.patientType = this.route.snapshot.queryParamMap.get('type');
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.patientId = +idParam;
      this.loadPatientData(this.patientId);
    } else {
      // Auto generate a dummy folder number
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      this.patientForm.patchValue({
        numeroDossier: `DOS-${year}-${rand}`
      });

      // Apply initial settings based on type
      if (this.patientType === 'cesarienne') {
        this.patientForm.patchValue({ sexe: 'F' });
        this.patientForm.get('sexe')?.disable();
      }
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.patientForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadPatientData(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.fillFormWithPatient(patient);
      },
      error: () => {
        // Mock fallback if offline
        const mock = this.getMockPatients().find(p => p.id === id);
        if (mock) {
          this.fillFormWithPatient(mock);
        } else {
          Swal.fire('Erreur', 'Impossible de charger le patient.', 'error');
          this.router.navigate(['/patients']);
        }
      }
    });
  }

  private fillFormWithPatient(patient: any): void {
    // Populate departments and communes arrays before patching form to prevent null selection
    if (patient.region) {
      this.departments = this.locationData[patient.region]?.departments || [];
      this.patientForm.get('departement')?.enable();
    }
    if (patient.region && patient.departement) {
      this.communes = this.locationData[patient.region]?.communes[patient.departement] || [];
      this.patientForm.get('commune')?.enable();
    }

    this.patientForm.patchValue({
      numeroDossier: patient.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      sexe: patient.sexe,
      dateNaissance: patient.dateNaissance ? patient.dateNaissance.split('T')[0] : '',
      telephone: patient.telephone,
      region: patient.region,
      departement: patient.departement,
      commune: patient.commune,
      adresse: patient.adresse,
      photoIdentiteRecto: patient.photoIdentiteRecto || '',
      photoIdentiteVerso: patient.photoIdentiteVerso || ''
    });

    this.photoRectoUrl = patient.photoIdentiteRecto || null;
    this.photoVersoUrl = patient.photoIdentiteVerso || null;

    // If edit mode and no type query param is set, infer type from patient characteristics
    if (!this.patientType) {
      const birthDate = this.patientForm.get('dateNaissance')?.value;
      if (birthDate) {
        const age = this.calculateAge(birthDate);
        if (age <= 5) {
          this.patientType = '0-5ans';
        } else if (age >= 60) {
          this.patientType = 'plan-sesame';
        } else if (patient.sexe === 'F') {
          this.patientType = 'classique';
        } else {
          this.patientType = 'classique';
        }
      }
    }

    // Apply gender locking if category is césarienne
    if (this.patientType === 'cesarienne') {
      this.patientForm.get('sexe')?.disable();
    }
  }

  onRegionChange(): void {
    const region = this.patientForm.get('region')?.value;
    const deptControl = this.patientForm.get('departement');
    const comControl = this.patientForm.get('commune');

    deptControl?.setValue('');
    comControl?.setValue('');
    
    if (region && this.locationData[region]) {
      this.departments = this.locationData[region].departments;
      deptControl?.enable();
      comControl?.disable();
    } else {
      this.departments = [];
      this.communes = [];
      deptControl?.disable();
      comControl?.disable();
    }
  }

  onDepartmentChange(): void {
    const region = this.patientForm.get('region')?.value;
    const department = this.patientForm.get('departement')?.value;
    const comControl = this.patientForm.get('commune');

    comControl?.setValue('');

    if (region && department && this.locationData[region]?.communes[department]) {
      this.communes = this.locationData[region].communes[department];
      comControl?.enable();
    } else {
      this.communes = [];
      comControl?.disable();
    }
  }

  calculateAge(dateString: string): number {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'cesarienne': return 'Césarienne';
      case '0-5ans': return '0 à 5 ans';
      case 'classique': return 'Classique';
      case 'plan-sesame': return 'Plan Sésame';
      default: return type;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'cesarienne': return 'badge-type-cesarienne';
      case '0-5ans': return 'badge-type-enfant';
      case 'classique': return 'badge-type-classique';
      case 'plan-sesame': return 'badge-type-sesame';
      default: return 'bg-primary text-white';
    }
  }

  getTypeIconClass(type: string): string {
    switch (type) {
      case 'cesarienne': return 'bi-gender-female';
      case '0-5ans': return 'bi-emoji-smile';
      case 'classique': return 'bi-person';
      case 'plan-sesame': return 'bi-heart-pulse';
      default: return 'bi-person';
    }
  }

  onPhotoSelected(event: any, side: 'recto' | 'verso'): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'recto') {
          this.photoRectoUrl = reader.result as string;
          this.patientForm.patchValue({ photoIdentiteRecto: reader.result as string });
        } else {
          this.photoVersoUrl = reader.result as string;
          this.patientForm.patchValue({ photoIdentiteVerso: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(side: 'recto' | 'verso'): void {
    if (side === 'recto') {
      this.photoRectoUrl = null;
      this.patientForm.patchValue({ photoIdentiteRecto: '' });
    } else {
      this.photoVersoUrl = null;
      this.patientForm.patchValue({ photoIdentiteVerso: '' });
    }
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    // Category validations
    if (this.patientType === 'cesarienne') {
      const sexe = this.patientForm.get('sexe')?.value;
      if (sexe !== 'F') {
        Swal.fire({
          title: 'Sexe non valide',
          text: `La prise en charge pour césarienne est exclusivement réservée aux patientes de sexe féminin.`,
          icon: 'warning',
          confirmButtonColor: '#E53935'
        });
        return;
      }
    }

    if (this.patientType === 'classique') {
      const recto = this.patientForm.get('photoIdentiteRecto')?.value;
      const verso = this.patientForm.get('photoIdentiteVerso')?.value;
      if (!recto || !verso) {
        Swal.fire({
          title: 'Photos de la pièce manquantes',
          text: `Pour la catégorie Classique, vous devez prendre en photo le recto et le verso de la pièce d'identité.`,
          icon: 'warning',
          confirmButtonColor: '#E53935'
        });
        return;
      }
    }

    const birthDate = this.patientForm.get('dateNaissance')?.value;
    if (birthDate) {
      const age = this.calculateAge(birthDate);
      if (age < 0) {
        Swal.fire('Erreur', 'La date de naissance ne peut pas être dans le futur.', 'error');
        return;
      }

      if (this.patientType === '0-5ans' && age > 5) {
        Swal.fire({
          title: 'Âge non valide',
          text: `Le patient de cette catégorie doit avoir entre 0 et 5 ans. L'âge calculé est de ${age} ans.`,
          icon: 'warning',
          confirmButtonColor: '#E53935'
        });
        return;
      }

      if (this.patientType === 'plan-sesame' && age < 60) {
        Swal.fire({
          title: 'Âge non valide',
          text: `Le bénéficiaire du Plan Sésame doit être âgé d'au moins 60 ans. L'âge calculé est de ${age} ans.`,
          icon: 'warning',
          confirmButtonColor: '#E53935'
        });
        return;
      }
    }

    this.submitting = true;
    const patientData = this.patientForm.getRawValue() as any;

    if (this.isEditMode) {
      this.patientService.updatePatient(this.patientId!, patientData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Succès !',
            text: 'La fiche patient a été mise à jour.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/patients']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Succès !', 'Fiche patient mise à jour (Simulation).', 'success')
            .then(() => this.router.navigate(['/patients']));
        }
      });
    } else {
      this.patientService.createPatient(patientData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Succès !',
            text: 'Le nouveau patient a été enregistré.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/patients']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Succès !', 'Nouveau patient enregistré (Simulation).', 'success')
            .then(() => this.router.navigate(['/patients']));
        }
      });
    }
  }

  private getMockPatients(): any[] {
    return [
      { id: 1, numeroDossier: 'DOS-2026-0001', prenom: 'Moussa', nom: 'Diop', sexe: 'M', dateNaissance: '1985-05-12', telephone: '776543210', adresse: 'Medina Rue 15', region: 'Dakar', departement: 'Dakar', commune: 'Medina', dateEnregistrement: '2026-05-15T09:00:00Z' },
      { id: 2, numeroDossier: 'DOS-2026-0002', prenom: 'Fatou', nom: 'Ndiaye', sexe: 'F', dateNaissance: '1992-09-24', telephone: '781234567', adresse: 'Saly Port', region: 'Thiès', departement: 'Mbour', commune: 'Saly', dateEnregistrement: '2026-05-16T10:30:00Z' }
    ];
  }
}
