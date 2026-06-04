import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiviteService } from '../../../core/services/activite.service';
import { Activite, TypeActivite, ActiviteStats, StatutActivite } from '../../../core/models/activite.model';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FilterBarComponent, FilterGroup, FilterValues } from '../../../shared/components/filter-bar/filter-bar.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-activite-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterBarComponent],
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
        <div class="d-flex gap-2">
          <a routerLink="/activites/agenda" class="csu-btn csu-btn-light">
            <i class="bi bi-calendar3"></i> Agenda
          </a>
          <a routerLink="/activites/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Rapporteur d'Activité
          </a>
        </div>
      </div>

      <!-- Statistiques -->
      @if (stats) {
        <div class="act-stats">
          <div class="act-stat">
            <div class="ico total"><i class="bi bi-calendar2-check"></i></div>
            <div><span class="num">{{ stats.total }}</span><span class="lbl">Activités</span></div>
          </div>
          <div class="act-stat">
            <div class="ico people"><i class="bi bi-people-fill"></i></div>
            <div><span class="num">{{ stats.totalParticipants }}</span><span class="lbl">Participants</span></div>
          </div>
          <div class="act-stat">
            <div class="ico plan"><i class="bi bi-calendar-event"></i></div>
            <div><span class="num">{{ stats.parStatut['PLANIFIEE'] || 0 }}</span><span class="lbl">Planifiées</span></div>
          </div>
          <div class="act-stat">
            <div class="ico done"><i class="bi bi-check-circle"></i></div>
            <div><span class="num">{{ stats.parStatut['REALISEE'] || 0 }}</span><span class="lbl">Réalisées</span></div>
          </div>
        </div>
      }

      <!-- Filtres épurés -->
      <app-filter-bar
        searchPlaceholder="Rechercher par description ou commentaires..."
        [filterGroups]="filterGroups"
        (filterChange)="onFilterChange($event)"
      ></app-filter-bar>

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
                <th>Statut</th>
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
                  <td>
                    <span class="statut-pill"
                      [class.st-plan]="(act.statut || 'REALISEE') === 'PLANIFIEE'"
                      [class.st-done]="(act.statut || 'REALISEE') === 'REALISEE'"
                      [class.st-cancel]="act.statut === 'ANNULEE'">
                      {{ getStatutLabel(act.statut) }}
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
                      @if (canModify(act)) {
                        <a [routerLink]="['/activites', act.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                          <i class="bi bi-pencil"></i>
                        </a>
                        <button (click)="onDelete(act)" class="csu-btn-icon danger" title="Supprimer">
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
  `,
  styles: [`
    .act-stats { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
    .act-stat { flex: 1; min-width: 160px; background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 14px; padding: 0.9rem 1.1rem; display: flex; align-items: center; gap: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .act-stat .ico { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
    .act-stat .ico.total { background: rgba(123,31,162,0.1); color: #7B1FA2; }
    .act-stat .ico.people { background: rgba(21,101,192,0.1); color: #1565C0; }
    .act-stat .ico.plan { background: rgba(245,124,0,0.1); color: #E65100; }
    .act-stat .ico.done { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .act-stat .num { display: block; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.4rem; line-height: 1; color: var(--csu-text); }
    .act-stat .lbl { display: block; font-size: 0.78rem; color: var(--csu-text-muted); font-weight: 600; margin-top: 2px; }

    .statut-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
    .statut-pill.st-plan { background: rgba(245,124,0,0.12); color: #E65100; }
    .statut-pill.st-done { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .statut-pill.st-cancel { background: rgba(229,57,53,0.1); color: #C62828; }
  `]
})
export class ActiviteListComponent implements OnInit {
  private activiteService = inject(ActiviteService);
  private authService = inject(AuthService);


  activites: Activite[] = [];
  stats?: ActiviteStats;
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filters: FilterValues & { search: string } = { search: '', typeActivite: '', statut: '' };

  filterGroups: FilterGroup[] = [
    {
      key: 'typeActivite',
      label: 'Type',
      options: [
        { value: 'SENSIBILISATION', label: 'Sensibilisation' },
        { value: 'FORMATION', label: 'Formation' },
        { value: 'REUNION', label: 'Réunion' },
        { value: 'VISITE_TERRAIN', label: 'Visite Terrain' },
        { value: 'ASSISTANCE_ADMINISTRATIVE', label: 'Assistance Admin.' }
      ]
    },
    {
      key: 'statut',
      label: 'Statut',
      options: [
        { value: 'PLANIFIEE', label: 'Planifiée' },
        { value: 'REALISEE', label: 'Réalisée' },
        { value: 'ANNULEE', label: 'Annulée' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadActivites();
    this.loadStats();
  }

  loadStats(): void {
    this.activiteService.getStats().subscribe({
      next: (s) => (this.stats = s),
      error: () => (this.stats = undefined)
    });
  }

  onFilterChange(values: FilterValues & { search: string }): void {
    this.filters = values;
    this.page = 0;
    this.loadActivites();
  }

  loadActivites(): void {
    this.loading = true;

    this.activiteService.getActivites(
      this.page,
      this.size,
      (this.filters['typeActivite'] as TypeActivite) || undefined,
      this.filters.search || undefined,
      (this.filters['statut'] as string) || undefined
    ).subscribe({
      next: (res) => {
        this.activites = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.activites = [];
        this.totalElements = 0;
        this.totalPages = 0;
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de charger les activités. Veuillez vérifier votre connexion au serveur.',
          icon: 'error',
          confirmButtonColor: '#10b981'
        });
      }
    });
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

  getStatutLabel(statut?: StatutActivite): string {
    switch (statut || 'REALISEE') {
      case 'PLANIFIEE': return 'Planifiée';
      case 'ANNULEE': return 'Annulée';
      default: return 'Réalisée';
    }
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
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.activiteService.deleteActivite(act.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimée !',
              text: "L'activité a été supprimée.",
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadActivites();
          },
          error: () => {
            Swal.fire({
              title: 'Erreur',
              text: 'Une erreur est survenue lors de la suppression de l\'activité.',
              icon: 'error',
              confirmButtonColor: '#10b981'
            });
          }
        });
      }
    });
  }

  canModify(act: Activite): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERVISEUR') return true;
    return act.agentId === user.agent_id;
  }
}

