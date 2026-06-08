import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BonCommandeService } from '../../../core/services/bon-commande.service';
import { LettreGarantieService } from '../../../core/services/lettre-garantie.service';

@Component({
  selector: 'app-documents-generes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-file-earmark-pdf-fill text-csu-primary"></i>
            Documents Générés
          </h1>
          <p class="csu-page-subtitle">Liste des bons de commande et lettres de garantie émis</p>
        </div>
      </div>

      <!-- Onglets de navigation -->
      <ul class="nav nav-tabs csu-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="bons-tab" data-bs-toggle="tab" data-bs-target="#bons" type="button" role="tab" aria-controls="bons" aria-selected="true" (click)="switchTab('bons')">
            <i class="bi bi-receipt-cutoff me-1"></i> Bons de Commande
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="lettres-tab" data-bs-toggle="tab" data-bs-target="#lettres" type="button" role="tab" aria-controls="lettres" aria-selected="false" (click)="switchTab('lettres')">
            <i class="bi bi-shield-check me-1"></i> Lettres de Garantie
          </button>
        </li>
      </ul>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        <!-- Onglet: Bons de commande -->
        <div class="tab-pane fade show active" id="bons" role="tabpanel" aria-labelledby="bons-tab">
          <div class="csu-search-bar mt-3 mb-4">
            <div class="csu-search-input">
              <i class="bi bi-search"></i>
              <input type="text" [(ngModel)]="searchBons" (keyup.enter)="loadBons(0)" placeholder="Rechercher un bon (Réf, Patient, Dossier)...">
            </div>
            <button class="csu-btn csu-btn-primary" (click)="loadBons(0)">Rechercher</button>
            <button class="csu-btn csu-btn-light" (click)="searchBons=''; loadBons(0)">Réinitialiser</button>
          </div>

          <div class="csu-table-wrapper">
            <table class="csu-table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Patient</th>
                  <th>Pharmacie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (loadingBons) {
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <div class="spinner-border text-csu-primary" role="status"></div>
                    </td>
                  </tr>
                } @else if (bons.length === 0) {
                  <tr>
                    <td colspan="5" class="text-center py-4 text-muted">Aucun bon de commande trouvé.</td>
                  </tr>
                } @else {
                  @for (b of bons; track b.id) {
                    <tr>
                      <td>{{ b.dateCreation | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><b>{{ b.reference }}</b></td>
                      <td>{{ b.patientNom }}</td>
                      <td>{{ b.pharmacieNom || '-' }}</td>
                      <td>
                        <div class="d-flex gap-2">
                          <a [routerLink]="['/bons-commande', b.id]" class="csu-btn-icon" title="Voir les détails">
                            <i class="bi bi-eye"></i>
                          </a>
                          <a [routerLink]="['/bons-commande', b.id]" [queryParams]="{ downloadPdf: 'true' }" class="csu-btn-icon" style="color: #d32f2f" title="Télécharger PDF">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
            <!-- Pagination Bons -->
            <div class="csu-pagination">
              <span class="csu-pagination-info">Page {{ pageBons + 1 }} sur {{ totalPagesBons }}</span>
              <div class="csu-pagination-controls">
                <button class="csu-pagination-btn" [disabled]="pageBons === 0" (click)="loadBons(pageBons - 1)"><i class="bi bi-chevron-left"></i></button>
                <button class="csu-pagination-btn" [disabled]="pageBons >= totalPagesBons - 1" (click)="loadBons(pageBons + 1)"><i class="bi bi-chevron-right"></i></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Lettres de Garantie -->
        <div class="tab-pane fade" id="lettres" role="tabpanel" aria-labelledby="lettres-tab">
          <div class="csu-search-bar mt-3 mb-4">
            <div class="csu-search-input">
              <i class="bi bi-search"></i>
              <input type="text" [(ngModel)]="searchLettres" (keyup.enter)="loadLettres(0)" placeholder="Rechercher une lettre (Réf, Patient)...">
            </div>
            <button class="csu-btn csu-btn-primary" (click)="loadLettres(0)">Rechercher</button>
            <button class="csu-btn csu-btn-light" (click)="searchLettres=''; loadLettres(0)">Réinitialiser</button>
          </div>

          <div class="csu-table-wrapper">
            <table class="csu-table table-hover">
              <thead>
                <tr>
                  <th>Date d'émission</th>
                  <th>Référence</th>
                  <th>Patient</th>
                  <th>Expiration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (loadingLettres) {
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <div class="spinner-border text-csu-primary" role="status"></div>
                    </td>
                  </tr>
                } @else if (lettres.length === 0) {
                  <tr>
                    <td colspan="5" class="text-center py-4 text-muted">Aucune lettre de garantie trouvée.</td>
                  </tr>
                } @else {
                  @for (l of lettres; track l.id) {
                    <tr>
                      <td>{{ l.dateEmission | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><b>{{ l.reference }}</b></td>
                      <td>{{ l.patientNom }}</td>
                      <td>
                        <span class="csu-badge" [ngClass]="isExpired(l.dateExpiration) ? 'csu-badge-danger' : 'csu-badge-success'">
                          {{ l.dateExpiration | date:'dd/MM/yyyy' }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex gap-2">
                          <a [routerLink]="['/patients', l.patientId, 'lettre-garantie']" class="csu-btn-icon" title="Voir les détails">
                            <i class="bi bi-eye"></i>
                          </a>
                          <a [routerLink]="['/patients', l.patientId, 'lettre-garantie']" [queryParams]="{ downloadPdf: 'true' }" class="csu-btn-icon" style="color: #d32f2f" title="Télécharger PDF">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
            <!-- Pagination Lettres -->
            <div class="csu-pagination">
              <span class="csu-pagination-info">Page {{ pageLettres + 1 }} sur {{ totalPagesLettres }}</span>
              <div class="csu-pagination-controls">
                <button class="csu-pagination-btn" [disabled]="pageLettres === 0" (click)="loadLettres(pageLettres - 1)"><i class="bi bi-chevron-left"></i></button>
                <button class="csu-pagination-btn" [disabled]="pageLettres >= totalPagesLettres - 1" (click)="loadLettres(pageLettres + 1)"><i class="bi bi-chevron-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-tabs.csu-tabs {
      border-bottom: 2px solid rgba(226, 232, 240, 0.8);
      gap: 1rem;
    }
    .nav-tabs.csu-tabs .nav-link {
      border: none;
      background: transparent;
      color: var(--csu-text-muted);
      font-weight: 600;
      padding: 0.8rem 1.2rem;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
    }
    .nav-tabs.csu-tabs .nav-link:hover {
      color: var(--csu-primary);
    }
    .nav-tabs.csu-tabs .nav-link.active {
      color: var(--csu-primary);
      border-bottom-color: var(--csu-primary);
    }
  `]
})
export class DocumentsGeneresComponent implements OnInit {
  private bonCommandeService = inject(BonCommandeService);
  private lettreService = inject(LettreGarantieService);

  // Etat Onglets
  currentTab = 'bons';

  // Etat Bons
  bons: any[] = [];
  loadingBons = false;
  searchBons = '';
  pageBons = 0;
  sizeBons = 10;
  totalPagesBons = 1;

  // Etat Lettres
  lettres: any[] = [];
  loadingLettres = false;
  searchLettres = '';
  pageLettres = 0;
  sizeLettres = 10;
  totalPagesLettres = 1;

  ngOnInit(): void {
    this.loadBons();
    this.loadLettres();
  }

  switchTab(tab: string): void {
    this.currentTab = tab;
  }

  loadBons(page: number = 0): void {
    this.pageBons = page;
    this.loadingBons = true;
    this.bonCommandeService.getBons(this.pageBons, this.sizeBons, this.searchBons).subscribe({
      next: (data: any) => {
        this.bons = data.content;
        this.totalPagesBons = Math.max(1, data.totalPages);
        this.loadingBons = false;
      },
      error: () => {
        this.loadingBons = false;
      }
    });
  }

  loadLettres(page: number = 0): void {
    this.pageLettres = page;
    this.loadingLettres = true;
    this.lettreService.getLettres(this.pageLettres, this.sizeLettres, this.searchLettres).subscribe({
      next: (data: any) => {
        this.lettres = data.content;
        this.totalPagesLettres = Math.max(1, data.totalPages);
        this.loadingLettres = false;
      },
      error: () => {
        this.loadingLettres = false;
      }
    });
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }
}
