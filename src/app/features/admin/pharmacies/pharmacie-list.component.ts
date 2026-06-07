import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PharmacieService } from '../../../core/services/pharmacie.service';
import { Pharmacie, StatutConvention, STATUT_CONVENTION_META, STATUT_CONVENTION_OPTIONS } from '../../../core/models/pharmacie.model';
import { CardListItemComponent } from '../../../shared/ui';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pharmacie-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CardListItemComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-capsule text-csu-primary"></i>
            Pharmacies Conventionnées
          </h1>
          <p class="csu-page-subtitle">Gérez les pharmacies partenaires et visualisez-les sur la carte selon l'état de leur convention</p>
        </div>
        <div class="csu-page-actions">
          <a routerLink="/admin/pharmacies/nouvelle" class="csu-btn csu-btn-primary">
            <i class="bi bi-plus-lg"></i> Nouvelle Pharmacie
          </a>
        </div>
      </div>

      <!-- ===== Carte ===== -->
      <div class="csu-card mb-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h4 class="m-0 text-csu-primary"><i class="bi bi-geo-alt-fill me-2"></i>Cartographie</h4>
          <!-- Légende -->
          <div class="d-flex flex-wrap gap-3">
            @for (s of statutOptions; track s) {
              <span class="d-inline-flex align-items-center gap-1 small">
                <span class="legend-dot" [style.background]="meta(s).color"></span>{{ meta(s).label }}
              </span>
            }
          </div>
        </div>
        <div #mapContainer class="pharmacie-map"></div>
        @if (!loadingMap && mappablePharmacies.length === 0) {
          <p class="small text-muted mt-2 mb-0"><i class="bi bi-info-circle"></i> Aucune pharmacie géolocalisée pour le moment. Ajoutez les coordonnées d'une pharmacie pour la voir ici.</p>
        }
      </div>

      <!-- Filters -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-6">
            <div class="csu-search-input m-0 w-100">
              <i class="bi bi-search"></i>
              <input type="text" placeholder="Rechercher par nom, commune ou région..." formControlName="search" />
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
            <button type="button" class="csu-btn csu-btn-light" (click)="onReset()">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </form>
      </div>

      <!-- États -->
      @if (loading) {
        <div class="csu-table-wrapper"><div class="csu-loading"><div class="csu-spinner"></div></div></div>
      } @else if (pharmacies.length === 0) {
        <div class="csu-table-wrapper">
          <div class="csu-empty-state">
            <i class="bi bi-capsule"></i>
            <h3>Aucune pharmacie enregistrée</h3>
            <p>Commencez par ajouter une pharmacie conventionnée.</p>
            <a routerLink="/admin/pharmacies/nouvelle" class="csu-btn csu-btn-primary mt-3">Ajouter une pharmacie</a>
          </div>
        </div>
      } @else {
        <!-- Table desktop -->
        <div class="csu-table-wrapper d-none d-lg-block">
          <table class="csu-table">
            <thead>
              <tr>
                <th>Pharmacie</th>
                <th>Responsable</th>
                <th>Commune</th>
                <th>Téléphone</th>
                <th>Convention</th>
                <th>Localisée</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of pharmacies; track p.id) {
                <tr>
                  <td><span class="fw-bold text-csu-primary">{{ p.nom }}</span></td>
                  <td>{{ p.responsable || '-' }}</td>
                  <td>{{ p.commune || '-' }}</td>
                  <td>{{ p.telephone || '-' }}</td>
                  <td>
                    <span class="badge" [style.background]="meta(p.statutConvention).color">
                      {{ meta(p.statutConvention).label }}
                    </span>
                  </td>
                  <td>
                    @if (p.latitude != null && p.longitude != null) {
                      <i class="bi bi-geo-alt-fill text-success" title="Géolocalisée"></i>
                    } @else {
                      <i class="bi bi-geo-alt text-muted" title="Non localisée"></i>
                    }
                  </td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/admin/pharmacies', p.id, 'modifier']" class="csu-btn-icon" title="Modifier">
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
        </div>

        <!-- Cartes mobile -->
        <div class="csu-list d-lg-none">
          @for (p of pharmacies; track p.id) {
            <csu-list-card>
              <div class="csu-list-card-head">
                <div class="csu-list-card-lead"><i class="bi bi-capsule"></i></div>
                <div class="csu-list-card-body">
                  <div class="csu-list-card-title">{{ p.nom }}</div>
                  <div class="csu-list-card-sub">{{ p.commune || '-' }} · {{ p.region || '-' }}</div>
                </div>
                <span class="csu-badge" [style.background]="meta(p.statutConvention).color" [style.color]="'#fff'">
                  {{ meta(p.statutConvention).label }}
                </span>
              </div>
              <div class="csu-list-card-meta">
                <div class="meta"><span class="meta-label">Responsable</span><span class="meta-value">{{ p.responsable || '-' }}</span></div>
                <div class="meta"><span class="meta-label">Téléphone</span><span class="meta-value">{{ p.telephone || '-' }}</span></div>
                <div class="meta"><span class="meta-label">N° Convention</span><span class="meta-value">{{ p.numeroConvention || '-' }}</span></div>
              </div>
              <div class="csu-list-card-actions">
                <a [routerLink]="['/admin/pharmacies', p.id, 'modifier']" class="csu-btn csu-btn-light">
                  <i class="bi bi-pencil"></i> Modifier
                </a>
                <button (click)="onDelete(p)" class="csu-btn csu-btn-light text-csu-danger" aria-label="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </csu-list-card>
          }
        </div>

        <!-- Pagination -->
        <div class="csu-pagination-card">
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} pharmacies
            </div>
            <div class="csu-pagination-controls">
              <button class="csu-pagination-btn" [disabled]="page === 0" (click)="onPageChange(page - 1)" aria-label="Page précédente">
                <i class="bi bi-chevron-left"></i>
              </button>
              @for (pNum of getPagesArray(); track pNum) {
                <button class="csu-pagination-btn" [class.active]="pNum === page" (click)="onPageChange(pNum)">{{ pNum + 1 }}</button>
              }
              <button class="csu-pagination-btn" [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)" aria-label="Page suivante">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pharmacie-map { height: 420px; width: 100%; border-radius: 12px; border: 1px solid var(--csu-border-light, rgba(0,0,0,0.1)); overflow: hidden; z-index: 0; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.15); }
  `]
})
export class PharmacieListComponent implements OnInit, AfterViewInit, OnDestroy {
  private pharmacieService = inject(PharmacieService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLElement>;
  private L: any;
  private map: any;
  private markersLayer: any;
  private readonly defaultCenter: [number, number] = [14.6928, -17.4467]; // Dakar
  loadingMap = true;

  pharmacies: Pharmacie[] = [];
  mappablePharmacies: Pharmacie[] = [];
  loading = false;

  statutOptions = STATUT_CONVENTION_OPTIONS;

  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: [''],
    statut: ['']
  });

  meta(s: StatutConvention) {
    return STATUT_CONVENTION_META[s] || STATUT_CONVENTION_META.AUTRE;
  }

  ngOnInit(): void {
    this.loadPharmacies();
    this.loadMap();
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapContainer) return;

    const leaflet = await import('leaflet');
    this.L = (leaflet as any).default || leaflet;

    this.map = this.L.map(this.mapContainer.nativeElement).setView(this.defaultCenter, 7);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markersLayer = this.L.layerGroup().addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 200);

    // Si les données sont déjà chargées, dessine les marqueurs
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = undefined; }
  }

  /** Charge toutes les pharmacies géolocalisables pour la carte. */
  private loadMap(): void {
    this.loadingMap = true;
    this.pharmacieService.getAllPharmacies().subscribe({
      next: (list) => {
        this.mappablePharmacies = list.filter(p => p.latitude != null && p.longitude != null);
        this.loadingMap = false;
        this.renderMarkers();
      },
      error: () => {
        this.mappablePharmacies = [];
        this.loadingMap = false;
      }
    });
  }

  private renderMarkers(): void {
    if (!this.L || !this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const bounds: [number, number][] = [];
    for (const p of this.mappablePharmacies) {
      const color = this.meta(p.statutConvention).color;
      const marker = this.L.circleMarker([p.latitude, p.longitude], {
        radius: 9,
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9
      });
      marker.bindPopup(this.popupHtml(p));
      marker.addTo(this.markersLayer);
      bounds.push([p.latitude!, p.longitude!]);
    }

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  private popupHtml(p: Pharmacie): string {
    const m = this.meta(p.statutConvention);
    const lines = [
      `<strong>${this.escape(p.nom)}</strong>`,
      `<span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:10px;color:#fff;font-size:11px;background:${m.color}">${m.label}</span>`,
      p.commune ? `<div style="margin-top:6px"><i class="bi bi-geo-alt"></i> ${this.escape(p.commune)}${p.region ? ', ' + this.escape(p.region) : ''}</div>` : '',
      p.telephone ? `<div><i class="bi bi-telephone"></i> ${this.escape(p.telephone)}</div>` : '',
      p.numeroConvention ? `<div><i class="bi bi-file-earmark-text"></i> ${this.escape(p.numeroConvention)}</div>` : ''
    ];
    return lines.filter(Boolean).join('');
  }

  private escape(v: any): string {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  loadPharmacies(): void {
    this.loading = true;
    const { search, statut } = this.filterForm.value;

    this.pharmacieService.getPharmacies(this.page, this.size, search || undefined).subscribe({
      next: (res) => {
        let content = res.content;
        if (statut) {
          content = content.filter(p => p.statutConvention === statut);
        }
        this.pharmacies = content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.pharmacies = [];
        this.totalElements = 0;
        this.totalPages = 0;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadPharmacies();
  }

  onReset(): void {
    this.filterForm.reset({ search: '', statut: '' });
    this.page = 0;
    this.loadPharmacies();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadPharmacies();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) pages.push(i);
    return pages;
  }

  onDelete(p: Pharmacie): void {
    Swal.fire({
      title: 'Supprimer la pharmacie ?',
      text: `Voulez-vous supprimer « ${p.nom} » ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pharmacieService.deletePharmacie(p.id!).subscribe({
          next: () => {
            Swal.fire('Supprimée !', 'La pharmacie a été supprimée.', 'success');
            this.loadPharmacies();
            this.loadMap();
          },
          error: () => Swal.fire('Erreur', 'La suppression a échoué.', 'error')
        });
      }
    });
  }
}
