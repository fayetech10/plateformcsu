import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EnrolementService } from '../../../core/services/enrolement.service';
import { Router, RouterLink } from '@angular/router';
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
          <p class="csu-page-subtitle">Saisissez l'identité du bénéficiaire à affilier au programme</p>
        </div>
        <div>
          <a routerLink="/enrolements" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card mb-4">
            <form [formGroup]="enrolementForm" (ngSubmit)="onSubmit()">

              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-person-vcard me-2"></i> Identité du bénéficiaire
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nom">Nom <span class="text-danger">*</span></label>
                    <input id="nom" type="text" class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('nom')" formControlName="nom" placeholder="Ex: Diop" />
                    @if (isFieldInvalid('nom')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le nom est requis</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="prenom">Prénom <span class="text-danger">*</span></label>
                    <input id="prenom" type="text" class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('prenom')" formControlName="prenom" placeholder="Ex: Awa" />
                    @if (isFieldInvalid('prenom')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le prénom est requis</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="sexe">Sexe <span class="text-danger">*</span></label>
                    <select id="sexe" class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('sexe')" formControlName="sexe">
                      <option value="">Sélectionnez</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                    @if (isFieldInvalid('sexe')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le sexe est requis</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateNaissance">Date de naissance <span class="text-danger">*</span></label>
                    <input id="dateNaissance" type="date" class="csu-form-control" [max]="today"
                      [class.is-invalid]="isFieldInvalid('dateNaissance')" formControlName="dateNaissance" />
                    @if (isFieldInvalid('dateNaissance')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> La date de naissance est requise</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="telephone">Téléphone <span class="text-danger">*</span></label>
                    <input id="telephone" type="tel" class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('telephone')" formControlName="telephone" placeholder="Ex: 771234567" />
                    @if (isFieldInvalid('telephone')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le téléphone est requis</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="adresse">Adresse</label>
                    <input id="adresse" type="text" class="csu-form-control"
                      formControlName="adresse" placeholder="Quartier, rue..." />
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/enrolements" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
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
                <span>Le bénéficiaire est créé automatiquement à partir des informations saisies.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-shield-check text-csu-secondary"></i>
                <span>Le statut de l'enrôlement est initialisé à <strong>EN_COURS</strong> et devra être validé par un superviseur.</span>
              </li>
              <li class="d-flex gap-2">
                <i class="bi bi-shield-check text-csu-secondary"></i>
                <span>Un numéro de bénéficiaire unique (<strong>BEN-</strong>) est généré automatiquement.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EnrolementFormComponent {
  private fb = inject(FormBuilder);
  private enrolementService = inject(EnrolementService);
  private router = inject(Router);

  submitting = false;
  today = new Date().toISOString().split('T')[0];

  enrolementForm = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    sexe: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    telephone: ['', [Validators.required]],
    adresse: ['']
  });

  isFieldInvalid(field: string): boolean {
    const control = this.enrolementForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.enrolementForm.invalid) {
      this.enrolementForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = this.enrolementForm.value as any;

    this.enrolementService.createEnrolement(data).subscribe({
      next: () => {
        this.submitting = false;
        Swal.fire({
          title: 'Enregistré !',
          text: "L'enrôlement a été créé et est en attente d'examen.",
          icon: 'success',
          confirmButtonColor: '#00875A'
        }).then(() => this.router.navigate(['/enrolements']));
      },
      error: (err) => {
        this.submitting = false;
        Swal.fire('Erreur', err?.error?.message || "Impossible d'enregistrer l'enrôlement. Veuillez réessayer.", 'error');
      }
    });
  }
}
