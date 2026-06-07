import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { BonCommandeService } from '../../../core/services/bon-commande.service';
import { LettreGarantieService } from '../../../core/services/lettre-garantie.service';
import { Patient } from '../../../core/models/patient.model';
import { BonCommande } from '../../../core/models/bon-commande.model';
import { LettreGarantie } from '../../../core/models/lettre-garantie.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in" *ngIf="patient">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-file-earmark-person-fill text-csu-primary"></i>
            Fiche Patient : {{ patient.prenom }} {{ patient.nom }}
          </h1>
          <p class="csu-page-subtitle">Dossier N° : {{ patient.numeroDossier }}</p>
        </div>
        <div class="d-flex gap-2">
          @if (patient && canModify(patient)) {
            <a [routerLink]="['/patients', patient.id, 'modifier']" class="csu-btn csu-btn-secondary">
              <i class="bi bi-pencil-fill"></i> Modifier la Fiche
            </a>
          }
          <a routerLink="/patients" class="csu-btn csu-btn-light">
            Retour
          </a>
        </div>
      </div>

      <div class="row g-3">
        <!-- Col 1: Patient Information Card -->
        <div class="col-12 col-lg-5">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <i class="bi bi-person-fill text-csu-primary"></i>
                Données Personnelles
              </h3>
            </div>
            
            <div class="d-flex flex-column gap-3">
              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Numéro de Dossier</span>
                <span class="fw-bold fs-5 text-csu-primary">{{ patient.numeroDossier }}</span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Catégorie de Prise en Charge</span>
                <span class="csu-badge font-semibold" [ngClass]="getCategoryBadgeClass(patient)">
                  {{ getCategoryLabel(patient) }}
                </span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Prénom & Nom</span>
                <span class="fw-semibold">{{ patient.prenom }} {{ patient.nom }}</span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Sexe</span>
                <span class="badge" [class.bg-info]="patient.sexe === 'M'" [class.bg-danger]="patient.sexe === 'F'">
                  {{ patient.sexe === 'M' ? 'Masculin' : 'Féminin' }}
                </span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Date de Naissance</span>
                <span>{{ patient.dateNaissance | date:'dd MMMM yyyy' }} ({{ calculateAge(patient.dateNaissance) }} ans)</span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">N° Téléphone</span>
                <span>{{ patient.telephone || '-' }}</span>
              </div>

              <div class="border-bottom pb-2">
                <span class="d-block small text-muted">Bureau CSU d'enregistrement</span>
                <span>{{ patient.bureauCsuNom || 'Bureau Principal' }}</span>
              </div>

              <div>
                <span class="d-block small text-muted">Date d'Enregistrement</span>
                <span>{{ patient.dateEnregistrement | date:'dd/MM/yyyy à HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 2: Localisation & Enrolement Status & Category Specific Cards -->
        <div class="col-12 col-lg-7">
          <div class="d-flex flex-column gap-4">
            
            <!-- Special Banner: Plan Sésame -->
            <div class="csu-card bg-light border-start border-warning border-4 py-3" *ngIf="getCategoryLabel(patient) === 'Plan Sésame'">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-heart-pulse-fill text-warning fs-3"></i>
                <div>
                  <h4 class="mb-1 text-warning fw-bold small text-uppercase">Régime Gratuité Plan Sésame</h4>
                  <p class="mb-0 text-muted small">Ce bénéficiaire est âgé de 60 ans ou plus et bénéficie de la gratuité des soins dans le cadre du Plan Sésame.</p>
                </div>
              </div>
            </div>

            <!-- Card: Localisation -->
            <div class="csu-card">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-geo-alt-fill text-csu-secondary"></i>
                  Localisation Géographique
                </h3>
              </div>
              <div class="row g-3">
                <div class="col-4">
                  <span class="d-block small text-muted">Région</span>
                  <span class="fw-semibold">{{ patient.region }}</span>
                </div>
                <div class="col-4">
                  <span class="d-block small text-muted">Département</span>
                  <span class="fw-semibold">{{ patient.departement }}</span>
                </div>
                <div class="col-4">
                  <span class="d-block small text-muted">Commune</span>
                  <span class="fw-semibold">{{ patient.commune }}</span>
                </div>
                <div class="col-12 mt-2">
                  <span class="d-block small text-muted">Adresse Complète</span>
                  <p class="mb-0 bg-light p-3 rounded text-secondary">{{ patient.adresse }}</p>
                </div>
              </div>
            </div>

            <!-- Card: Informations spécifiques à la catégorie -->
            <div class="csu-card" *ngIf="specInfo.length">
              <div class="csu-card-header">
                <h3 class="csu-card-title text-csu-primary">
                  <i class="bi bi-clipboard2-pulse text-primary"></i>
                  Informations spécifiques — {{ getCategoryLabel(patient) }}
                </h3>
              </div>
              <div class="row g-3">
                <ng-container *ngFor="let info of specInfo">
                  <div class="col-12" *ngIf="info.full">
                    <span class="d-block small text-muted">{{ info.label }}</span>
                    <p class="mb-0 text-secondary small bg-light p-2 rounded">{{ info.value }}</p>
                  </div>
                  <div class="col-6 border-bottom pb-2" *ngIf="!info.full">
                    <span class="d-block small text-muted">{{ info.label }}</span>
                    <span class="fw-semibold">{{ info.value }}</span>
                  </div>
                </ng-container>
              </div>
            </div>

            <!-- Card: Pièce d'Identité (Classique / Autre) -->
            <div class="csu-card" *ngIf="patient.photoIdentiteRecto || patient.photoIdentiteVerso">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-card-image text-secondary"></i>
                  Pièces d'Identité
                </h3>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-6" *ngIf="patient.photoIdentiteRecto">
                  <span class="d-block small text-muted mb-2">Recto</span>
                  <div class="identity-photo-wrapper" (click)="openLightbox(patient.photoIdentiteRecto, 'Recto - Pièce identité')">
                    <img [src]="patient.photoIdentiteRecto" class="img-fluid rounded border shadow-sm" alt="Recto de la pièce" />
                    <div class="photo-overlay"><i class="bi bi-zoom-in"></i> Agrandir</div>
                  </div>
                </div>
                <div class="col-12 col-md-6" *ngIf="patient.photoIdentiteVerso">
                  <span class="d-block small text-muted mb-2">Verso</span>
                  <div class="identity-photo-wrapper" (click)="openLightbox(patient.photoIdentiteVerso, 'Verso - Pièce identité')">
                    <img [src]="patient.photoIdentiteVerso" class="img-fluid rounded border shadow-sm" alt="Verso de la pièce" />
                    <div class="photo-overlay"><i class="bi bi-zoom-in"></i> Agrandir</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: Documents de prise en charge -->
            <div class="csu-card">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-folder2-open text-csu-primary"></i>
                  Documents de prise en charge
                </h3>
              </div>

              <div class="doc-stats">
                <!-- Lettre de garantie -->
                <a [routerLink]="['/patients', patient.id, 'lettre-garantie']" class="doc-card lg">
                  <div class="doc-ic"><i class="bi bi-shield-check"></i></div>
                  <div class="doc-body">
                    <span class="doc-num">{{ loadingLettres ? '…' : nbLettres }}</span>
                    <span class="doc-lbl">Lettre(s) de garantie</span>
                  </div>
                  <i class="bi bi-printer doc-go"></i>
                </a>

                <!-- Bons de commande -->
                <a routerLink="/bons-commande/nouveau" [queryParams]="{ patientId: patient.id }" class="doc-card bc">
                  <div class="doc-ic"><i class="bi bi-receipt-cutoff"></i></div>
                  <div class="doc-body">
                    <span class="doc-num">{{ loadingBons ? '…' : nbBons }}</span>
                    <span class="doc-lbl">Bon(s) de commande</span>
                  </div>
                  <i class="bi bi-plus-lg doc-go"></i>
                </a>
              </div>

              @if (!loadingLettres) {
                @if (lettreActive) {
                  <div class="lg-status active">
                    <i class="bi bi-shield-fill-check"></i>
                    Lettre <b>{{ lettreActive.reference }}</b> valable jusqu'au <b>{{ lettreActive.dateExpiration | date:'dd/MM/yyyy' }}</b> — réutilisable, ne pas réémettre.
                  </div>
                } @else {
                  <div class="lg-status none">
                    <i class="bi bi-exclamation-triangle"></i>
                    Aucune lettre de garantie active. <a [routerLink]="['/patients', patient.id, 'lettre-garantie']">Émettre une lettre</a> (valable 2 semaines).
                  </div>
                }
              }

              @if (bons.length > 0) {
                <div class="bon-list">
                  @for (b of bons; track b.id) {
                    <a [routerLink]="['/bons-commande', b.id]" class="bon-row">
                      <span class="bon-ref">{{ b.reference }}</span>
                      <span class="bon-date">{{ b.dateCreation | date:'dd/MM/yyyy' }}</span>
                      <span class="bon-pharm text-truncate">{{ b.pharmacieNom || '—' }}</span>
                      <span class="bon-statut" [ngClass]="bonStatutClass(b.statut)">{{ bonStatutLabel(b.statut) }}</span>
                    </a>
                  }
                </div>
              } @else if (!loadingBons) {
                <p class="small text-muted mb-0 mt-2"><i class="bi bi-info-circle"></i> Aucun bon de commande émis pour ce patient.</p>
              }
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Overlay -->
    @if (lightboxOpen) {
      <div class="lightbox-overlay" (click)="closeLightbox()" (keydown.escape)="closeLightbox()" tabindex="0">
        <button class="lightbox-close" (click)="closeLightbox()">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="lightbox-caption">{{ lightboxCaption }}</div>
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="lightboxSrc" [alt]="lightboxCaption" />
        </div>
      </div>
    }
  `,
  styles: [`
    .hover-primary:hover {
      color: var(--csu-primary) !important;
    }
    .identity-photo-wrapper {
      max-height: 140px;
      overflow: hidden;
      border-radius: 12px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      cursor: pointer;
      position: relative;
    }
    .identity-photo-wrapper img {
      max-height: 128px;
      object-fit: contain;
      width: 100%;
      transition: transform 0.3s ease;
    }
    .identity-photo-wrapper:hover img {
      transform: scale(1.05);
    }
    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 700;
      border-radius: 12px;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .identity-photo-wrapper:hover .photo-overlay {
      opacity: 1;
    }

    /* Lightbox */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.88);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      animation: lightbox-in 0.25s ease;
      cursor: zoom-out;
    }
    @keyframes lightbox-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .lightbox-close {
      position: absolute;
      top: 16px;
      right: 20px;
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      font-size: 1.5rem;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: background 0.2s ease, transform 0.2s ease;
      z-index: 10000;
    }
    .lightbox-close:hover {
      background: rgba(255,255,255,0.3);
      transform: scale(1.1);
    }
    .lightbox-caption {
      position: absolute;
      top: 24px;
      left: 24px;
      color: rgba(255,255,255,0.8);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .lightbox-content {
      max-width: 92vw;
      max-height: 88vh;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }
    .lightbox-content img {
      max-width: 100%;
      max-height: 85vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 12px 60px rgba(0,0,0,0.5);
    }

    /* Documents de prise en charge */
    .doc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .doc-card { display: flex; align-items: center; gap: 11px; padding: 0.85rem; border-radius: 14px; text-decoration: none;
      border: 1px solid rgba(0,0,0,0.06); background: var(--csu-bg, #f8fafc); position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .doc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -12px rgba(0,0,0,0.25); }
    .doc-ic { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; font-size: 1.2rem; color: #fff; flex-shrink: 0; }
    .doc-card.lg .doc-ic { background: linear-gradient(135deg,#00875A,#00C67B); }
    .doc-card.bc .doc-ic { background: linear-gradient(135deg,#00838F,#26C6DA); }
    .doc-body { display: flex; flex-direction: column; line-height: 1.1; }
    .doc-num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; color: var(--csu-text); }
    .doc-lbl { font-size: 0.74rem; color: var(--csu-text-muted); font-weight: 600; }
    .doc-go { position: absolute; top: 0.7rem; right: 0.8rem; color: var(--csu-text-muted); font-size: 0.9rem; }

    .lg-status { display: flex; align-items: center; gap: 8px; margin-top: 0.85rem; padding: 8px 12px; border-radius: 10px; font-size: 0.8rem; line-height: 1.35; }
    .lg-status.active { background: rgba(67,160,71,0.1); color: #1B5E20; }
    .lg-status.none { background: rgba(245,124,0,0.1); color: #E65100; }
    .lg-status a { font-weight: 700; color: inherit; text-decoration: underline; }

    .bon-list { display: flex; flex-direction: column; margin-top: 0.9rem; }
    .bon-row { display: grid; grid-template-columns: 1.4fr 1fr 1.6fr auto; align-items: center; gap: 8px; padding: 8px 6px;
      border-bottom: 1px solid rgba(0,0,0,0.05); text-decoration: none; color: inherit; transition: background 0.15s ease; }
    .bon-row:last-child { border-bottom: none; }
    .bon-row:hover { background: var(--csu-bg, #f6f8fa); }
    .bon-ref { font-family: monospace; font-weight: 700; font-size: 0.8rem; color: var(--csu-primary); }
    .bon-date { font-size: 0.78rem; color: var(--csu-text-muted); }
    .bon-pharm { font-size: 0.8rem; }
    .bon-statut { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; white-space: nowrap; }
    .bon-statut.st-attente { background: rgba(245,124,0,0.12); color: #E65100; }
    .bon-statut.st-delivre { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .bon-statut.st-annule { background: rgba(229,57,53,0.1); color: #C62828; }

    @media (max-width: 576px) {
      .doc-stats { grid-template-columns: 1fr; }
      .bon-row { grid-template-columns: 1fr auto; }
      .bon-date, .bon-pharm { display: none; }
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private bonCommandeService = inject(BonCommandeService);
  private lettreService = inject(LettreGarantieService);

  patient?: Patient;
  specInfo: { label: string; value: string; full?: boolean }[] = [];

  // Lightbox state
  lightboxOpen = false;
  lightboxSrc = '';
  lightboxCaption = '';

  bons: BonCommande[] = [];
  nbBons = 0;
  loadingBons = true;

  lettres: LettreGarantie[] = [];
  nbLettres = 0;
  lettreActive: LettreGarantie | null = null;
  loadingLettres = true;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadPatientDetail(id);
    this.loadBons(id);
    this.loadLettres(id);
  }

  openLightbox(src: string, caption: string): void {
    this.lightboxSrc = src;
    this.lightboxCaption = caption;
    this.lightboxOpen = true;
    // Listen for Escape key
    document.addEventListener('keydown', this._escHandler);
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxSrc = '';
    this.lightboxCaption = '';
    document.removeEventListener('keydown', this._escHandler);
  }

  private _escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeLightbox();
  };

  loadLettres(patientId: number): void {
    this.loadingLettres = true;
    this.lettreService.getByPatient(patientId).subscribe({
      next: (list) => {
        this.lettres = list;
        this.nbLettres = list.length;
        const today = new Date().setHours(0, 0, 0, 0);
        this.lettreActive = list.find(l => new Date(l.dateExpiration).getTime() >= today) || null;
        this.loadingLettres = false;
      },
      error: () => {
        this.lettres = [];
        this.nbLettres = 0;
        this.lettreActive = null;
        this.loadingLettres = false;
      }
    });
  }

  loadBons(patientId: number): void {
    this.loadingBons = true;
    this.bonCommandeService.getBonsByPatient(patientId).subscribe({
      next: (list) => {
        this.bons = list;
        this.nbBons = list.length;
        this.loadingBons = false;
      },
      error: () => {
        this.bons = [];
        this.nbBons = 0;
        this.loadingBons = false;
      }
    });
  }

  bonStatutLabel(s: string): string {
    return { EN_ATTENTE: 'En attente', DELIVRE: 'Délivré', ANNULE: 'Annulé' }[s] || s;
  }

  bonStatutClass(s: string): string {
    return { EN_ATTENTE: 'st-attente', DELIVRE: 'st-delivre', ANNULE: 'st-annule' }[s] || 'st-attente';
  }

  loadPatientDetail(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.specInfo = this.specificInfo(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du patient:', err);
        this.patient = undefined;
        Swal.fire('Erreur', 'Impossible de charger les détails du patient.', 'error');
      }
    });
  }

  canModify(patient: Patient): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERVISEUR') return true;
    return patient.agentId === user.agent_id;
  }

  calculateAge(dateString?: string): number {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private static LABELS: Record<string, string> = {
    'classique': 'Classique',
    '0-5ans': 'Enfants de moins de 5 ans',
    'cesarienne': 'Césarienne',
    'dialyse-peritoneale': 'Dialyse péritonéale',
    'hemodialyse': 'Hémodialyse',
    'bsf': 'Bourse de Sécurité Familiale',
    'cec': 'Carte Égalité des Chances',
    'plan-sesame': 'Plan Sésame',
    'ndongo-dara': 'Plan Ndongo Dara / Élève'
  };

  getCategoryLabel(patient: Patient): string {
    if (patient.categorie && PatientDetailComponent.LABELS[patient.categorie]) {
      return PatientDetailComponent.LABELS[patient.categorie];
    }
    const age = this.calculateAge(patient.dateNaissance);
    if (age <= 5) return 'Enfants de moins de 5 ans';
    if (age >= 60) return 'Plan Sésame';
    if (patient.photoIdentiteRecto || patient.photoIdentiteVerso) return 'Classique';
    if (patient.sexe === 'F') return 'Césarienne';
    return 'Autre';
  }


  getCategoryBadgeClass(patient: Patient): string {
    switch (patient.categorie) {
      case '0-5ans': return 'csu-badge-primary';
      case 'plan-sesame': return 'csu-badge-warning';
      case 'classique': return 'csu-badge-success';
      case 'cesarienne': return 'csu-badge-danger';
      default: return 'csu-badge-secondary';
    }
  }

  /** Construit la liste des champs spécifiques (renseignés) selon la catégorie du patient. */
  specificInfo(p: Patient): { label: string; value: string; full?: boolean }[] {
    const out: { label: string; value: string; full?: boolean }[] = [];
    const add = (label: string, value: any, full = false) => {
      if (value !== null && value !== undefined && `${value}`.trim() !== '') {
        out.push({ label, value: `${value}`, full });
      }
    };
    // Formatage déterministe (sans toLocale*) pour rester cohérent entre rendu serveur (SSR) et navigateur
    const d = (v?: string) => {
      if (!v) return '';
      const parts = v.split('T')[0].split('-');
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : v;
    };
    const dh = (v?: string) => {
      if (!v) return '';
      const [datePart, timePart] = v.split('T');
      const parts = datePart.split('-');
      const t = (timePart || '').slice(0, 5);
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}${t ? ' ' + t : ''}` : v;
    };

    add('N° dans le registre', p.numeroRegistre);
    add('N° Matricule', p.numeroMatricule);
    add('N° Matricule / Extrait / Accompagnant', p.matriculeExtraitAccompagnant);
    add('N° CNI', p.numeroCni);
    add('IRC / IRA', p.ircIra);
    add('Date de prise en charge', d(p.datePriseEnCharge));
    add('Service', p.service);
    add('Indication / Motif de CBT', p.indicationMotifCbt, true);
    add('N° Registre Bloc opératoire', p.numeroRegistreBloc);
    add('Date et Heure Intervention', dh(p.dateHeureIntervention));
    add('Durée Hospitalisation (jours)', p.dureeHospitalisationJours);
    add('Prestation(s)', p.prestationMedicament, true);
    add('Diagnostic / Motif de consultation', p.diagnosticMotif, true);
    add('Nbre de Poches', p.nbrePoches);
    add('Nbre de Séances', p.nbreSeances);
    add('Quantité', p.quantite);
    add('Forfait', p.forfait);
    add('Prix Unitaire', p.prixUnitaire);
    add('Montant Total', p.montantTotal);
    return out;
  }
}
