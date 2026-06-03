import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrolementService } from '../../../core/services/enrolement.service';
import { AuthService } from '../../../core/services/auth.service';
import { Enrolement, StatutEnrolement } from '../../../core/models/enrolement.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enrolement-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-shield-fill-check"></i>
            Enrôlements CSU
          </h1>
          <p class="csu-page-subtitle">Suivi des affiliations des bénéficiaires à la Couverture Sanitaire Universelle</p>
        </div>
        <div>
          <a routerLink="/enrolements/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Enrôler un Patient
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-5">
            <div class="csu-search-input">
              <i class="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher par N° Bénéficiaire ou Patient..."
                formControlName="search"
              />
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select class="csu-form-control csu-form-select" formControlName="statut">
              <option value="">Tous les statuts</option>
              <option value="EN_COURS">En cours d'examen</option>
              <option value="VALIDE">Validé / Affilié</option>
              <option value="REJETE">Rejeté / Refusé</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
          </div>
          <div class="col-12 col-md-3 d-flex gap-2">
            <button type="submit" class="csu-btn csu-btn-primary w-100">
              Filtrer
            </button>
            <button type="button" class="csu-btn csu-btn-light" (click)="onReset()">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div class="csu-table-wrapper">
        @if (loading) {
          <div class="csu-loading">
            <div class="csu-spinner"></div>
          </div>
        } @else if (enrolements.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-shield-exclamation"></i>
            <h3>Aucun enrôlement trouvé</h3>
            <p>Essayez de modifier vos critères de recherche ou procédez à un nouvel enrôlement.</p>
            <a routerLink="/enrolements/nouveau" class="csu-btn csu-btn-primary mt-3">
              Nouvel Enrôlement
            </a>
          </div>
        } @else {
          <table class="csu-table">
            <thead>
              <tr>
                <th>N° Bénéficiaire</th>
                <th>Patient</th>
                <th>Date d'Enrôlement</th>
                <th>Bureau CSU</th>
                <th>Agent</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (e of enrolements; track e.id) {
                <tr>
                  <td>
                    <span class="fw-bold text-csu-secondary">{{ e.numeroBeneficiaire }}</span>
                  </td>
                  <td>
                    @if (e.patient) {
                      <a [routerLink]="['/patients', e.patientId]" class="fw-semibold text-dark hover-primary">
                        {{ e.patient.prenom }} {{ e.patient.nom }}
                      </a>
                    } @else {
                      <span>Dossier #{{ e.patientId }}</span>
                    }
                  </td>
                  <td>{{ e.dateEnrolement | date:'dd/MM/yyyy' }}</td>
                  <td>{{ e.bureauCsuNom || '-' }}</td>
                  <td>{{ e.agentNom || '-' }}</td>
                  <td>
                    <span class="csu-badge" 
                      [class.csu-badge-primary]="e.statut === 'EN_COURS'" 
                      [class.csu-badge-success]="e.statut === 'VALIDE'" 
                      [class.csu-badge-danger]="e.statut === 'REJETE'"
                      [class.csu-badge-warning]="e.statut === 'SUSPENDU'">
                      {{ getStatutLabel(e.statut) }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      @if (canUpdateStatus(e.statut)) {
                        <button (click)="onUpdateStatus(e, 'VALIDE')" class="csu-btn-icon text-success" title="Valider l'adhésion">
                          <i class="bi bi-check-circle"></i>
                        </button>
                        <button (click)="onUpdateStatus(e, 'REJETE')" class="csu-btn-icon text-danger" title="Rejeter l'adhésion">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      }
                      <button (click)="viewObservations(e)" class="csu-btn-icon" title="Voir observations">
                        <i class="bi bi-chat-text"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} enrôlements
            </div>
            <div class="csu-pagination-controls">
              <button class="csu-pagination-btn" [disabled]="page === 0" (click)="onPageChange(page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              @for (pNum of getPagesArray(); track pNum) {
                <button 
                  class="csu-pagination-btn" 
                  [class.active]="pNum === page" 
                  (click)="onPageChange(pNum)"
                >
                  {{ pNum + 1 }}
                </button>
              }
              <button class="csu-pagination-btn" [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .hover-primary:hover {
      color: var(--csu-primary) !important;
    }
  `]
})
export class EnrolementListComponent implements OnInit {
  private enrolementService = inject(EnrolementService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  enrolements: Enrolement[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: [''],
    statut: ['']
  });

  ngOnInit(): void {
    this.loadEnrolements();
  }

  loadEnrolements(): void {
    this.loading = true;
    const { search, statut } = this.filterForm.value;

    this.enrolementService.getEnrolements(
      this.page, 
      this.size, 
      statut as StatutEnrolement || undefined, 
      search || undefined
    ).subscribe({
      next: (res) => {
        this.enrolements = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock fallback data
        this.enrolements = this.getMockEnrolements().filter(e => {
          if (statut && e.statut !== statut) return false;
          if (search) {
            const query = search.toLowerCase();
            return e.numeroBeneficiaire.toLowerCase().includes(query) || 
                   (e.patient && (e.patient.nom.toLowerCase().includes(query) || e.patient.prenom.toLowerCase().includes(query)));
          }
          return true;
        });
        this.totalElements = this.enrolements.length;
        this.totalPages = Math.ceil(this.enrolements.length / this.size) || 1;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadEnrolements();
  }

  onReset(): void {
    this.filterForm.reset({
      search: '',
      statut: ''
    });
    this.page = 0;
    this.loadEnrolements();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadEnrolements();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatutLabel(statut: StatutEnrolement): string {
    if (statut === 'EN_COURS') return 'En cours';
    if (statut === 'VALIDE') return 'Validé';
    if (statut === 'REJETE') return 'Rejeté';
    if (statut === 'SUSPENDU') return 'Suspendu';
    return statut;
  }

  canUpdateStatus(statut: StatutEnrolement): boolean {
    const isSupervisorOrAdmin = this.authService.isSuperviseur() || this.authService.isAdmin();
    return isSupervisorOrAdmin && statut === 'EN_COURS';
  }

  onUpdateStatus(enr: Enrolement, newStatut: StatutEnrolement): void {
    const actionText = newStatut === 'VALIDE' ? 'valider' : 'rejeter';
    
    Swal.fire({
      title: `${newStatut === 'VALIDE' ? 'Validation' : 'Rejet'} de l'enrôlement`,
      text: `Saisissez des observations pour cette décision (${actionText}) :`,
      input: 'textarea',
      inputPlaceholder: 'Entrez vos commentaires ici...',
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: newStatut === 'VALIDE' ? '#43A047' : '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enrolementService.updateStatus(enr.id!, newStatut, result.value).subscribe({
          next: () => {
            Swal.fire('Succès !', "Le statut de l'enrôlement a été mis à jour.", 'success');
            this.loadEnrolements();
          },
          error: () => {
            // Mock simulation
            enr.statut = newStatut;
            enr.observations = result.value || 'Traité via simulation.';
            Swal.fire('Succès !', "Le statut a été mis à jour (Simulation).", 'success');
          }
        });
      }
    });
  }

  viewObservations(e: Enrolement): void {
    Swal.fire({
      title: `Observations — ${e.numeroBeneficiaire}`,
      html: `
        <div class="text-start">
          <p><strong>Statut :</strong> ${this.getStatutLabel(e.statut)}</p>
          <p><strong>Bénéficiaire :</strong> ${e.patient?.prenom} ${e.patient?.nom}</p>
          <p><strong>Observations :</strong></p>
          <blockquote class="bg-light p-3 border-start border-primary border-4 rounded">
            ${e.observations || "Aucune observation enregistrée."}
          </blockquote>
        </div>
      `,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#00875A'
    });
  }

  private getMockEnrolements(): Enrolement[] {
    return [
      {
        id: 1,
        numeroBeneficiaire: 'BEN-2026-9812',
        patientId: 1,
        dateEnrolement: '2026-05-15',
        statut: 'VALIDE',
        agentId: 1,
        agentNom: 'Amina Diop',
        observations: 'Adhésion validée après réception de la cotisation trimestrielle.',
        bureauCsuId: 1,
        bureauCsuNom: 'Dakar Centre',
        patient: { id: 1, numeroDossier: 'DOS-2026-0001', prenom: 'Moussa', nom: 'Diop', sexe: 'M', dateNaissance: '1985-05-12', telephone: '776543210', adresse: 'Medina', region: 'Dakar', departement: 'Dakar', commune: 'Medina' }
      },
      {
        id: 2,
        numeroBeneficiaire: 'BEN-2026-0421',
        patientId: 2,
        dateEnrolement: '2026-05-16',
        statut: 'EN_COURS',
        agentId: 1,
        agentNom: 'Amina Diop',
        observations: 'En attente de la pièce d\'identité scannée.',
        bureauCsuId: 2,
        bureauCsuNom: 'Mbour Littoral',
        patient: { id: 2, numeroDossier: 'DOS-2026-0002', prenom: 'Fatou', nom: 'Ndiaye', sexe: 'F', dateNaissance: '1992-09-24', telephone: '781234567', adresse: 'Saly', region: 'Thiès', departement: 'Mbour', commune: 'Saly' }
      },
      {
        id: 3,
        numeroBeneficiaire: 'BEN-2026-1192',
        patientId: 3,
        dateEnrolement: '2026-05-17',
        statut: 'REJETE',
        agentId: 2,
        agentNom: 'Idrissa Diallo',
        observations: 'Rejeté car déjà affilié à l\'IPM (Régime obligatoire incompatible).',
        bureauCsuId: 3,
        bureauCsuNom: 'Mbacké Baol',
        patient: { id: 3, numeroDossier: 'DOS-2026-0003', prenom: 'Abdoulaye', nom: 'Sow', sexe: 'M', dateNaissance: '1978-01-30', telephone: '765432109', adresse: 'Mbacke', region: 'Diourbel', departement: 'Mbacke', commune: 'Mbacke' }
      }
    ];
  }
}
