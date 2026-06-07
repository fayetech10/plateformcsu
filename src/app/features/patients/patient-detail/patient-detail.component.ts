import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { EnrolementService } from '../../../core/services/enrolement.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/patient.model';
import { Enrolement } from '../../../core/models/enrolement.model';
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
          <a [routerLink]="['/patients', patient.id, 'lettre-garantie']" class="csu-btn csu-btn-light">
            <i class="bi bi-shield-check"></i> Lettre de garantie
          </a>
          <a routerLink="/bons-commande/nouveau" [queryParams]="{ patientId: patient.id }" class="csu-btn csu-btn-primary">
            <i class="bi bi-receipt-cutoff"></i> Bon de commande
          </a>
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
                  <div class="identity-photo-wrapper">
                    <img [src]="patient.photoIdentiteRecto" class="img-fluid rounded border shadow-sm" alt="Recto de la pièce" />
                  </div>
                </div>
                <div class="col-12 col-md-6" *ngIf="patient.photoIdentiteVerso">
                  <span class="d-block small text-muted mb-2">Verso</span>
                  <div class="identity-photo-wrapper">
                    <img [src]="patient.photoIdentiteVerso" class="img-fluid rounded border shadow-sm" alt="Verso de la pièce" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Card: Enrolement Info -->
            <div class="csu-card">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-shield-fill-check text-success"></i>
                  Statut d'Enrôlement CSU
                </h3>
              </div>

              @if (enrolement) {
                <div class="p-3 bg-light rounded d-flex flex-column gap-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="d-block small text-muted">Numéro de Bénéficiaire CSU</span>
                      <span class="fw-bold text-csu-secondary">{{ enrolement.numeroBeneficiaire }}</span>
                    </div>
                    <div>
                      <span class="badge" 
                        [class.csu-badge-primary]="enrolement.statut === 'EN_COURS'" 
                        [class.csu-badge-success]="enrolement.statut === 'VALIDE'" 
                        [class.csu-badge-danger]="enrolement.statut === 'REJETE'"
                        [class.csu-badge-warning]="enrolement.statut === 'SUSPENDU'">
                        {{ enrolement.statut }}
                      </span>
                    </div>
                  </div>

                  <div class="row g-3">
                    <div class="col-6">
                      <span class="d-block small text-muted">Date d'Enrôlement</span>
                      <span class="fw-semibold">{{ enrolement.dateEnrolement | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="col-6">
                      <span class="d-block small text-muted">Agent Enrôleur</span>
                      <span>{{ enrolement.agentNom || 'Système' }}</span>
                    </div>
                  </div>

                  @if (enrolement.observations) {
                    <div class="mt-2 border-top pt-2">
                      <span class="d-block small text-muted">Observations</span>
                      <p class="mb-0 small text-muted italic">"{{ enrolement.observations }}"</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="csu-empty-state py-4">
                  <i class="bi bi-shield-slash text-muted" style="font-size: 2.5rem;"></i>
                  <h3>Non enrôlé</h3>
                  <p class="mb-3">Ce patient n'est pas encore affilié au programme Couverture Sanitaire Universelle.</p>
                  <a [routerLink]="['/enrolements/nouveau']" [queryParams]="{ patientId: patient.id }" class="csu-btn csu-btn-primary">
                    <i class="bi bi-plus-circle-fill"></i> Procéder à l'enrôlement
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
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
    }
    .identity-photo-wrapper img {
      max-height: 128px;
      object-fit: contain;
      width: 100%;
      transition: transform 0.3s ease;
    }
    .identity-photo-wrapper img:hover {
      transform: scale(1.05);
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private enrolementService = inject(EnrolementService);
  private authService = inject(AuthService);

  patient?: Patient;
  enrolement?: Enrolement;
  specInfo: { label: string; value: string; full?: boolean }[] = [];

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadPatientDetail(id);
  }

  loadPatientDetail(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.specInfo = this.specificInfo(data);
        this.checkEnrolement(id);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du patient:', err);
        this.patient = undefined;
        Swal.fire('Erreur', 'Impossible de charger les détails du patient.', 'error');
      }
    });
  }

  checkEnrolement(patientId: number): void {
    this.enrolementService.getEnrolements(0, 10, undefined, this.patient?.numeroDossier).subscribe({
      next: (res) => {
        this.enrolement = res.content.find(e => e.patientId === patientId);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'enrôlement:', err);
        this.enrolement = undefined;
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
