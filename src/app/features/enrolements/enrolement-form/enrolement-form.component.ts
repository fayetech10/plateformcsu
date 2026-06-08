import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { EnrolementService } from '../../../core/services/enrolement.service';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import {
  KoboChoice, KoboGeoChoice,
  REGIONS_AFFILIATION, ASSUREURS, OGD,
  REGIONS_RESIDENCE, DEPARTEMENTS, COMMUNES,
  SITUATION_MATRIMONIALE, SECTEUR_ACTIVITE, TYPE_PIECE_IDENTITE,
  MOYEN_PAIEMENT, STATUT_PAIEMENT, LIENS_PARENTE
} from '../../../core/data/kobo-choices';

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
          <p class="csu-page-subtitle">Saisissez les informations du bénéficiaire (conformes au formulaire KoboToolbox)</p>
        </div>
        <div>
          <a routerLink="/enrolements" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-9">
          <div class="csu-card mb-4">
            <form [formGroup]="enrolementForm" (ngSubmit)="onSubmit()">

              <!-- ===== Affiliation ===== -->
              <h4 class="mb-3 text-csu-primary"><i class="bi bi-building me-2"></i> Affiliation</h4>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Région d'affiliation</label>
                  <select class="csu-form-control csu-form-select" formControlName="regionAffiliation">
                    <option value="">Sélectionnez</option>
                    @for (o of regionsAffiliation; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Organisme assureur</label>
                  <select class="csu-form-control csu-form-select" formControlName="organismeAssureur">
                    <option value="">Sélectionnez</option>
                    @for (o of assureurs; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">OGD</label>
                  <select class="csu-form-control csu-form-select" formControlName="ogd" [attr.disabled]="filteredOgd.length === 0 ? '' : null">
                    <option value="">{{ filteredOgd.length ? 'Sélectionnez' : 'Choisissez d\\'abord la région d\\'affiliation' }}</option>
                    @for (o of filteredOgd; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Type d'adhésion</label>
                  <input type="text" class="csu-form-control" formControlName="typeAdhesion" placeholder="Ex: Familiale" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Régime</label>
                  <input type="text" class="csu-form-control" formControlName="typeRegime" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Type de bénéficiaire</label>
                  <input type="text" class="csu-form-control" formControlName="typeBeneficiaire" />
                </div>
              </div>

              <!-- ===== Identité ===== -->
              <h4 class="mb-3 text-csu-primary border-top pt-4"><i class="bi bi-person-vcard me-2"></i> Identité de l'adhérent</h4>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="csu-form-label" for="nom">Nom <span class="text-danger">*</span></label>
                  <input id="nom" type="text" class="csu-form-control"
                    [class.is-invalid]="isFieldInvalid('nom')" formControlName="nom" placeholder="Ex: Diop" />
                  @if (isFieldInvalid('nom')) { <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le nom est requis</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label" for="prenom">Prénom <span class="text-danger">*</span></label>
                  <input id="prenom" type="text" class="csu-form-control"
                    [class.is-invalid]="isFieldInvalid('prenom')" formControlName="prenom" placeholder="Ex: Awa" />
                  @if (isFieldInvalid('prenom')) { <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le prénom est requis</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label" for="sexe">Sexe <span class="text-danger">*</span></label>
                  <select id="sexe" class="csu-form-control csu-form-select"
                    [class.is-invalid]="isFieldInvalid('sexe')" formControlName="sexe">
                    <option value="">Sélectionnez</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  @if (isFieldInvalid('sexe')) { <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le sexe est requis</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label" for="dateNaissance">Date de naissance <span class="text-danger">*</span></label>
                  <input id="dateNaissance" type="date" class="csu-form-control" [max]="today"
                    [class.is-invalid]="isFieldInvalid('dateNaissance')" formControlName="dateNaissance" />
                  @if (isFieldInvalid('dateNaissance')) { <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> La date de naissance est requise</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Lieu de naissance</label>
                  <input type="text" class="csu-form-control" formControlName="lieuNaissance" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Situation matrimoniale</label>
                  <select class="csu-form-control csu-form-select" formControlName="situationMatrimoniale">
                    <option value="">Sélectionnez</option>
                    @for (o of situationMatrimoniale; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Secteur d'activité</label>
                  <select class="csu-form-control csu-form-select" formControlName="secteurActivite">
                    <option value="">Sélectionnez</option>
                    @for (o of secteurActivite; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label" for="telephone">Téléphone (WhatsApp) <span class="text-danger">*</span></label>
                  <input id="telephone" type="tel" class="csu-form-control"
                    [class.is-invalid]="isFieldInvalid('telephone')" formControlName="telephone" placeholder="Ex: 771234567" />
                  @if (isFieldInvalid('telephone')) { <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le téléphone est requis</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Autre téléphone</label>
                  <input type="tel" class="csu-form-control" formControlName="autreTelephone" />
                </div>
              </div>

              <!-- ===== Résidence ===== -->
              <h4 class="mb-3 text-csu-primary border-top pt-4"><i class="bi bi-geo-alt me-2"></i> Résidence</h4>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Région de résidence</label>
                  <select class="csu-form-control csu-form-select" formControlName="regionResidence">
                    <option value="">Sélectionnez</option>
                    @for (o of regionsResidence; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Département</label>
                  <select class="csu-form-control csu-form-select" formControlName="departementResidence" [attr.disabled]="filteredDepartements.length === 0 ? '' : null">
                    <option value="">{{ filteredDepartements.length ? 'Sélectionnez' : 'Choisissez la région' }}</option>
                    @for (o of filteredDepartements; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Commune</label>
                  <select class="csu-form-control csu-form-select" formControlName="communeResidence" [attr.disabled]="filteredCommunes.length === 0 ? '' : null">
                    <option value="">{{ filteredCommunes.length ? 'Sélectionnez' : 'Choisissez le département' }}</option>
                    @for (o of filteredCommunes; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12">
                  <label class="csu-form-label">Adresse</label>
                  <input type="text" class="csu-form-control" formControlName="adresse" placeholder="Quartier, rue..." />
                </div>
              </div>

              <!-- ===== Pièce d'identité ===== -->
              <h4 class="mb-3 text-csu-primary border-top pt-4"><i class="bi bi-card-text me-2"></i> Pièce d'identité</h4>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Type de pièce</label>
                  <select class="csu-form-control csu-form-select" formControlName="typePieceIdentite">
                    <option value="">Sélectionnez</option>
                    @for (o of typePieceIdentite; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">N° CNI</label>
                  <input type="text" class="csu-form-control" formControlName="numeroPiece1" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">N° Passeport</label>
                  <input type="text" class="csu-form-control" formControlName="numeroPiece2" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">N° Extrait de naissance</label>
                  <input type="text" class="csu-form-control" formControlName="numeroPiece3" />
                </div>
              </div>

              <!-- ===== Personnes à charge ===== -->
              <div class="d-flex justify-content-between align-items-center mb-3 border-top pt-4">
                <h4 class="text-csu-primary mb-0"><i class="bi bi-people me-2"></i> Personnes à charge</h4>
                <button type="button" class="csu-btn csu-btn-light" (click)="addDependant()">
                  <i class="bi bi-plus-lg"></i> Ajouter
                </button>
              </div>
              @if (personnesACharge.length === 0) {
                <p class="text-muted small mb-4">Aucune personne à charge. Cliquez sur « Ajouter » si l'adhérent en a.</p>
              }
              <div formArrayName="personnesACharge" class="d-flex flex-column gap-3 mb-4">
                @for (dep of personnesACharge.controls; track dep; let i = $index) {
                  <div class="csu-card bg-light border" [formGroupName]="i">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-semibold text-csu-secondary">Personne à charge #{{ i + 1 }}</span>
                      <button type="button" class="csu-btn-icon text-danger" (click)="removeDependant(i)" title="Retirer">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                    <div class="row g-3">
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Prénom</label>
                        <input type="text" class="csu-form-control" formControlName="prenom" />
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Nom</label>
                        <input type="text" class="csu-form-control" formControlName="nom" />
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Sexe</label>
                        <select class="csu-form-control csu-form-select" formControlName="sexe">
                          <option value="">Sélectionnez</option>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                        </select>
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Date de naissance</label>
                        <input type="date" class="csu-form-control" [max]="today" formControlName="dateNaissance" />
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Lien de parenté</label>
                        <select class="csu-form-control csu-form-select" formControlName="lienParente">
                          <option value="">Sélectionnez</option>
                          @for (lien of liensParente; track lien.value) { <option [value]="lien.value">{{ lien.label }}</option> }
                        </select>
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="csu-form-label">Téléphone</label>
                        <input type="tel" class="csu-form-control" formControlName="telephone" />
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- ===== Paiement ===== -->
              <h4 class="mb-3 text-csu-primary border-top pt-4"><i class="bi bi-cash-coin me-2"></i> Paiement</h4>
              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Frais d'adhésion (FCFA)</label>
                  <input type="number" class="csu-form-control" formControlName="montantFraisAdhesion" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Cotisation / bénéficiaire (FCFA)</label>
                  <input type="number" class="csu-form-control" formControlName="montantCotisation" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Montant versé (FCFA)</label>
                  <input type="number" class="csu-form-control" formControlName="montantVersement" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Moyen de paiement</label>
                  <select class="csu-form-control csu-form-select" formControlName="moyenPaiement">
                    <option value="">Sélectionnez</option>
                    @for (o of moyenPaiement; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Statut du paiement</label>
                  <select class="csu-form-control csu-form-select" formControlName="statutPaiement">
                    <option value="">Sélectionnez</option>
                    @for (o of statutPaiement; track o.value) { <option [value]="o.value">{{ o.label }}</option> }
                  </select>
                </div>
              </div>

              <!-- Submit -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/enrolements" class="csu-btn csu-btn-light">Annuler</button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span> Traitement...
                  } @else {
                    <i class="bi bi-shield-fill-check me-1"></i> Valider l'Enrôlement
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="col-12 col-xl-3 d-none d-xl-block">
          <div class="csu-card bg-csu-secondary-light border-0">
            <h4 class="text-csu-secondary mb-3">Règles d'Affiliation</h4>
            <ul class="list-unstyled d-flex flex-column gap-3 small text-secondary">
              <li class="d-flex gap-2"><i class="bi bi-shield-check text-csu-secondary"></i><span>Les champs marqués <strong>*</strong> sont obligatoires.</span></li>
              <li class="d-flex gap-2"><i class="bi bi-shield-check text-csu-secondary"></i><span>L'enrôlement est synchronisé automatiquement vers KoboToolbox.</span></li>
              <li class="d-flex gap-2"><i class="bi bi-shield-check text-csu-secondary"></i><span>Le statut est initialisé à <strong>EN_COURS</strong>.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EnrolementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private enrolementService = inject(EnrolementService);
  private router = inject(Router);

  submitting = false;
  today = new Date().toISOString().split('T')[0];

  // Listes de choix Kobo
  regionsAffiliation: KoboChoice[] = REGIONS_AFFILIATION;
  assureurs: KoboChoice[] = ASSUREURS;
  regionsResidence: KoboChoice[] = REGIONS_RESIDENCE;
  situationMatrimoniale: KoboChoice[] = SITUATION_MATRIMONIALE;
  secteurActivite: KoboChoice[] = SECTEUR_ACTIVITE;
  typePieceIdentite: KoboChoice[] = TYPE_PIECE_IDENTITE;
  moyenPaiement: KoboChoice[] = MOYEN_PAIEMENT;
  statutPaiement: KoboChoice[] = STATUT_PAIEMENT;
  liensParente: KoboChoice[] = LIENS_PARENTE;

  // Listes filtrées (cascades)
  filteredOgd: KoboGeoChoice[] = [];
  filteredDepartements: KoboGeoChoice[] = [];
  filteredCommunes: KoboGeoChoice[] = [];

  enrolementForm = this.fb.group({
    // Identité
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    sexe: ['', [Validators.required]],
    dateNaissance: ['', [Validators.required]],
    telephone: ['', [Validators.required]],
    adresse: [''],
    lieuNaissance: [''],
    situationMatrimoniale: [''],
    secteurActivite: [''],
    autreTelephone: [''],
    // Affiliation
    regionAffiliation: [''],
    organismeAssureur: [''],
    ogd: [''],
    typeRegime: [''],
    typeBeneficiaire: [''],
    typeAdhesion: [''],
    // Résidence
    regionResidence: [''],
    departementResidence: [''],
    communeResidence: [''],
    // Pièce d'identité
    typePieceIdentite: [''],
    numeroPiece1: [''],
    numeroPiece2: [''],
    numeroPiece3: [''],
    // Paiement
    montantFraisAdhesion: [null as number | null],
    montantCotisation: [null as number | null],
    moyenPaiement: [''],
    montantVersement: [null as number | null],
    statutPaiement: [''],
    // Dépendants
    personnesACharge: this.fb.array([])
  });

  ngOnInit(): void {
    // Cascade résidence : région -> département -> commune
    this.enrolementForm.get('regionResidence')!.valueChanges.subscribe((r) => {
      this.filteredDepartements = DEPARTEMENTS.filter(d => d.region === r);
      this.filteredCommunes = [];
      this.enrolementForm.patchValue({ departementResidence: '', communeResidence: '' }, { emitEvent: false });
    });
    this.enrolementForm.get('departementResidence')!.valueChanges.subscribe((d) => {
      const r = this.enrolementForm.get('regionResidence')!.value;
      this.filteredCommunes = COMMUNES.filter(c => c.region === r && c.departement === d);
      this.enrolementForm.patchValue({ communeResidence: '' }, { emitEvent: false });
    });
    // Cascade affiliation : région -> OGD (la région d'affiliation porte le suffixe _region)
    this.enrolementForm.get('regionAffiliation')!.valueChanges.subscribe((r) => {
      const key = (r || '').replace('_region', '');
      this.filteredOgd = OGD.filter(o => o.region === key);
      this.enrolementForm.patchValue({ ogd: '' }, { emitEvent: false });
    });
  }

  get personnesACharge(): FormArray {
    return this.enrolementForm.get('personnesACharge') as FormArray;
  }

  addDependant(): void {
    this.personnesACharge.push(this.fb.group({
      prenom: [''], nom: [''], sexe: [''], dateNaissance: [''], lienParente: [''], telephone: ['']
    }));
  }

  removeDependant(index: number): void {
    this.personnesACharge.removeAt(index);
  }

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
          text: "L'enrôlement a été créé et est en cours de synchronisation avec KoboToolbox.",
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
