import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActiviteService } from '../../../core/services/activite.service';
import { CategorieActivite } from '../../../core/models/activite.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activite-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-calendar-plus-fill"></i>
            {{ isEditMode ? "Modifier le rapport d'activité" : "Nouveau Rapport d'Activité" }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? "Modifiez le rapport d'activité" : "Rapportez les détails d'une activité réalisée sur le terrain ou au bureau CSU" }}
          </p>
        </div>
        <div>
          <a routerLink="/activites" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="activiteForm" (ngSubmit)="onSubmit()">
              
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-clipboard-data me-2"></i> Informations d'Activité
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="typeActivite">Type d'Activité <span class="text-danger">*</span></label>
                    <select
                      id="typeActivite"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('typeActivite')"
                      formControlName="typeActivite"
                    >
                      <option value="">Sélectionnez le type</option>
                      <option value="SENSIBILISATION">Sensibilisation / Caravane</option>
                      <option value="FORMATION">Formation / Atelier</option>
                      <option value="REUNION">Réunion / Comité</option>
                      <option value="VISITE_TERRAIN">Visite de terrain / Supervision</option>
                      <option value="ASSISTANCE_ADMINISTRATIVE">Assistance administrative</option>
                    </select>
                    @if (isFieldInvalid('typeActivite')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le type d'activité est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="categorieId">Catégorie d'Activité <span class="text-danger">*</span></label>
                    <select
                      id="categorieId"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('categorieId')"
                      formControlName="categorieId"
                    >
                      <option value="">Sélectionnez la catégorie</option>
                      @for (cat of categories; track cat.id) {
                        <option [value]="cat.id">{{ cat.nom }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('categorieId')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La catégorie est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateActivite">Date de Réalisation <span class="text-danger">*</span></label>
                    <input
                      id="dateActivite"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('dateActivite')"
                      formControlName="dateActivite"
                    />
                    @if (isFieldInvalid('dateActivite')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nombreParticipants">Nombre de Participants <span class="text-danger">*</span></label>
                    <input
                      id="nombreParticipants"
                      type="number"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('nombreParticipants')"
                      formControlName="nombreParticipants"
                      min="0"
                    />
                    @if (isFieldInvalid('nombreParticipants')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Entrez un nombre valide (&ge; 0)
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="statut">Statut <span class="text-danger">*</span></label>
                    <select id="statut" class="csu-form-control csu-form-select" formControlName="statut">
                      <option value="PLANIFIEE">📅 Planifiée</option>
                      <option value="REALISEE">✅ Réalisée</option>
                      <option value="ANNULEE">✖️ Annulée</option>
                    </select>
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="description">Description de l'activité <span class="text-danger">*</span></label>
                    <textarea
                      id="description"
                      rows="3"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('description')"
                      formControlName="description"
                      placeholder="Résumez l'objectif et les faits marquants de cette activité..."
                    ></textarea>
                    @if (isFieldInvalid('description')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La description est requise (min. 10 caract.)
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="commentaires">Commentaires additionnels</label>
                    <textarea
                      id="commentaires"
                      rows="2"
                      class="csu-form-control"
                      formControlName="commentaires"
                      placeholder="Commentaires administratifs, recommandations, suites à donner..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/activites" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Envoi...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Modifier' : 'Rapporter l\\'Activité' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Notice de Saisie</h4>
            <p class="small text-secondary">
              Les activités enregistrées sont comptabilisées dans le tableau de bord et servent d'indicateurs de performance clés pour le bureau CSU régional.
            </p>
            <p class="small text-secondary">
              Veillez à classer correctement vos rapports selon les catégories administratives définies par votre direction.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActiviteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private activiteService = inject(ActiviteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  activiteId?: number;
  submitting = false;
  categories: CategorieActivite[] = [];

  activiteForm = this.fb.group({
    typeActivite: ['', [Validators.required]],
    categorieId: ['', [Validators.required]],
    dateActivite: [new Date().toISOString().split('T')[0], [Validators.required]],
    nombreParticipants: [1, [Validators.required, Validators.min(0)]],
    statut: ['REALISEE', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    commentaires: ['']
  });

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.activiteId = +idParam;
      this.loadActiviteData(this.activiteId);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.activiteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadCategories(): void {
    this.activiteService.getCategories(true).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.categories = [];
      }
    });
  }

  loadActiviteData(id: number): void {
    this.activiteService.getActiviteById(id).subscribe({
      next: (data) => {
        this.fillForm(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'activité:', err);
        Swal.fire('Erreur', 'Impossible de charger l\'activité.', 'error');
        this.router.navigate(['/activites']);
      }
    });
  }

  private fillForm(data: any): void {
    this.activiteForm.patchValue({
      typeActivite: data.typeActivite,
      categorieId: data.categorieId ? data.categorieId.toString() : '',
      dateActivite: data.dateActivite ? data.dateActivite.split('T')[0] : '',
      nombreParticipants: data.nombreParticipants,
      statut: data.statut || 'REALISEE',
      description: data.description,
      commentaires: data.commentaires
    });
  }

  onSubmit(): void {
    if (this.activiteForm.invalid) {
      this.activiteForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formVal = this.activiteForm.value as any;
    
    // Map categorie name
    const selectedCat = this.categories.find(c => c.id === +formVal.categorieId);
    
    // <input type="date"> renvoie "yyyy-MM-dd" → le backend attend un LocalDateTime
    const dateActivite = formVal.dateActivite
      ? (formVal.dateActivite.length === 10 ? `${formVal.dateActivite}T00:00:00` : formVal.dateActivite)
      : null;

    const activiteData = {
      ...formVal,
      dateActivite,
      categorieId: +formVal.categorieId,
      categorieNom: selectedCat ? selectedCat.nom : ''
    };

    if (this.isEditMode) {
      this.activiteService.updateActivite(this.activiteId!, activiteData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Modifiée !',
            text: "Le rapport d'activité a été mis à jour.",
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/activites']));
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Erreur', err?.error?.message || "Impossible de mettre à jour le rapport d'activité. Veuillez réessayer.", 'error');
        }
      });
    } else {
      this.activiteService.createActivite(activiteData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Enregistrée !',
            text: "Le rapport d'activité a été créé avec succès.",
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/activites']));
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Erreur', err?.error?.message || "Impossible d'enregistrer le rapport d'activité. Veuillez réessayer.", 'error');
        }
      });
    }
  }
}
