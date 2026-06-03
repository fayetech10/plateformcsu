import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BureauService } from '../../../core/services/bureau.service';
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
  selector: 'app-bureau-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-building-add text-csu-primary"></i>
            {{ isEditMode ? 'Modifier le Bureau CSU' : 'Créer un Nouveau Bureau CSU' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Formulaire de modification des détails du bureau' : 'Ajoutez un nouveau bureau régional pour étendre le maillage de la Couverture Sanitaire Universelle' }}
          </p>
        </div>
        <div>
          <a routerLink="/admin/bureaux" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="bureauForm" (ngSubmit)="onSubmit()">
              
              <!-- Section 1 : Paramètres du bureau -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-building-fill-gear me-2"></i> Informations d'Identification
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="code">Code Unique du Bureau <span class="text-danger">*</span></label>
                    <input
                      id="code"
                      type="text"
                      class="csu-form-control text-uppercase fw-bold"
                      [class.is-invalid]="isFieldInvalid('code')"
                      formControlName="code"
                      placeholder="Ex: DKR-01"
                      [readonly]="isEditMode"
                    />
                    @if (isFieldInvalid('code')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le code unique est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nom">Nom du Bureau <span class="text-danger">*</span></label>
                    <input
                      id="nom"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('nom')"
                      formControlName="nom"
                      placeholder="Ex: Dakar Plateau"
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
                    <label class="csu-form-label" for="telephone">N° Téléphone <span class="text-danger">*</span></label>
                    <input
                      id="telephone"
                      type="tel"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('telephone')"
                      formControlName="telephone"
                      placeholder="Ex: 338000000"
                    />
                    @if (isFieldInvalid('telephone')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Téléphone requis (9 chiffres)
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2 : Localisation géographique -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-geo-alt-fill me-2"></i> Localisation & Adresse
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
                    <label class="csu-form-label" for="adresse">Adresse Physique <span class="text-danger">*</span></label>
                    <textarea
                      id="adresse"
                      rows="2"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('adresse')"
                      formControlName="adresse"
                      placeholder="Quartier, Avenue, Rue, N° de porte..."
                    ></textarea>
                    @if (isFieldInvalid('adresse')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> L'adresse est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" id="actif" formControlName="actif" />
                    <label class="form-check-label fw-bold" for="actif">Bureau actif (Ouvert aux opérations)</label>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/admin/bureaux" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le bureau' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Réseau des bureaux</h4>
            <p class="small text-secondary">
              Les bureaux de la Couverture Sanitaire Universelle sont configurés pour regrouper géographiquement les dossiers patients et les statistiques locales.
            </p>
            <p class="small text-secondary">
              Une fois créé, un bureau peut accueillir des agents de saisie d'enrôlements.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BureauFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bureauService = inject(BureauService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  bureauId?: number;
  submitting = false;

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

  bureauForm = this.fb.group({
    code: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.pattern('^(77|78|76|70|33)[0-9]{7}$')]],
    region: ['', [Validators.required]],
    departement: [{ value: '', disabled: true }, [Validators.required]],
    commune: [{ value: '', disabled: true }, [Validators.required]],
    adresse: ['', [Validators.required]],
    actif: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.bureauId = +idParam;
      this.loadBureauData(this.bureauId);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bureauForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadBureauData(id: number): void {
    this.bureauService.getBureauById(id).subscribe({
      next: (b) => {
        this.fillForm(b);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du bureau:', err);
        Swal.fire('Erreur', 'Impossible de charger le bureau.', 'error');
        this.router.navigate(['/admin/bureaux']);
      }
    });
  }

  private fillForm(b: any): void {
    if (b.region) {
      this.departments = this.locationData[b.region]?.departments || [];
      this.bureauForm.get('departement')?.enable();
    }
    if (b.region && b.departement) {
      this.communes = this.locationData[b.region]?.communes[b.departement] || [];
      this.bureauForm.get('commune')?.enable();
    }

    this.bureauForm.patchValue({
      code: b.code,
      nom: b.nom,
      telephone: b.telephone,
      region: b.region,
      departement: b.departement,
      commune: b.commune,
      adresse: b.adresse,
      actif: b.actif
    });
  }

  onRegionChange(): void {
    const region = this.bureauForm.get('region')?.value;
    const deptControl = this.bureauForm.get('departement');
    const comControl = this.bureauForm.get('commune');

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
    const region = this.bureauForm.get('region')?.value;
    const department = this.bureauForm.get('departement')?.value;
    const comControl = this.bureauForm.get('commune');

    comControl?.setValue('');

    if (region && department && this.locationData[region]?.communes[department]) {
      this.communes = this.locationData[region].communes[department];
      comControl?.enable();
    } else {
      this.communes = [];
      comControl?.disable();
    }
  }

  onSubmit(): void {
    if (this.bureauForm.invalid) {
      this.bureauForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const bureauData = this.bureauForm.getRawValue() as any;

    if (this.isEditMode) {
      this.bureauService.updateBureau(this.bureauId!, bureauData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Mis à jour !',
            text: 'Le bureau CSU a été mis à jour.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/bureaux']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Mis à jour !', 'Bureau CSU mis à jour (Simulation).', 'success')
            .then(() => this.router.navigate(['/admin/bureaux']));
        }
      });
    } else {
      this.bureauService.createBureau(bureauData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Créé !',
            text: 'Le bureau CSU a été configuré avec succès.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/bureaux']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Créé !', 'Nouveau bureau CSU configuré (Simulation).', 'success')
            .then(() => this.router.navigate(['/admin/bureaux']));
        }
      });
    }
  }
}
