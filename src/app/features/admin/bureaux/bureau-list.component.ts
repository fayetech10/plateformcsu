import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BureauService } from '../../../core/services/bureau.service';
import { BureauCsu } from '../../../core/models/bureau.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bureau-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-building text-csu-primary"></i>
            Administration — Bureaux CSU
          </h1>
          <p class="csu-page-subtitle">Configurez et supervisez les bureaux régionaux de Couverture Sanitaire Universelle</p>
        </div>
        <div>
          <a routerLink="/admin/bureaux/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Nouveau Bureau
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-8">
            <div class="csu-search-input m-0 w-100">
              <i class="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher par nom, code, région, département ou commune..."
                formControlName="search"
              />
            </div>
          </div>
          <div class="col-12 col-md-4 d-flex gap-2">
            <button type="submit" class="csu-btn csu-btn-primary w-100">
              Rechercher
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
        } @else if (bureaux.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-building"></i>
            <h3>Aucun bureau CSU configuré</h3>
            <p>Commencez par ajouter un bureau CSU régional.</p>
            <a routerLink="/admin/bureaux/nouveau" class="csu-btn csu-btn-primary mt-3">
              Créer un bureau
            </a>
          </div>
        } @else {
          <table class="csu-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom du Bureau</th>
                <th>Région</th>
                <th>Département</th>
                <th>Commune</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of bureaux; track b.id) {
                <tr>
                  <td>
                    <span class="badge bg-light text-dark font-monospace fw-bold">{{ b.code }}</span>
                  </td>
                  <td>
                    <span class="fw-bold text-csu-primary">{{ b.nom }}</span>
                  </td>
                  <td>{{ b.region }}</td>
                  <td>{{ b.departement }}</td>
                  <td>{{ b.commune }}</td>
                  <td>{{ b.telephone || '-' }}</td>
                  <td>
                    <span class="badge" [class.bg-success]="b.actif" [class.bg-danger]="!b.actif">
                      {{ b.actif ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/admin/bureaux', b.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button (click)="onDelete(b)" class="csu-btn-icon danger" title="Supprimer">
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
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} bureaux
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
export class BureauListComponent implements OnInit {
  private bureauService = inject(BureauService);
  private fb = inject(FormBuilder);

  bureaux: BureauCsu[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: ['']
  });

  ngOnInit(): void {
    this.loadBureaux();
  }

  loadBureaux(): void {
    this.loading = true;
    const { search } = this.filterForm.value;

    this.bureauService.getBureaux(this.page, this.size, search || undefined).subscribe({
      next: (res) => {
        this.bureaux = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock fallback data
        this.bureaux = this.getMockBureaux().filter(b => {
          if (search) {
            const query = search.toLowerCase();
            return b.nom.toLowerCase().includes(query) || 
                   b.code.toLowerCase().includes(query) || 
                   b.region.toLowerCase().includes(query) || 
                   b.departement.toLowerCase().includes(query) || 
                   b.commune.toLowerCase().includes(query);
          }
          return true;
        });
        this.totalElements = this.bureaux.length;
        this.totalPages = Math.ceil(this.bureaux.length / this.size) || 1;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadBureaux();
  }

  onReset(): void {
    this.filterForm.reset({
      search: ''
    });
    this.page = 0;
    this.loadBureaux();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadBureaux();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onDelete(b: BureauCsu): void {
    Swal.fire({
      title: 'Supprimer le bureau ?',
      text: `Voulez-vous supprimer le bureau de ${b.nom} ? Cette action supprimera également les liaisons de comptes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bureauService.deleteBureau(b.id!).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le bureau CSU a été supprimé.', 'success');
            this.loadBureaux();
          },
          error: () => {
            this.bureaux = this.bureaux.filter(bur => bur.id !== b.id);
            this.totalElements = this.bureaux.length;
            Swal.fire('Supprimé !', 'Le bureau CSU a été supprimé (Simulation).', 'success');
          }
        });
      }
    });
  }

  private getMockBureaux(): BureauCsu[] {
    return [
      { id: 1, nom: 'Dakar Centre', code: 'DKR-01', region: 'Dakar', departement: 'Dakar', commune: 'Medina', adresse: 'Rue 15 angle 18', telephone: '338210011', actif: true },
      { id: 2, nom: 'Mbour Littoral', code: 'MBR-02', region: 'Thiès', departement: 'Mbour', commune: 'Saly', adresse: 'Saly Port, route de Mbour', telephone: '339572233', actif: true },
      { id: 3, nom: 'Mbacké Baol', code: 'MBK-03', region: 'Diourbel', departement: 'Mbacké', commune: 'Mbacké', adresse: 'Rond point central', telephone: '339754455', actif: true },
      { id: 4, nom: 'Thiès Ouest', code: 'THS-02', region: 'Thiès', departement: 'Thiès', commune: 'Thiès Ouest', adresse: 'Quartier Diakhao', telephone: '339512211', actif: true }
    ];
  }
}
