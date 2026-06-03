import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { EnrolementService } from '../../../core/services/enrolement.service';
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
          <a [routerLink]="['/patients', patient.id, 'modifier']" class="csu-btn csu-btn-secondary">
            <i class="bi bi-pencil-fill"></i> Modifier la Fiche
          </a>
          <a routerLink="/patients" class="csu-btn csu-btn-light">
            Retour
          </a>
        </div>
      </div>

      <div class="row g-4">
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
                <span>{{ patient.dateNaissance | date:'dd MMMM yyyy' }}</span>
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

        <!-- Col 2: Localisation & Enrolement Status -->
        <div class="col-12 col-lg-7">
          <div class="d-flex flex-column gap-4">
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
  `
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  private enrolementService = inject(EnrolementService);

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
      error: () => {
        // Mock fallback
        const mockPatients = [
          { id: 1, numeroDossier: 'DOS-2026-0001', prenom: 'Moussa', nom: 'Diop', sexe: 'M', dateNaissance: '1985-05-12', telephone: '776543210', adresse: 'Medina Rue 15', region: 'Dakar', departement: 'Dakar', commune: 'Medina', dateEnregistrement: '2026-05-15T09:00:00Z', bureauCsuNom: 'Dakar Centre' },
          { id: 2, numeroDossier: 'DOS-2026-0002', prenom: 'Fatou', nom: 'Ndiaye', sexe: 'F', dateNaissance: '1992-09-24', telephone: '781234567', adresse: 'Saly Port', region: 'Thiès', departement: 'Mbour', commune: 'Saly', dateEnregistrement: '2026-05-16T10:30:00Z', bureauCsuNom: 'Mbour Littoral' }
        ];
        this.patient = mockPatients.find(p => p.id === id) as any;
        if (this.patient) {
          this.checkEnrolement(id);
        } else {
          Swal.fire('Erreur', 'Impossible de charger les détails du patient.', 'error');
        }
      }
    });
  }

  checkEnrolement(patientId: number): void {
    this.enrolementService.getEnrolements(0, 10, undefined, this.patient?.numeroDossier).subscribe({
      next: (res) => {
        // Try to match by patient ID
        this.enrolement = res.content.find(e => e.patientId === patientId);
      },
      error: () => {
        // Mock fallback enrolement
        const mockEnrolements: Enrolement[] = [
          { id: 1, numeroBeneficiaire: 'BEN-2026-9812', patientId: 1, dateEnrolement: '2026-05-15', statut: 'VALIDE', agentNom: 'Amina Diop', observations: 'Adhésion validée. Cotisation à jour.', bureauCsuNom: 'Dakar Centre' }
        ];
        this.enrolement = mockEnrolements.find(e => e.patientId === patientId);
      }
    });
  }
}
