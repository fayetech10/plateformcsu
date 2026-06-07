import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { BonCommande, StatutBon, STATUT_BON_META, STATUT_BON_OPTIONS } from '../../core/models/bon-commande.model';
import { CardListItemComponent } from '../../shared/ui';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bon-commande-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CardListItemComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-receipt-cutoff text-csu-primary"></i>
            Bons de Commande
          </h1>
          <p class="csu-page-subtitle">Établissez des bons à remettre aux patients pour retrait en pharmacie conventionnée</p>
        </div>
        <div class="csu-page-actions">
          <a routerLink="/bons-commande/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Nouveau Bon
          </a>
        </div>
      </div>

      <!-- Filtres -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-6">
            <div class="csu-search-input m-0 w-100">
              <i class="bi bi-search"></i>
              <input type="text" placeholder="Rechercher par référence, patient ou n° dossier..." formControlName="search" />
            </div>
          </div>
          <div class="col-12 col-md-3">
            <select class="csu-form-control csu-form-select" formControlName="statut" (change)="onSearch()">
              <option value="">Tous les statuts</option>
              @for (s of statutOptions; track s) {
                <option [value]="s">{{ meta(s).label }}</option>
              }
            </select>
          </div>
          <div class="col-12 col-md-3 d-flex gap-2">
            <button type="submit" class="csu-btn csu-btn-primary w-100">Rechercher</button>
            <button type="button" class="csu-btn csu-btn-light" (click)="onReset()"><i class="bi bi-arrow-counterclockwise"></i></button>
          </div>
        </form>
      </div>

      @if (loading) {
        <div class="csu-table-wrapper"><div class="csu-loading"><div class="csu-spinner"></div></div></div>
      } @else if (bons.length === 0) {
        <div class="csu-table-wrapper">
          <div class="csu-empty-state">
            <i class="bi bi-receipt"></i>
            <h3>Aucun bon de commande</h3>
            <p>Créez un bon de commande pour un patient.</p>
            <a routerLink="/bons-commande/nouveau" class="csu-btn csu-btn-primary mt-3">Nouveau Bon</a>
          </div>
        </div>
      } @else {
        <!-- Table desktop -->
        <div class="csu-table-wrapper d-none d-lg-block">
          <table class="csu-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Patient</th>
                <th>Pharmacie</th>
                <th>Produits</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of bons; track b.id) {
                <tr>
                  <td><span class="badge bg-light text-dark font-monospace fw-bold">{{ b.reference }}</span></td>
                  <td>
                    <span class="fw-bold text-csu-primary">{{ b.patientNom || '-' }}</span>
                    <div class="small text-muted">{{ b.numeroDossier }}</div>
                  </td>
                  <td>{{ b.pharmacieNom || '—' }}</td>
                  <td><span class="badge bg-light text-dark">{{ (b.lignes || []).length }} ligne(s)</span></td>
                  <td>{{ b.dateCreation | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [ngClass]="meta(b.statut).badge">{{ meta(b.statut).label }}</span></td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/bons-commande', b.id]" class="csu-btn-icon" title="Voir / Imprimer"><i class="bi bi-eye"></i></a>
                      <a [routerLink]="['/bons-commande', b.id, 'modifier']" class="csu-btn-icon" title="Modifier"><i class="bi bi-pencil"></i></a>
                      <button (click)="onDelete(b)" class="csu-btn-icon danger" title="Supprimer"><i class="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Cartes mobile -->
        <div class="csu-list d-lg-none">
          @for (b of bons; track b.id) {
            <csu-list-card>
              <div class="csu-list-card-head">
                <div class="csu-list-card-lead"><i class="bi bi-receipt-cutoff"></i></div>
                <div class="csu-list-card-body">
                  <div class="csu-list-card-title">{{ b.patientNom || '-' }}</div>
                  <div class="csu-list-card-sub">{{ b.reference }}</div>
                </div>
                <span class="csu-badge" [ngClass]="meta(b.statut).badge">{{ meta(b.statut).label }}</span>
              </div>
              <div class="csu-list-card-meta">
                <div class="meta"><span class="meta-label">Pharmacie</span><span class="meta-value">{{ b.pharmacieNom || '—' }}</span></div>
                <div class="meta"><span class="meta-label">Produits</span><span class="meta-value">{{ (b.lignes || []).length }}</span></div>
                <div class="meta"><span class="meta-label">Date</span><span class="meta-value">{{ b.dateCreation | date:'dd/MM/yyyy' }}</span></div>
              </div>
              <div class="csu-list-card-actions">
                <a [routerLink]="['/bons-commande', b.id]" class="csu-btn csu-btn-light"><i class="bi bi-eye"></i> Voir</a>
                <a [routerLink]="['/bons-commande', b.id, 'modifier']" class="csu-btn csu-btn-light"><i class="bi bi-pencil"></i></a>
                <button (click)="onDelete(b)" class="csu-btn csu-btn-light text-csu-danger"><i class="bi bi-trash"></i></button>
              </div>
            </csu-list-card>
          }
        </div>

        <!-- Pagination -->
        <div class="csu-pagination-card">
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} bons
            </div>
            <div class="csu-pagination-controls">
              <button class="csu-pagination-btn" [disabled]="page === 0" (click)="onPageChange(page - 1)"><i class="bi bi-chevron-left"></i></button>
              @for (pNum of getPagesArray(); track pNum) {
                <button class="csu-pagination-btn" [class.active]="pNum === page" (click)="onPageChange(pNum)">{{ pNum + 1 }}</button>
              }
              <button class="csu-pagination-btn" [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)"><i class="bi bi-chevron-right"></i></button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BonCommandeListComponent implements OnInit {
  private bonService = inject(BonCommandeService);
  private fb = inject(FormBuilder);

  bons: BonCommande[] = [];
  loading = false;

  statutOptions = STATUT_BON_OPTIONS;

  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: [''],
    statut: ['']
  });

  meta(s: StatutBon | string) {
    return STATUT_BON_META[s as StatutBon] || STATUT_BON_META.EN_ATTENTE;
  }

  ngOnInit(): void {
    this.loadBons();
  }

  loadBons(): void {
    this.loading = true;
    const { search, statut } = this.filterForm.value;
    this.bonService.getBons(this.page, this.size, search || undefined).subscribe({
      next: (res) => {
        let content = res.content;
        if (statut) content = content.filter(b => b.statut === statut);
        this.bons = content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.bons = [];
        this.totalElements = 0;
        this.totalPages = 0;
      }
    });
  }

  onSearch(): void { this.page = 0; this.loadBons(); }
  onReset(): void { this.filterForm.reset({ search: '', statut: '' }); this.page = 0; this.loadBons(); }
  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) { this.page = newPage; this.loadBons(); }
  }
  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) pages.push(i);
    return pages;
  }

  onDelete(b: BonCommande): void {
    Swal.fire({
      title: 'Supprimer le bon ?',
      text: `Voulez-vous supprimer le bon ${b.reference} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed && b.id) {
        this.bonService.deleteBon(b.id).subscribe({
          next: () => { Swal.fire('Supprimé !', 'Le bon a été supprimé.', 'success'); this.loadBons(); },
          error: () => Swal.fire('Erreur', 'La suppression a échoué.', 'error')
        });
      }
    });
  }
}
