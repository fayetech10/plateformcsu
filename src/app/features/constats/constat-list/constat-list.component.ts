import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstatService } from '../../../core/services/constat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Constat, StatutConstat, PrioriteConstat } from '../../../core/models/constat.model';
import { RouterLink } from '@angular/router';
import { FilterBarComponent, FilterGroup, FilterValues } from '../../../shared/components/filter-bar/filter-bar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-constat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FilterBarComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-clipboard-x-fill"></i>
            Constats & Incidents
          </h1>
          <p class="csu-page-subtitle">Rapportez et suivez la résolution des incidents opérationnels et anomalies</p>
        </div>
        <div>
          <a routerLink="/constats/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Signaler un Constat
          </a>
        </div>
      </div>

      <!-- Filtres épurés -->
      <app-filter-bar
        searchPlaceholder="Rechercher par référence ou description..."
        [filterGroups]="filterGroups"
        (filterChange)="onFilterChange($event)"
      ></app-filter-bar>

      <!-- Table -->
      <div class="csu-table-wrapper">
        @if (loading) {
          <div class="csu-loading">
            <div class="csu-spinner"></div>
          </div>
        } @else if (constats.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-clipboard-check"></i>
            <h3>Aucun constat signalé</h3>
            <p>Tout fonctionne normalement ! Aucun incident ou constat opérationnel n'a été enregistré.</p>
            <a routerLink="/constats/nouveau" class="csu-btn csu-btn-primary mt-3">
              Signaler un incident
            </a>
          </div>
        } @else {
          <table class="csu-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Responsable</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of constats; track c.id) {
                <tr>
                  <td>
                    <span class="fw-bold text-dark">{{ c.referenceConstat }}</span>
                  </td>
                  <td>{{ c.dateConstat | date:'dd/MM/yyyy' }}</td>
                  <td>{{ c.categorieNom || '-' }}</td>
                  <td class="text-truncate" style="max-width: 200px;">{{ c.description }}</td>
                  <td>
                    <span class="badge"
                      [class.bg-secondary]="c.priorite === 'BASSE'"
                      [class.bg-info]="c.priorite === 'MOYENNE'"
                      [class.bg-warning]="c.priorite === 'HAUTE'"
                      [class.bg-danger]="c.priorite === 'URGENTE'">
                      {{ getPrioriteLabel(c.priorite) }}
                    </span>
                  </td>
                  <td>
                    <span class="csu-badge"
                      [class.csu-badge-primary]="c.statut === 'OUVERT'"
                      [class.csu-badge-warning]="c.statut === 'EN_COURS'"
                      [class.csu-badge-success]="c.statut === 'RESOLU'"
                      [class.csu-badge-secondary]="c.statut === 'ARCHIVE'">
                      {{ getStatutLabel(c.statut) }}
                    </span>
                  </td>
                  <td>{{ c.responsableNom || 'Non assigné' }}</td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      @if (canModify(c)) {
                        <a [routerLink]="['/constats', c.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                          <i class="bi bi-pencil"></i>
                        </a>
                        @if (!c.archive) {
                          <button (click)="onArchive(c)" class="csu-btn-icon text-warning" title="Archiver">
                            <i class="bi bi-archive"></i>
                          </button>
                        }
                      } @else {
                        <span class="text-muted small" title="Constat d'un collègue - lecture seule">
                          <i class="bi bi-eye"></i>
                        </span>
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
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} constats
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
export class ConstatListComponent implements OnInit {
  private constatService = inject(ConstatService);
  private authService = inject(AuthService);

  constats: Constat[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filters: FilterValues & { search: string } = { search: '', statut: '', priorite: '' };

  filterGroups: FilterGroup[] = [
    {
      key: 'statut',
      label: 'Statut',
      options: [
        { value: 'OUVERT', label: 'Ouvert' },
        { value: 'EN_COURS', label: 'En cours' },
        { value: 'RESOLU', label: 'Résolu' },
        { value: 'ARCHIVE', label: 'Archivé' }
      ]
    },
    {
      key: 'priorite',
      label: 'Priorité',
      options: [
        { value: 'BASSE', label: 'Basse' },
        { value: 'MOYENNE', label: 'Moyenne' },
        { value: 'HAUTE', label: 'Haute' },
        { value: 'URGENTE', label: 'Urgente' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadConstats();
  }

  onFilterChange(values: FilterValues & { search: string }): void {
    this.filters = values;
    this.page = 0;
    this.loadConstats();
  }

  loadConstats(): void {
    this.loading = true;

    this.constatService.getConstats(
      this.page,
      this.size,
      (this.filters['statut'] as StatutConstat) || undefined,
      (this.filters['priorite'] as PrioriteConstat) || undefined,
      this.filters.search || undefined
    ).subscribe({
      next: (res) => {
        this.constats = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.constats = [];
        this.totalElements = 0;
        this.totalPages = 0;
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de charger les constats. Veuillez vérifier votre connexion au serveur.',
          icon: 'error',
          confirmButtonColor: '#10b981'
        });
      }
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadConstats();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPrioriteLabel(p: PrioriteConstat): string {
    if (p === 'BASSE') return 'Basse';
    if (p === 'MOYENNE') return 'Moyenne';
    if (p === 'HAUTE') return 'Haute';
    if (p === 'URGENTE') return 'Urgente';
    return p;
  }

  getStatutLabel(s: StatutConstat): string {
    if (s === 'OUVERT') return 'Ouvert';
    if (s === 'EN_COURS') return 'En cours';
    if (s === 'RESOLU') return 'Résolu';
    if (s === 'ARCHIVE') return 'Archivé';
    return s;
  }

  canModify(c: Constat): boolean {
    const user = this.authService.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPERVISEUR') return true;
    return c.responsableId === user.agent_id;
  }

  onArchive(c: Constat): void {
    Swal.fire({
      title: "Archivage de constat",
      text: `Voulez-vous archiver le constat ${c.referenceConstat} ? Il n'apparaîtra plus dans les tableaux opérationnels actifs.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, archiver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.constatService.archiverConstat(c.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Archivé !',
              text: "Le constat a été archivé.",
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadConstats();
          },
          error: () => {
            Swal.fire({
              title: 'Erreur',
              text: 'Une erreur est survenue lors de l\'archivage du constat.',
              icon: 'error',
              confirmButtonColor: '#10b981'
            });
          }
        });
      }
    });
  }
}
