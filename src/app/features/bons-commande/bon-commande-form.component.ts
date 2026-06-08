import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { PatientService } from '../../core/services/patient.service';
import { PharmacieService } from '../../core/services/pharmacie.service';
import { AuthService } from '../../core/services/auth.service';
import { Patient } from '../../core/models/patient.model';
import { Pharmacie } from '../../core/models/pharmacie.model';
import { STATUT_BON_OPTIONS } from '../../core/models/bon-commande.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bon-commande-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-receipt-cutoff text-csu-primary"></i>
            {{ isEditMode ? 'Modifier le Bon de Commande' : 'Nouveau Bon de Commande' }}
          </h1>
          <p class="csu-page-subtitle">
            Établissez un bon à remettre au patient et orientez-le vers une pharmacie conventionnée.
          </p>
        </div>
        <div>
          <a routerLink="/bons-commande" class="csu-btn csu-btn-light"><i class="bi bi-arrow-left"></i> Retour</a>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row g-4">
          <!-- Colonne principale -->
          <div class="col-12 col-xl-8">

            <!-- Patient -->
            <div class="csu-card mb-4">
              <h4 class="mb-3 text-csu-primary"><i class="bi bi-person-vcard me-2"></i> Patient bénéficiaire</h4>

              @if (patientLocked && selectedPatient) {
                <div class="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold text-csu-primary">{{ selectedPatient.prenom }} {{ selectedPatient.nom }}</div>
                    <div class="small text-muted">Dossier {{ selectedPatient.numeroDossier }} · {{ selectedPatient.telephone }}</div>
                    <div class="small text-success"><i class="bi bi-shield-check"></i> Lettre de garantie : {{ selectedPatient.numeroDossier }}</div>
                  </div>
                  <button type="button" class="csu-btn csu-btn-light btn-sm" (click)="changerPatient()">
                    <i class="bi bi-arrow-repeat"></i> Changer
                  </button>
                </div>
              } @else {
                <div class="csu-search-input m-0 w-100 mb-2">
                  <i class="bi bi-search"></i>
                  <input type="text" placeholder="Rechercher un patient (nom, dossier, téléphone)..."
                         [value]="patientSearch" (input)="onPatientSearch($any($event.target).value)" />
                </div>
                @if (searchingPatients) {
                  <div class="small text-muted"><span class="spinner-border spinner-border-sm me-1"></span> Recherche...</div>
                } @else if (patientResults.length > 0) {
                  <div class="list-group">
                    @for (p of patientResults; track p.id) {
                      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                              (click)="selectPatient(p)">
                        <span><strong>{{ p.prenom }} {{ p.nom }}</strong> <span class="small text-muted">— {{ p.numeroDossier }}</span></span>
                        <i class="bi bi-chevron-right text-muted"></i>
                      </button>
                    }
                  </div>
                } @else if (patientSearch.length >= 2) {
                  <div class="small text-muted">Aucun patient trouvé.</div>
                }
                @if (isFieldInvalid('patientId')) {
                  <div class="csu-invalid-feedback d-block mt-2"><i class="bi bi-info-circle"></i> Sélectionnez un patient</div>
                }
              }
            </div>

            <!-- Type de circuit (format officiel SEN-CSU) -->
            <div class="csu-card mb-4">
              <h4 class="mb-1 text-csu-primary"><i class="bi bi-box-seam me-2"></i> Type de circuit</h4>
              <p class="small text-muted mb-3">
                Sélectionnez le type de circuit du médicament.
              </p>
              <div class="d-flex gap-4">
                <div class="form-check">
                  <input class="form-check-input" type="radio" formControlName="typeCircuit" value="PUBLIQUE" id="circuitPublique" />
                  <label class="form-check-label" for="circuitPublique">
                    <strong>Circuit Publique</strong> <span class="text-muted">(PEC 80%)</span>
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" formControlName="typeCircuit" value="OFFICINE" id="circuitOfficine" />
                  <label class="form-check-label" for="circuitOfficine">
                    <strong>Circuit d'Officine</strong> <span class="text-muted">(PEC 50%)</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Ordonnance médicale -->
            <div class="csu-card mb-4">
              <h4 class="mb-1 text-csu-primary"><i class="bi bi-clipboard2-pulse me-2"></i> Ordonnance médicale</h4>
              <p class="small text-muted mb-3">
                Bon émis suite à l'ordonnance du médecin, lorsque l'établissement ne dispose pas des médicaments prescrits.
              </p>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Médecin prescripteur</label>
                  <input type="text" class="csu-form-control" formControlName="medecinPrescripteur" placeholder="Ex: Dr. Diallo" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Date de l'ordonnance</label>
                  <input type="date" class="csu-form-control" formControlName="dateOrdonnance" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Structure de santé</label>
                  <input type="text" class="csu-form-control" formControlName="structureSante" placeholder="Ex: Centre de Santé de Pikine" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Établissement / Service</label>
                  <input type="text" class="csu-form-control" formControlName="serviceHopital" placeholder="Ex: Hôpital Principal — Cardiologie" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Motif du bon</label>
                  <input type="text" class="csu-form-control" formControlName="motif"
                         placeholder="Médicaments non disponibles à l'établissement" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Taux de prise en charge</label>
                  <input type="text" class="csu-form-control" formControlName="tauxPriseEnCharge" placeholder="Ex: 80%" />
                </div>
              </div>
            </div>

            <!-- Lignes -->
            <div class="csu-card mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="m-0 text-csu-primary"><i class="bi bi-capsule-pill me-2"></i> Médicaments prescrits à acheter</h4>
                <button type="button" class="csu-btn csu-btn-light btn-sm" (click)="addLigne()">
                  <i class="bi bi-plus-lg"></i> Ajouter une ligne
                </button>
              </div>

              <div formArrayName="lignes" class="d-flex flex-column gap-3">
                @for (ligne of lignes.controls; track $index) {
                  <div [formGroupName]="$index" class="row g-2 align-items-end border-bottom pb-3">
                    <div class="col-12 col-md-4">
                      <label class="csu-form-label small">Désignation <span class="text-danger">*</span></label>
                      <input type="text" class="csu-form-control" formControlName="designation"
                             placeholder="Ex: Paracétamol 500mg" />
                    </div>
                    <div class="col-4 col-md-2">
                      <label class="csu-form-label small">Qté</label>
                      <input type="number" min="1" class="csu-form-control" formControlName="quantite" placeholder="1" />
                    </div>
                    <div class="col-4 col-md-2">
                      <label class="csu-form-label small">Prix Unitaire</label>
                      <input type="number" min="0" step="any" class="csu-form-control" formControlName="prixUnitaire" placeholder="FCFA" />
                    </div>
                    <div class="col-4 col-md-3">
                      <label class="csu-form-label small">Posologie / Instructions</label>
                      <input type="text" class="csu-form-control" formControlName="posologie" placeholder="Ex: 1 cp x 3/j" />
                    </div>
                    <div class="col-12 col-md-1 text-end">
                      <button type="button" class="csu-btn-icon danger" (click)="removeLigne($index)" title="Retirer" [disabled]="lignes.length === 1">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>
              @if (lignes.invalid && lignes.touched) {
                <div class="csu-invalid-feedback d-block mt-2"><i class="bi bi-info-circle"></i> Chaque ligne doit avoir une désignation.</div>
              }
            </div>

            <!-- Montants & Observations -->
            <div class="csu-card mb-4">
              <h4 class="mb-3 text-csu-primary"><i class="bi bi-cash-stack me-2"></i> Montants & Suivi</h4>
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Montant estimé (FCFA)</label>
                  <input type="number" min="0" step="any" class="csu-form-control" formControlName="montantEstime" placeholder="Total général" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Montant à payer par le patient (FCFA)</label>
                  <input type="number" min="0" step="any" class="csu-form-control" formControlName="montantPatient" placeholder="Part patient" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="csu-form-label">Montant à facturer au tiers payant (FCFA)</label>
                  <input type="number" min="0" step="any" class="csu-form-control" formControlName="montantTiersPayant" placeholder="Part tiers payant" />
                </div>
                <div class="col-12 col-md-6">
                  <label class="csu-form-label">Statut du bon</label>
                  <select class="csu-form-control csu-form-select" formControlName="statut">
                    @for (s of statutOptions; track s) {
                      <option [value]="s">{{ statutLabel(s) }}</option>
                    }
                  </select>
                </div>
                <div class="col-12">
                  <label class="csu-form-label">Observations</label>
                  <textarea rows="2" class="csu-form-control" formControlName="observations"
                            placeholder="Remarques à l'attention du patient ou de la pharmacie..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne latérale : pharmacie conventionnée -->
          <div class="col-12 col-xl-4">
            <div class="csu-card">
              <h4 class="mb-2 text-csu-secondary"><i class="bi bi-shop me-2"></i> Pharmacie conventionnée</h4>
              <p class="small text-muted mb-3">
                Suggérez au patient une pharmacie ayant une <strong>convention signée</strong>.
              </p>

              @if (loadingPharmacies) {
                <div class="small text-muted"><span class="spinner-border spinner-border-sm me-1"></span> Chargement...</div>
              } @else if (pharmaciesSignees.length === 0) {
                <div class="csu-empty-state py-3">
                  <i class="bi bi-shop-window text-muted"></i>
                  <p class="small mb-2">Aucune pharmacie avec convention signée.</p>
                  <a routerLink="/admin/pharmacies/nouvelle" class="small">Ajouter une pharmacie</a>
                </div>
              } @else {
                <div class="csu-form-group mb-3">
                  <label class="csu-form-label">Choisir une pharmacie</label>
                  <select class="csu-form-control csu-form-select" formControlName="pharmacieId" (change)="onPharmacieChange()">
                    <option [ngValue]="null">— Aucune (à préciser) —</option>
                    @for (ph of pharmaciesSignees; track ph.id) {
                      <option [ngValue]="ph.id">{{ ph.nom }}{{ ph.commune ? ' · ' + ph.commune : '' }}</option>
                    }
                  </select>
                </div>

                @if (selectedPharmacie) {
                  <div class="p-3 bg-light rounded">
                    <div class="fw-bold text-csu-secondary">{{ selectedPharmacie.nom }}</div>
                    @if (selectedPharmacie.adresse) { <div class="small"><i class="bi bi-geo-alt"></i> {{ selectedPharmacie.adresse }}</div> }
                    @if (selectedPharmacie.commune) { <div class="small text-muted">{{ selectedPharmacie.commune }}{{ selectedPharmacie.region ? ', ' + selectedPharmacie.region : '' }}</div> }
                    @if (selectedPharmacie.telephone) { <div class="small"><i class="bi bi-telephone"></i> {{ selectedPharmacie.telephone }}</div> }
                    @if (selectedPharmacie.latitude != null && selectedPharmacie.longitude != null) {
                      <a class="small text-decoration-none mt-1 d-inline-block"
                         [href]="'https://www.google.com/maps?q=' + selectedPharmacie.latitude + ',' + selectedPharmacie.longitude"
                         target="_blank" rel="noopener"><i class="bi bi-map"></i> Voir sur la carte</a>
                    }
                  </div>
                  @if (patientCommuneSuggestion) {
                    <p class="small text-success mt-2 mb-0"><i class="bi bi-check-circle"></i> {{ patientCommuneSuggestion }}</p>
                  }
                }
              }
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex justify-content-end gap-3 border-top pt-4 mt-2">
          <button type="button" routerLink="/bons-commande" class="csu-btn csu-btn-light">Annuler</button>
          <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
            @if (submitting) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span> Enregistrement...
            } @else {
              <i class="bi bi-check-lg me-1"></i> {{ isEditMode ? 'Enregistrer' : 'Créer le bon' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class BonCommandeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bonService = inject(BonCommandeService);
  private patientService = inject(PatientService);
  private pharmacieService = inject(PharmacieService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  bonId?: number;
  submitting = false;

  statutOptions = STATUT_BON_OPTIONS;

  // Patient
  patientSearch = '';
  patientResults: Patient[] = [];
  searchingPatients = false;
  selectedPatient?: Patient;
  patientLocked = false;
  private searchTimer?: any;

  // Pharmacies
  pharmaciesSignees: Pharmacie[] = [];
  loadingPharmacies = false;
  selectedPharmacie?: Pharmacie;
  patientCommuneSuggestion = '';

  form = this.fb.group({
    patientId: [null as number | null, [Validators.required]],
    patientNom: [''],
    numeroDossier: [''],
    referenceLettreGarantie: [''],
    typeCircuit: ['PUBLIQUE'],
    structureSante: [''],
    medecinPrescripteur: [''],
    serviceHopital: [''],
    dateOrdonnance: [null as string | null],
    motif: ["Médicaments non disponibles à l'établissement de santé"],
    tauxPriseEnCharge: [''],
    pharmacieId: [null as number | null],
    statut: ['EN_ATTENTE'],
    montantEstime: [null as number | null],
    montantPatient: [null as number | null],
    montantTiersPayant: [null as number | null],
    observations: [''],
    lignes: this.fb.array([this.createLigne()])
  });

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  private createLigne(): FormGroup {
    return this.fb.group({
      designation: ['', [Validators.required]],
      quantite: [1 as number | null],
      posologie: [''],
      prixUnitaire: [null as number | null]
    });
  }

  ngOnInit(): void {
    this.loadPharmacies();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.bonId = +idParam;
      this.loadBon(this.bonId);
      return;
    }

    // Prefill depuis la fiche patient (?patientId=)
    const patientIdParam = this.route.snapshot.queryParamMap.get('patientId');
    if (patientIdParam) {
      this.patientService.getPatientById(+patientIdParam).subscribe({
        next: (p) => this.selectPatient(p, true),
        error: () => {}
      });
    }
  }

  addLigne(): void { this.lignes.push(this.createLigne()); }
  removeLigne(i: number): void { if (this.lignes.length > 1) this.lignes.removeAt(i); }

  statutLabel(s: string): string {
    return { EN_ATTENTE: 'En attente', DELIVRE: 'Délivré', ANNULE: 'Annulé' }[s] || s;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // ---- Patient ----
  onPatientSearch(value: string): void {
    this.patientSearch = value;
    clearTimeout(this.searchTimer);
    if (value.trim().length < 2) { this.patientResults = []; return; }
    this.searchTimer = setTimeout(() => {
      this.searchingPatients = true;
      this.patientService.getPatients(0, 8, value.trim()).subscribe({
        next: (res) => { this.patientResults = res.content; this.searchingPatients = false; },
        error: () => { this.patientResults = []; this.searchingPatients = false; }
      });
    }, 300);
  }

  selectPatient(p: Patient, lock = true): void {
    this.selectedPatient = p;
    this.patientLocked = lock;
    this.patientResults = [];
    this.patientSearch = '';
    this.form.patchValue({
      patientId: p.id ?? null,
      patientNom: `${p.prenom} ${p.nom}`,
      numeroDossier: p.numeroDossier,
      referenceLettreGarantie: p.numeroDossier
    });
    // Pré-remplit l'établissement depuis le dossier patient si présent et champ vide
    if (p.service && !this.form.get('serviceHopital')?.value) {
      this.form.patchValue({ serviceHopital: p.service });
    }
    this.suggererPharmacie(p);
  }

  changerPatient(): void {
    this.patientLocked = false;
    this.selectedPatient = undefined;
    this.form.patchValue({ patientId: null, patientNom: '', numeroDossier: '' });
  }

  // ---- Pharmacies ----
  private loadPharmacies(): void {
    this.loadingPharmacies = true;
    this.pharmacieService.getAllPharmacies().subscribe({
      next: (list) => {
        this.pharmaciesSignees = list.filter(p => p.statutConvention === 'SIGNEE');
        this.loadingPharmacies = false;
        if (this.selectedPatient) this.suggererPharmacie(this.selectedPatient);
        this.syncSelectedPharmacie();
      },
      error: () => { this.pharmaciesSignees = []; this.loadingPharmacies = false; }
    });
  }

  /** Pré-sélectionne automatiquement une pharmacie de la même commune/région que le patient. */
  private suggererPharmacie(p: Patient): void {
    if (this.form.get('pharmacieId')?.value) return; // ne pas écraser un choix manuel
    if (this.pharmaciesSignees.length === 0) return;

    const match = this.pharmaciesSignees.find(ph => ph.commune && p.commune && ph.commune.toLowerCase() === p.commune.toLowerCase())
      || this.pharmaciesSignees.find(ph => ph.region && p.region && ph.region.toLowerCase() === p.region.toLowerCase());

    if (match) {
      this.form.patchValue({ pharmacieId: match.id ?? null });
      this.selectedPharmacie = match;
      this.patientCommuneSuggestion = match.commune && p.commune && match.commune.toLowerCase() === p.commune.toLowerCase()
        ? `Pharmacie proposée car située dans la même commune que le patient (${match.commune}).`
        : `Pharmacie proposée car située dans la même région que le patient.`;
    }
  }

  onPharmacieChange(): void {
    this.patientCommuneSuggestion = '';
    this.syncSelectedPharmacie();
  }

  private syncSelectedPharmacie(): void {
    const id = this.form.get('pharmacieId')?.value;
    this.selectedPharmacie = this.pharmaciesSignees.find(p => p.id === id);
  }

  // ---- Load / Submit ----
  loadBon(id: number): void {
    this.bonService.getBonById(id).subscribe({
      next: (bon) => {
        // patient
        if (bon.patientId) {
          this.selectedPatient = {
            id: bon.patientId, prenom: '', nom: bon.patientNom || '', numeroDossier: bon.numeroDossier || ''
          } as Patient;
          // affichage simplifié : on garde le nom snapshot
          this.selectedPatient = { ...this.selectedPatient, prenom: bon.patientNom || '', nom: '' } as Patient;
          this.patientLocked = true;
        }
        // lignes
        this.lignes.clear();
        (bon.lignes && bon.lignes.length ? bon.lignes : [{ designation: '' }]).forEach(l => {
          this.lignes.push(this.fb.group({
            designation: [l.designation, [Validators.required]],
            quantite: [l.quantite ?? 1],
            posologie: [l.posologie ?? ''],
            prixUnitaire: [l.prixUnitaire ?? null]
          }));
        });
        this.form.patchValue({
          patientId: bon.patientId ?? null,
          patientNom: bon.patientNom ?? '',
          numeroDossier: bon.numeroDossier ?? '',
          referenceLettreGarantie: bon.referenceLettreGarantie ?? bon.numeroDossier ?? '',
          typeCircuit: bon.typeCircuit ?? 'PUBLIQUE',
          structureSante: bon.structureSante ?? '',
          medecinPrescripteur: bon.medecinPrescripteur ?? '',
          serviceHopital: bon.serviceHopital ?? '',
          dateOrdonnance: bon.dateOrdonnance ?? null,
          motif: bon.motif ?? '',
          tauxPriseEnCharge: bon.tauxPriseEnCharge ?? '',
          pharmacieId: bon.pharmacieId ?? null,
          statut: bon.statut,
          montantEstime: bon.montantEstime ?? null,
          montantPatient: bon.montantPatient ?? null,
          montantTiersPayant: bon.montantTiersPayant ?? null,
          observations: bon.observations ?? ''
        });
        this.syncSelectedPharmacie();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger le bon.', 'error');
        this.router.navigate(['/bons-commande']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.lignes.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const raw = this.form.getRawValue() as any;
    const ph = this.selectedPharmacie;

    const payload = {
      ...raw,
      pharmacieNom: ph?.nom ?? null,
      pharmacieAdresse: ph?.adresse ?? null,
      pharmacieTelephone: ph?.telephone ?? null
    };

    const obs = this.isEditMode
      ? this.bonService.updateBon(this.bonId!, payload)
      : this.bonService.createBon(payload);

    obs.subscribe({
      next: (saved) => {
        this.submitting = false;
        Swal.fire({
          title: this.isEditMode ? 'Bon mis à jour' : 'Bon créé',
          text: 'Vous pouvez maintenant l\'imprimer pour le patient.',
          icon: 'success',
          confirmButtonColor: '#00875A',
          showCancelButton: true,
          confirmButtonText: 'Voir / Imprimer',
          cancelButtonText: 'Retour à la liste'
        }).then((r) => {
          if (r.isConfirmed && saved.id) {
            this.router.navigate(['/bons-commande', saved.id]);
          } else {
            this.router.navigate(['/bons-commande']);
          }
        });
      },
      error: () => {
        this.submitting = false;
        Swal.fire('Erreur', "L'enregistrement a échoué.", 'error');
      }
    });
  }
}
