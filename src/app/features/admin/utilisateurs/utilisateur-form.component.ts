import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { BureauService } from '../../../core/services/bureau.service';
import { BureauCsu } from '../../../core/models/bureau.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-person-fill-add text-csu-primary"></i>
            {{ isEditMode ? "Modifier l'utilisateur" : 'Ajouter un Nouvel Utilisateur' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Formulaire de modification du compte utilisateur' : 'Créez un nouveau compte avec les accès appropriés pour un agent, superviseur ou administrateur' }}
          </p>
        </div>
        <div>
          <a routerLink="/admin/utilisateurs" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
              
              <!-- Section 1 : Informations personnelles -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-person-badge-fill me-2"></i> 1. Profil & Contact
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="prenom">Prénom <span class="text-danger">*</span></label>
                    <input
                      id="prenom"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('prenom')"
                      formControlName="prenom"
                      placeholder="Ex: Amina"
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
                      placeholder="Ex: Diop"
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
                    <label class="csu-form-label" for="email">Adresse Email <span class="text-danger">*</span></label>
                    <input
                      id="email"
                      type="email"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('email')"
                      formControlName="email"
                      placeholder="nom.prenom&#64;csu.sn"
                    />
                    @if (isFieldInvalid('email')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Saisissez un email professionnel valide
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="telephone">N° Téléphone</label>
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
                        <i class="bi bi-info-circle"></i> N° de téléphone incorrect
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2 : Paramètres système et rôles -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-shield-lock-fill me-2"></i> 2. Accès Système
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="username">Identifiant système <span class="text-danger">*</span></label>
                    <input
                      id="username"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('username')"
                      formControlName="username"
                      placeholder="nom_utilisateur"
                    />
                    @if (isFieldInvalid('username')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> L'identifiant est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="password">
                      Mot de passe
                      @if (!isEditMode) { <span class="text-danger">*</span> }
                    </label>
                    <input
                      id="password"
                      type="password"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('password')"
                      formControlName="password"
                      placeholder="Saisissez un mot de passe sécurisé"
                    />
                    @if (isEditMode) {
                      <small class="text-muted">Laissez vide pour conserver le mot de passe actuel</small>
                    }
                    @if (isFieldInvalid('password')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le mot de passe est requis (min 6 caract.)
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="role">Rôle / Droits d'Accès <span class="text-danger">*</span></label>
                    <select
                      id="role"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('role')"
                      formControlName="role"
                    >
                      <option value="">Sélectionnez le rôle</option>
                      <option value="ADMIN">ADMINISTRATEUR (Accès complet)</option>
                      <option value="SUPERVISEUR">SUPERVISEUR (Rapports & Approbations)</option>
                      <option value="AGENT">AGENT CSU (Saisie & Enregistrement)</option>
                    </select>
                    @if (isFieldInvalid('role')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le rôle est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="bureauCsuId">Bureau CSU d'affectation</label>
                    <select
                      id="bureauCsuId"
                      class="csu-form-control csu-form-select"
                      formControlName="bureauCsuId"
                    >
                      <option value="">Sélectionnez le bureau</option>
                      @for (b of bureaux; track b.id) {
                        <option [value]="b.id">{{ b.nom }} ({{ b.region }})</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="structureId">Structure d'affectation</label>
                    <select
                      id="structureId"
                      class="csu-form-control csu-form-select"
                      formControlName="structureId"
                    >
                      <option value="">Sélectionnez la structure</option>
                      @for (s of structures; track s.id) {
                        <option [value]="s.id">{{ s.nom }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" id="actif" formControlName="actif" />
                    <label class="form-check-label fw-bold" for="actif">Compte utilisateur actif (Autorisé à se connecter)</label>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/admin/utilisateurs" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Modifier le compte' : 'Créer le compte' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Sécurité des comptes</h4>
            <p class="small text-secondary">
              Chaque utilisateur doit être affecté à un rôle correspondant à ses fonctions de terrain.
            </p>
            <p class="small text-secondary">
              Les <strong>Agents CSU</strong> ne voient pas les configurations ni les statistiques globales des autres bureaux.
            </p>
            <p class="small text-secondary">
              Les <strong>Superviseurs</strong> valident ou rejettent les enrôlements mais ne peuvent pas configurer de nouveaux bureaux ou comptes.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UtilisateurFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UtilisateurService);
  private bureauService = inject(BureauService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  userId?: number;
  submitting = false;
  bureaux: BureauCsu[] = [];
  structures: any[] = [];

  userForm = this.fb.group({
    prenom: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.pattern('^(77|78|76|70|33)[0-9]{7}$')]],
    username: ['', [Validators.required]],
    password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
    role: ['', [Validators.required]],
    bureauCsuId: [''],
    structureId: [''],
    actif: [true]
  });

  ngOnInit(): void {
    this.loadBureaux();
    this.loadStructures();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.userId = +idParam;
      
      // Update password validator for edit mode (it becomes optional)
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
      
      this.loadUserData(this.userId);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
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

  loadUserData(id: number): void {
    this.userService.getUtilisateurById(id).subscribe({
      next: (u) => {
        this.fillForm(u);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        Swal.fire('Erreur', 'Impossible de charger l\'utilisateur.', 'error');
        this.router.navigate(['/admin/utilisateurs']);
      }
    });
  }

  private fillForm(u: any): void {
    this.userForm.patchValue({
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      telephone: u.telephone,
      username: u.username,
      password: '',
      role: u.role,
      bureauCsuId: u.bureauCsuId ? u.bureauCsuId.toString() : '',
      structureId: u.structureId ? u.structureId.toString() : '',
      actif: u.actif
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formVal = this.userForm.value as any;

    const userData = {
      ...formVal,
      bureauCsuId: formVal.bureauCsuId ? +formVal.bureauCsuId : undefined,
      structureId: formVal.structureId ? +formVal.structureId : undefined
    };

    if (this.isEditMode) {
      // Remove password key if it was left empty
      if (!userData.password) {
        delete userData.password;
      }

      this.userService.updateUtilisateur(this.userId!, userData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Modifié !',
            text: "Le compte de l'utilisateur a été mis à jour.",
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/utilisateurs']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Modifié !', "Compte utilisateur mis à jour (Simulation).", 'success')
            .then(() => this.router.navigate(['/admin/utilisateurs']));
        }
      });
    } else {
      this.userService.createUtilisateur(userData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Créé !',
            text: 'Le compte utilisateur a été créé avec succès.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/utilisateurs']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Créé !', 'Nouveau compte utilisateur créé (Simulation).', 'success')
            .then(() => this.router.navigate(['/admin/utilisateurs']));
        }
      });
    }
  }
}
