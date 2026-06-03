import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
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
        <div>
          <a routerLink="/patients/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Nouveau Patient
          </a>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-4">
            <div class="csu-search-input">
              <i class="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou N° dossier..."
                formControlName="search"
              />
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="csu-form-control csu-form-select" formControlName="region">
              <option value="">Toutes les régions</option>
              <option value="Dakar">Dakar</option>
              <option value="Thiès">Thiès</option>
              <option value="Diourbel">Diourbel</option>
              <option value="Saint-Louis">Saint-Louis</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="csu-form-control csu-form-select" formControlName="sexe">
              <option value="">Tous les sexes</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div class="col-12 col-md-2 d-flex gap-2">
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
        } @else if (patients.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-people"></i>
            <h3>Aucun patient trouvé</h3>
            <p>Essayez de modifier vos critères de recherche ou enregistrez un nouveau patient.</p>
            <a routerLink="/patients/nouveau" class="csu-btn csu-btn-primary mt-3">
              Enregistrer un patient
            </a>
          </div>
        } @else {
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

          <!-- Pagination -->
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} patients
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
  `
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);


  patients: Patient[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: [''],
    region: [''],
    sexe: ['']
  });

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    const { search, region, sexe } = this.filterForm.value;

    const searchCriteria = {
      search: search || '',
      region: region || '',
      sexe: sexe || ''
    };

    this.patientService.searchPatients(searchCriteria, this.page, this.size).subscribe({
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

  onSearch(): void {
    this.page = 0;
    this.loadPatients();
  }

  onReset(): void {
    this.filterForm.reset({
      search: '',
      region: '',
      sexe: ''
    });
    this.page = 0;
    this.loadPatients();
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

  canModify(patient: Patient): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERVISEUR') return true;
    return patient.agentId === user.agent_id;
  }
}

