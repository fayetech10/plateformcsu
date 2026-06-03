import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
                <th>Sexe</th>
                <th>Date Naissance</th>
                <th>Téléphone</th>
                <th>Région</th>
                <th>Date d'Enr.</th>
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
                    <span class="badge" [class.bg-info]="p.sexe === 'M'" [class.bg-danger]="p.sexe === 'F'">
                      {{ p.sexe === 'M' ? 'Masculin' : 'Féminin' }}
                    </span>
                  </td>
                  <td>{{ p.dateNaissance | date:'dd/MM/yyyy' }}</td>
                  <td>{{ p.telephone || '-' }}</td>
                  <td>{{ p.region }}</td>
                  <td>{{ p.dateEnregistrement | date:'dd/MM/yyyy' }}</td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/patients', p.id]" class="csu-btn-icon" title="Consulter la fiche">
                        <i class="bi bi-eye"></i>
                      </a>
                      <a [routerLink]="['/patients', p.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button (click)="onDelete(p)" class="csu-btn-icon danger" title="Supprimer">
                        <i class="bi bi-trash"></i>
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
        // Fallback mock data when backend is not running yet
        this.patients = this.getMockPatients().filter(p => {
          if (sexe && p.sexe !== sexe) return false;
          if (region && p.region !== region) return false;
          if (search) {
            const query = search.toLowerCase();
            return p.nom.toLowerCase().includes(query) || 
                   p.prenom.toLowerCase().includes(query) || 
                   p.numeroDossier.toLowerCase().includes(query);
          }
          return true;
        });
        this.totalElements = this.patients.length;
        this.totalPages = Math.ceil(this.patients.length / this.size) || 1;
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
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.patientService.deletePatient(patient.id!).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le patient a été supprimé avec succès.', 'success');
            this.loadPatients();
          },
          error: () => {
            // Delete simulation for mock fallback
            this.patients = this.patients.filter(p => p.id !== patient.id);
            this.totalElements = this.patients.length;
            Swal.fire('Supprimé !', 'Le patient a été supprimé (Simulation).', 'success');
          }
        });
      }
    });
  }

  private getMockPatients(): Patient[] {
    return [
      { id: 1, numeroDossier: 'DOS-2026-0001', prenom: 'Moussa', nom: 'Diop', sexe: 'M', dateNaissance: '1985-05-12', telephone: '776543210', adresse: 'Medina', region: 'Dakar', departement: 'Dakar', commune: 'Medina', dateEnregistrement: '2026-05-15T09:00:00Z' },
      { id: 2, numeroDossier: 'DOS-2026-0002', prenom: 'Fatou', nom: 'Ndiaye', sexe: 'F', dateNaissance: '1992-09-24', telephone: '781234567', adresse: 'Saly', region: 'Thiès', departement: 'Mbour', commune: 'Saly', dateEnregistrement: '2026-05-16T10:30:00Z' },
      { id: 3, numeroDossier: 'DOS-2026-0003', prenom: 'Abdoulaye', nom: 'Sow', sexe: 'M', dateNaissance: '1978-01-30', telephone: '765432109', adresse: 'Mbacke', region: 'Diourbel', departement: 'Mbacke', commune: 'Mbacke', dateEnregistrement: '2026-05-17T11:00:00Z' },
      { id: 4, numeroDossier: 'DOS-2026-0004', prenom: 'Awa', nom: 'Fall', sexe: 'F', dateNaissance: '2000-11-05', telephone: '771122334', adresse: 'Golf Sud', region: 'Dakar', departement: 'Guediawaye', commune: 'Golf Sud', dateEnregistrement: '2026-05-18T14:20:00Z' },
      { id: 5, numeroDossier: 'DOS-2026-0005', prenom: 'Ousmane', nom: 'Gueye', sexe: 'M', dateNaissance: '1965-07-18', telephone: '708899001', adresse: 'Thies Ouest', region: 'Thiès', departement: 'Thies', commune: 'Thies Ouest', dateEnregistrement: '2026-05-19T16:45:00Z' }
    ];
  }
}
