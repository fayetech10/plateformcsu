import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiviteService } from '../../../core/services/activite.service';
import { Activite, TypeActivite } from '../../../core/models/activite.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activite-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-calendar2-event-fill"></i>
            Activités Terrains & Bureaux
          </h1>
          <p class="csu-page-subtitle">Rapportez et suivez les activités de sensibilisation, réunions et formations</p>
        </div>
        <div>
          <a routerLink="/activites/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Rapporteur d'Activité
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
                placeholder="Rechercher par description ou commentaires..."
                formControlName="search"
              />
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select class="csu-form-control csu-form-select" formControlName="typeActivite">
              <option value="">Tous les types d'activité</option>
              <option value="SENSIBILISATION">Sensibilisation / Caravane</option>
              <option value="FORMATION">Formation / Atelier</option>
              <option value="REUNION">Réunion / Comité</option>
              <option value="VISITE_TERRAIN">Visite de terrain / Supervision</option>
              <option value="ASSISTANCE_ADMINISTRATIVE">Assistance administrative</option>
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
        } @else if (activites.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-calendar-event"></i>
            <h3>Aucune activité enregistrée</h3>
            <p>Commencez à rapporter vos activités de terrain et réunions CSU.</p>
            <a routerLink="/activites/nouveau" class="csu-btn csu-btn-primary mt-3">
              Rapporter une activité
            </a>
          </div>
        } @else {
          <table class="csu-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type d'Activité</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Participants</th>
                <th>Bureau CSU</th>
                <th>Rapporteur</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (act of activites; track act.id) {
                <tr>
                  <td>
                    <span class="fw-semibold text-dark">{{ act.dateActivite | date:'dd/MM/yyyy' }}</span>
                  </td>
                  <td>
                    <span class="csu-badge"
                      [class.csu-badge-primary]="act.typeActivite === 'SENSIBILISATION'"
                      [class.csu-badge-success]="act.typeActivite === 'FORMATION'"
                      [class.csu-badge-info]="act.typeActivite === 'REUNION'"
                      [class.csu-badge-secondary]="act.typeActivite === 'VISITE_TERRAIN'"
                      [class.csu-badge-warning]="act.typeActivite === 'ASSISTANCE_ADMINISTRATIVE'">
                      {{ getTypeLabel(act.typeActivite) }}
                    </span>
                  </td>
                  <td>{{ act.categorieNom || '-' }}</td>
                  <td class="text-truncate" style="max-width: 250px;">{{ act.description }}</td>
                  <td>
                    <span class="badge bg-light text-dark fw-bold">
                      <i class="bi bi-people me-1"></i> {{ act.nombreParticipants }}
                    </span>
                  </td>
                  <td>{{ act.bureauCsuNom || '-' }}</td>
                  <td>{{ act.agentNom || '-' }}</td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/activites', act.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button (click)="onDelete(act)" class="csu-btn-icon danger" title="Supprimer">
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
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} activités
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
export class ActiviteListComponent implements OnInit {
  private activiteService = inject(ActiviteService);
  private fb = inject(FormBuilder);

  activites: Activite[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: [''],
    typeActivite: ['']
  });

  ngOnInit(): void {
    this.loadActivites();
  }

  loadActivites(): void {
    this.loading = true;
    const { search, typeActivite } = this.filterForm.value;

    this.activiteService.getActivites(
      this.page,
      this.size,
      typeActivite as TypeActivite || undefined,
      search || undefined
    ).subscribe({
      next: (res) => {
        this.activites = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock fallback data
        this.activites = this.getMockActivites().filter(a => {
          if (typeActivite && a.typeActivite !== typeActivite) return false;
          if (search) {
            const query = search.toLowerCase();
            return a.description.toLowerCase().includes(query) || 
                   (a.commentaires && a.commentaires.toLowerCase().includes(query));
          }
          return true;
        });
        this.totalElements = this.activites.length;
        this.totalPages = Math.ceil(this.activites.length / this.size) || 1;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadActivites();
  }

  onReset(): void {
    this.filterForm.reset({
      search: '',
      typeActivite: ''
    });
    this.page = 0;
    this.loadActivites();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadActivites();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getTypeLabel(type: TypeActivite): string {
    if (type === 'SENSIBILISATION') return 'Sensibilisation';
    if (type === 'FORMATION') return 'Formation';
    if (type === 'REUNION') return 'Réunion';
    if (type === 'VISITE_TERRAIN') return 'Visite Terrain';
    if (type === 'ASSISTANCE_ADMINISTRATIVE') return 'Assistance Administrative';
    return type;
  }

  onDelete(act: Activite): void {
    Swal.fire({
      title: "Suppression d'activité",
      text: "Voulez-vous vraiment supprimer ce rapport d'activité ? Cette opération est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activiteService.deleteActivite(act.id!).subscribe({
          next: () => {
            Swal.fire('Supprimée !', "L'activité a été supprimée.", 'success');
            this.loadActivites();
          },
          error: () => {
            // Mock delete simulation
            this.activites = this.activites.filter(a => a.id !== act.id);
            this.totalElements = this.activites.length;
            Swal.fire('Supprimée !', "L'activité a été supprimée (Simulation).", 'success');
          }
        });
      }
    });
  }

  private getMockActivites(): Activite[] {
    return [
      { id: 1, typeActivite: 'SENSIBILISATION', description: 'Caravane de sensibilisation sur la CSU au marché de Rufisque', dateActivite: '2026-05-18', agentNom: 'Moussa Ndiaye', nombreParticipants: 120, bureauCsuNom: 'Rufisque Est', categorieNom: 'Caravanes Marchés' },
      { id: 2, typeActivite: 'FORMATION', description: 'Atelier de renforcement des capacités des enrôleurs locaux', dateActivite: '2026-05-20', agentNom: 'Sokhna Wade', nombreParticipants: 15, bureauCsuNom: 'Thiès Ouest', categorieNom: 'Ateliers Techniques' },
      { id: 3, typeActivite: 'REUNION', description: 'Comité de pilotage régional de la CSU', dateActivite: '2026-05-22', agentNom: 'Papa Diop', nombreParticipants: 8, bureauCsuNom: 'Dakar Centre', categorieNom: 'Instances Décisionnelles' }
    ];
  }
}
