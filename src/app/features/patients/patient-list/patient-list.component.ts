import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FilterBarComponent, FilterGroup, FilterValues } from '../../../shared/components/filter-bar/filter-bar.component';
import { CardListItemComponent } from '../../../shared/ui';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterBarComponent, CardListItemComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-people-fill"></i>
            Gestion des Patients
          </h1>
          <p class="csu-page-subtitle">Enregistrez et gérez les dossiers de patients pour la CSU</p>
        </div>
        <div class="csu-page-actions">
          <button class="csu-btn csu-btn-light" (click)="exportPdf()" [disabled]="exporting">
            <i class="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button class="csu-btn csu-btn-light" (click)="exportExcel()" [disabled]="exporting">
            <i class="bi bi-file-earmark-excel"></i> Excel
          </button>
          <a routerLink="/patients/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Nouveau Patient
          </a>
        </div>
      </div>

      <!-- Filtres épurés -->
      <app-filter-bar
        searchPlaceholder="Rechercher par nom, prénom ou N° dossier..."
        [filterGroups]="filterGroups"
        (filterChange)="onFilterChange($event)"
      ></app-filter-bar>

      <!-- États : chargement / vide -->
      @if (loading) {
        <div class="csu-table-wrapper">
          <div class="csu-loading"><div class="csu-spinner"></div></div>
        </div>
      } @else if (patients.length === 0) {
        <div class="csu-table-wrapper">
          <div class="csu-empty-state">
            <i class="bi bi-people"></i>
            <h3>Aucun patient trouvé</h3>
            <p>Essayez de modifier vos critères de recherche ou enregistrez un nouveau patient.</p>
            <a routerLink="/patients/nouveau" class="csu-btn csu-btn-primary mt-3">
              Enregistrer un patient
            </a>
          </div>
        </div>
      } @else {
        <!-- ===== Tableau (desktop ≥ lg) ===== -->
        <div class="csu-table-wrapper d-none d-lg-block">
          <table class="csu-table">
            <thead>
              <tr>
                <th>N° Dossier</th>
                <th>Prénom & Nom</th>
                <th>Catégorie</th>
                <th>Sexe</th>
                <th>Âge / Né(e) le</th>
                <th>Téléphone</th>
                <th>Région</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of patients; track p.id) {
                <tr>
                  <td>
                    <span class="fw-bold text-csu-primary">{{ p.numeroDossier }}</span>
                  </td>
                  <td>{{ p.prenom }} {{ p.nom }}</td>
                  <td>
                    <span class="csu-badge font-semibold" [ngClass]="getCategoryBadgeClass(p)">
                      {{ getCategoryLabel(p) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [class.bg-info]="p.sexe === 'M'" [class.bg-danger]="p.sexe === 'F'">
                      {{ p.sexe === 'M' ? 'Masculin' : 'Féminin' }}
                    </span>
                  </td>
                  <td>{{ calculateAge(p.dateNaissance) }} ans <span class="text-muted small">({{ p.dateNaissance | date:'dd/MM/yyyy' }})</span></td>
                  <td>{{ p.telephone || '-' }}</td>
                  <td>{{ p.region }}</td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/patients', p.id]" class="csu-btn-icon" title="Consulter la fiche">
                        <i class="bi bi-eye"></i>
                      </a>
                      @if (canModify(p)) {
                        <a [routerLink]="['/patients', p.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                          <i class="bi bi-pencil"></i>
                        </a>
                        <button (click)="onDelete(p)" class="csu-btn-icon danger" title="Supprimer">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ===== Cartes résumé (mobile/tablette < lg) ===== -->
        <div class="csu-list d-lg-none">
          @for (p of patients; track p.id) {
            <csu-list-card>
              <div class="csu-list-card-head">
                <div class="csu-list-card-lead">{{ p.prenom?.charAt(0) }}{{ p.nom?.charAt(0) }}</div>
                <div class="csu-list-card-body">
                  <div class="csu-list-card-title">{{ p.prenom }} {{ p.nom }}</div>
                  <div class="csu-list-card-sub">N° {{ p.numeroDossier }} · {{ p.region }}</div>
                </div>
              </div>

              <div class="csu-list-card-meta">
                <span class="csu-badge" [ngClass]="getCategoryBadgeClass(p)">{{ getCategoryLabel(p) }}</span>
                <span class="csu-badge" [class.csu-badge-info]="p.sexe === 'M'" [class.csu-badge-danger]="p.sexe === 'F'">
                  {{ p.sexe === 'M' ? 'Masculin' : 'Féminin' }}
                </span>
                <span class="csu-badge csu-badge-secondary">{{ calculateAge(p.dateNaissance) }} ans</span>
                @if (p.telephone) {
                  <span class="csu-badge csu-badge-primary"><i class="bi bi-telephone"></i> {{ p.telephone }}</span>
                }
              </div>

              <div class="csu-list-card-actions">
                <a [routerLink]="['/patients', p.id]" class="csu-btn csu-btn-light">
                  <i class="bi bi-eye"></i> Détail
                </a>
                @if (canModify(p)) {
                  <a [routerLink]="['/patients', p.id, 'modifier']" class="csu-btn csu-btn-light" aria-label="Modifier">
                    <i class="bi bi-pencil"></i>
                  </a>
                  <button (click)="onDelete(p)" class="csu-btn csu-btn-light text-csu-danger" aria-label="Supprimer">
                    <i class="bi bi-trash"></i>
                  </button>
                }
              </div>
            </csu-list-card>
          }
        </div>

        <!-- ===== Pagination (partagée) ===== -->
        <div class="csu-pagination-card">
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} patients
            </div>
            <div class="csu-pagination-controls">
              <button class="csu-pagination-btn" [disabled]="page === 0" (click)="onPageChange(page - 1)" aria-label="Page précédente">
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
              <button class="csu-pagination-btn" [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)" aria-label="Page suivante">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private authService = inject(AuthService);


  patients: Patient[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  exporting = false;

  // Critères de filtre courants
  filters: FilterValues & { search: string } = { search: '', region: '', sexe: '', categorie: '' };

  filterGroups: FilterGroup[] = [
    {
      key: 'categorie',
      label: 'Catégorie',
      options: [
        { value: 'classique', label: 'Classique' },
        { value: '0-5ans', label: 'Enfants de moins de 5 ans' },
        { value: 'cesarienne', label: 'Césarienne' },
        { value: 'dialyse-peritoneale', label: 'Dialyse péritonéale' },
        { value: 'hemodialyse', label: 'Hémodialyse' },
        { value: 'bsf', label: 'Bourse de Sécurité Familiale' },
        { value: 'cec', label: 'Carte Égalité des Chances' },
        { value: 'plan-sesame', label: 'Plan Sésame' },
        { value: 'ndongo-dara', label: 'Plan Ndongo Dara / Élève' }
      ]
    },
    {
      key: 'region',
      label: 'Région',
      options: [
        { value: 'Dakar', label: 'Dakar' },
        { value: 'Thiès', label: 'Thiès' },
        { value: 'Diourbel', label: 'Diourbel' },
        { value: 'Saint-Louis', label: 'Saint-Louis' }
      ]
    },
    {
      key: 'sexe',
      label: 'Sexe',
      options: [
        { value: 'M', label: 'Masculin' },
        { value: 'F', label: 'Féminin' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  onFilterChange(values: FilterValues & { search: string }): void {
    this.filters = values;
    this.page = 0;
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;

    this.patientService.searchPatients(this.currentCriteria(), this.page, this.size).subscribe({
      next: (res) => {
        this.patients = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.patients = [];
        this.totalElements = 0;
        this.totalPages = 0;
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de charger les patients. Veuillez vérifier votre connexion au serveur.',
          icon: 'error',
          confirmButtonColor: '#10b981'
        });
      }
    });
  }

  private currentCriteria(): any {
    return {
      search: this.filters.search || '',
      region: this.filters['region'] || '',
      sexe: this.filters['sexe'] || '',
      categorie: this.filters['categorie'] || ''
    };
  }

  exportPdf(): void {
    this.exporting = true;
    this.patientService.exportPdf(this.currentCriteria()).subscribe({
      next: () => { this.exporting = false; },
      error: () => {
        this.exporting = false;
        Swal.fire('Erreur', "L'export PDF a échoué. Vérifiez votre connexion au serveur.", 'error');
      }
    });
  }

  exportExcel(): void {
    this.exporting = true;
    this.patientService.exportExcel(this.currentCriteria()).subscribe({
      next: () => { this.exporting = false; },
      error: () => {
        this.exporting = false;
        Swal.fire('Erreur', "L'export Excel a échoué. Vérifiez votre connexion au serveur.", 'error');
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadPatients();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onDelete(patient: Patient): void {
    Swal.fire({
      title: 'Suppression logique',
      text: `Êtes-vous sûr de vouloir supprimer le patient ${patient.prenom} ${patient.nom} ? Cette action n'est pas réversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.patientService.deletePatient(patient.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'Le patient a été supprimé avec succès.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadPatients();
          },
          error: () => {
            Swal.fire({
              title: 'Erreur',
              text: 'Une erreur est survenue lors de la suppression du patient.',
              icon: 'error',
              confirmButtonColor: '#10b981'
            });
          }
        });
      }
    });
  }

  calculateAge(dateString: string): number {
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
    if (patient.categorie && PatientListComponent.LABELS[patient.categorie]) {
      return PatientListComponent.LABELS[patient.categorie];
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
      case 'dialyse-peritoneale': return 'csu-badge-info';
      case 'hemodialyse': return 'csu-badge-info';
      case 'bsf': return 'csu-badge-success';
      case 'cec': return 'csu-badge-info';
      case 'ndongo-dara': return 'csu-badge-warning';
      default: return 'csu-badge-secondary';
    }
  }

  canModify(patient: Patient): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERVISEUR') return true;
    return patient.agentId === user.agent_id;
  }
}

