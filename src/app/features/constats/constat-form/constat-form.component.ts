import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConstatService } from '../../../core/services/constat.service';
import { CategorieConstat } from '../../../core/models/constat.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-constat-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ isEditMode ? 'Modifier le Constat' : 'Signaler un Nouveau Constat' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Formulaire de modification du constat' : 'Rapportez une anomalie, un incident technique ou opérationnel survenu sur le terrain' }}
          </p>
        </div>
        <div>
          <a routerLink="/constats" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="constatForm" (ngSubmit)="onSubmit()">
              
              <h4 class="mb-4 text-csu-danger">
                <i class="bi bi-shield-fill-exclamation me-2"></i> Détails de l'Incident
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="referenceConstat">Référence de l'incident</label>
                    <input
                      id="referenceConstat"
                      type="text"
                      class="csu-form-control text-uppercase fw-bold text-danger"
                      formControlName="referenceConstat"
                      readonly
                    />
                    <small class="text-muted">Généré automatiquement</small>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateConstat">Date de constatation <span class="text-danger">*</span></label>
                    <input
                      id="dateConstat"
                      type="date"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('dateConstat')"
                      formControlName="dateConstat"
                    />
                    @if (isFieldInvalid('dateConstat')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La date est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="categorieId">Catégorie du constat <span class="text-danger">*</span></label>
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
                    <label class="csu-form-label" for="priorite">Priorité / Gravité <span class="text-danger">*</span></label>
                    <select
                      id="priorite"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('priorite')"
                      formControlName="priorite"
                    >
                      <option value="">Sélectionnez le niveau</option>
                      <option value="BASSE">Basse — Simple gêne</option>
                      <option value="MOYENNE">Moyenne — Travail ralenti</option>
                      <option value="HAUTE">Haute — Incident critique</option>
                      <option value="URGENTE">Urgente — Blocage complet</option>
                    </select>
                    @if (isFieldInvalid('priorite')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La priorité est requise
                      </div>
                    }
                  </div>
                </div>

                @if (isEditMode) {
                  <div class="col-12 col-md-6">
                    <div class="csu-form-group">
                      <label class="csu-form-label" for="statut">Statut du traitement <span class="text-danger">*</span></label>
                      <select
                        id="statut"
                        class="csu-form-control csu-form-select"
                        [class.is-invalid]="isFieldInvalid('statut')"
                        formControlName="statut"
                      >
                        <option value="OUVERT">Ouvert / Non traité</option>
                        <option value="EN_COURS">En cours de traitement</option>
                        <option value="RESOLU">Résolu</option>
                        <option value="ARCHIVE">Archivé</option>
                      </select>
                      @if (isFieldInvalid('statut')) {
                        <div class="csu-invalid-feedback">
                          <i class="bi bi-info-circle"></i> Le statut est requis
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="description">Description détaillée <span class="text-danger">*</span></label>
                    <textarea
                      id="description"
                      rows="4"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('description')"
                      formControlName="description"
                      placeholder="Décrivez précisément l'anomalie constatée, les messages d'erreurs, l'impact sur le service..."
                    ></textarea>
                    @if (isFieldInvalid('description')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La description est requise (min. 10 caract.)
                      </div>
                    }
                  </div>
                </div>

                <!-- File attachments -->
                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label">Pièces jointes (Photos, captures d'écran, logs)</label>
                    <div class="p-4 border border-dashed rounded text-center bg-light">
                      <i class="bi bi-cloud-upload-fill text-muted fs-2"></i>
                      <p class="mt-2 mb-1 small text-dark fw-bold">Glissez-déposez des fichiers ici</p>
                      <p class="text-muted small mb-3">ou cliquez pour choisir sur votre appareil (PNG, JPG, PDF - Max 5Mo)</p>
                      <input type="file" multiple class="d-none" #fileInput (change)="onFileSelect($event)" />
                      <button type="button" class="csu-btn csu-btn-light btn-sm" (click)="fileInput.click()">
                        Parcourir les fichiers
                      </button>
                    </div>

                    @if (selectedFiles.length > 0) {
                      <div class="mt-3">
                        <h5 class="small fw-bold text-secondary">Fichiers sélectionnés :</h5>
                        <ul class="list-group p-0 m-0">
                          @for (file of selectedFiles; track file.name; let idx = $index) {
                            <li class="list-group-item d-flex justify-content-between align-items-center py-2 border-0 bg-light rounded mb-2">
                              <span class="small"><i class="bi bi-file-earmark-code me-2 text-primary"></i> {{ file.name }}</span>
                              <button type="button" class="btn btn-sm btn-link text-danger border-0 p-0" (click)="removeFile(idx)">
                                <i class="bi bi-x-circle-fill"></i>
                              </button>
                            </li>
                          }
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/constats" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Enregistrer les modifications' : 'Signaler l\\'incident' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-accent-light border-0">
            <h4 class="text-warning mb-3"><i class="bi bi-lightbulb-fill"></i> Niveaux d'urgence</h4>
            <ul class="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li>
                <strong class="text-dark">Basse</strong> : Matériel non bloquant, demande d'amélioration.
              </li>
              <li>
                <strong class="text-dark">Moyenne</strong> : Dysfonctionnement ralentissant la saisie mais avec solution de contournement.
              </li>
              <li>
                <strong class="text-dark">Haute</strong> : Incident bloquant l'enrôlement ou perturbant gravement l'accueil.
              </li>
              <li>
                <strong class="text-dark">Urgente</strong> : Panne complète de réseau, fermeture de bureau, indisponibilité totale de la plateforme.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-dashed {
      border-style: dashed !important;
      border-width: 2px !important;
      border-color: var(--csu-text-muted) !important;
    }
  `]
})
export class ConstatFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private constatService = inject(ConstatService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  constatId?: number;
  submitting = false;
  categories: CategorieConstat[] = [];
  selectedFiles: File[] = [];

  constatForm = this.fb.group({
    referenceConstat: ['CST-2026-XXXX'],
    dateConstat: [new Date().toISOString().split('T')[0], [Validators.required]],
    categorieId: ['', [Validators.required]],
    priorite: ['', [Validators.required]],
    statut: ['OUVERT', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.constatId = +idParam;
      this.loadConstatData(this.constatId);
    } else {
      // Auto generate reference
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      this.constatForm.patchValue({
        referenceConstat: `CST-${year}-${rand}`
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.constatForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadCategories(): void {
    this.constatService.getCategories(true).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.categories = [];
      }
    });
  }

  loadConstatData(id: number): void {
    this.constatService.getConstatById(id).subscribe({
      next: (data) => {
        this.fillForm(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du constat:', err);
        Swal.fire('Erreur', 'Impossible de charger le constat.', 'error');
        this.router.navigate(['/constats']);
      }
    });
  }

  private fillForm(data: any): void {
    this.constatForm.patchValue({
      referenceConstat: data.referenceConstat,
      dateConstat: data.dateConstat ? data.dateConstat.split('T')[0] : '',
      categorieId: data.categorieId ? data.categorieId.toString() : '',
      priorite: data.priorite,
      statut: data.statut,
      description: data.description
    });
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      for (let i = 0; i < target.files.length; i++) {
        this.selectedFiles.push(target.files[i]);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.constatForm.invalid) {
      this.constatForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formVal = this.constatForm.value as any;

    const selectedCat = this.categories.find(c => c.id === +formVal.categorieId);

    // <input type="date"> renvoie "yyyy-MM-dd" → le backend attend un LocalDateTime
    const dateConstat = formVal.dateConstat
      ? (formVal.dateConstat.length === 10 ? `${formVal.dateConstat}T00:00:00` : formVal.dateConstat)
      : null;

    const constatData = {
      ...formVal,
      dateConstat,
      categorieId: +formVal.categorieId,
      categorieNom: selectedCat ? selectedCat.nom : '',
      archive: formVal.statut === 'ARCHIVE'
    };

    if (this.isEditMode) {
      this.constatService.updateConstat(this.constatId!, constatData).subscribe({
        next: (res) => {
          this.uploadFilesIfAny(res.id || this.constatId!);
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Erreur', err?.error?.message || "Impossible de mettre à jour le constat. Veuillez réessayer.", 'error');
        }
      });
    } else {
      this.constatService.createConstat(constatData).subscribe({
        next: (res) => {
          this.uploadFilesIfAny(res.id!);
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Erreur', err?.error?.message || "Impossible de signaler le constat. Veuillez réessayer.", 'error');
        }
      });
    }
  }

  private uploadFilesIfAny(id: number): void {
    if (this.selectedFiles.length > 0) {
      this.constatService.uploadPiecesJointes(id, this.selectedFiles).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Succès !',
            text: "L'incident a été enregistré avec les pièces jointes.",
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/constats']));
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Constat enregistré', "Le constat a été enregistré, mais l'envoi des pièces jointes a échoué : " + (err?.error?.message || 'réessayez depuis la fiche.'), 'warning')
            .then(() => this.router.navigate(['/constats']));
        }
      });
    } else {
      this.submitting = false;
      Swal.fire({
        title: 'Succès !',
        text: "L'incident a été enregistré avec succès.",
        icon: 'success',
        confirmButtonColor: '#00875A'
      }).then(() => this.router.navigate(['/constats']));
    }
  }
}
