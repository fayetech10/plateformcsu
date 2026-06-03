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

            <!-- Card: Informations Médicales (0 à 5 ans) -->
            <div class="csu-card" *ngIf="getCategoryLabel(patient) === '0 à 5 ans' || patient.numeroRegistre || patient.diagnosticMotif">
              <div class="csu-card-header">
                <h3 class="csu-card-title text-csu-primary">
                  <i class="bi bi-file-medical-fill text-primary"></i>
                  Informations Médicales (0 à 5 ans)
                </h3>
              </div>
              <div class="row g-3">
                <div class="col-6 border-bottom pb-2">
                  <span class="d-block small text-muted">Numéro de Registre</span>
                  <span class="fw-semibold">{{ patient.numeroRegistre || '-' }}</span>
                </div>
                <div class="col-6 border-bottom pb-2">
                  <span class="d-block small text-muted">N° Matricule / Extrait / Accompagnant</span>
                  <span class="fw-semibold">{{ patient.matriculeExtraitAccompagnant || '-' }}</span>
                </div>
                <div class="col-6 border-bottom pb-2">
                  <span class="d-block small text-muted">Date de Prise en Charge</span>
                  <span>{{ (patient.datePriseEnCharge | date:'dd/MM/yyyy') || '-' }}</span>
                </div>
                <div class="col-6 border-bottom pb-2">
                  <span class="d-block small text-muted">Service</span>
                  <span>{{ patient.service || '-' }}</span>
                </div>
                <div class="col-12 border-bottom pb-2">
                  <span class="d-block small text-muted">Prestation et Médicament</span>
                  <p class="mb-0 text-secondary small bg-light p-2 rounded">{{ patient.prestationMedicament || '-' }}</p>
                </div>
                <div class="col-12">
                  <span class="d-block small text-muted">Diagnostic / Motif de consultation</span>
                  <p class="mb-0 text-secondary small bg-light p-2 rounded">{{ patient.diagnosticMotif || '-' }}</p>
                </div>
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

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadPatientDetail(id);
  }

  loadPatientDetail(id: number): void {
    this.patientService.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = data;
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

  getCategoryLabel(patient: Patient): string {
    if (patient.categorie) {
      switch (patient.categorie) {
        case '0-5ans': return '0 à 5 ans';
        case 'plan-sesame': return 'Plan Sésame';
        case 'classique': return 'Classique';
        case 'cesarienne': return 'Césarienne';
      }
    }
    const age = this.calculateAge(patient.dateNaissance);
    if (age <= 5) return '0 à 5 ans';
    if (age >= 60) return 'Plan Sésame';
    if (patient.photoIdentiteRecto || patient.photoIdentiteVerso) return 'Classique';
    if (patient.sexe === 'F') return 'Césarienne';
    return 'Autre';
  }


  getCategoryBadgeClass(patient: Patient): string {
    const cat = this.getCategoryLabel(patient);
    switch (cat) {
      case '0 à 5 ans': return 'csu-badge-primary';
      case 'Plan Sésame': return 'csu-badge-warning';
      case 'Classique': return 'csu-badge-success';
      case 'Césarienne': return 'csu-badge-danger';
      default: return 'csu-badge-secondary';
    }
  }
}
