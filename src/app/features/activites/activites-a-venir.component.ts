import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActiviteService } from '../../core/services/activite.service';
import { Activite } from '../../core/models/activite.model';

/**
 * Widget dashboard : prochaines activités planifiées de l'agent / du bureau.
 */
@Component({
  selector: 'app-activites-a-venir',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="csu-card h-100">
      <div class="csu-card-header">
        <h3 class="csu-card-title"><i class="bi bi-calendar-event text-csu-primary"></i> Activités à venir</h3>
        <a routerLink="/activites/agenda" class="small text-csu-primary fw-semibold text-decoration-none">Agenda</a>
      </div>

      @if (loading) {
        <div class="csu-loading"><div class="csu-spinner"></div></div>
      } @else if (activites.length > 0) {
        <div class="d-flex flex-column gap-2">
          @for (a of activites; track a.id) {
            <div class="upc-item" [routerLink]="['/activites', a.id, 'modifier']">
              <div class="upc-date">
                <span class="d">{{ a.dateActivite | date:'dd' }}</span>
                <span class="m">{{ a.dateActivite | date:'MMM' }}</span>
              </div>
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold text-truncate">{{ getTypeLabel(a.typeActivite) }}</div>
                <div class="text-muted small text-truncate">{{ a.description }}</div>
              </div>
              <span class="badge-plan">Planifiée</span>
            </div>
          }
        </div>
      } @else {
        <div class="csu-empty-state">
          <i class="bi bi-calendar-check"></i>
          <h3>Aucune activité planifiée</h3>
          <p>Planifiez une activité pour la voir apparaître ici.</p>
          <a routerLink="/activites/nouveau" class="csu-btn csu-btn-primary mt-2">Planifier</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .upc-item { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
    .upc-item:hover { background: var(--csu-border-light); }
    .upc-date { width: 46px; height: 46px; border-radius: 12px; background: rgba(245,124,0,0.1); color: #E65100; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .upc-date .d { font-weight: 800; font-size: 1.05rem; line-height: 1; }
    .upc-date .m { font-size: 0.62rem; text-transform: uppercase; font-weight: 700; }
    .badge-plan { font-size: 0.66rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(245,124,0,0.14); color: #E65100; white-space: nowrap; }
  `]
})
export class ActivitesAVenirComponent implements OnInit {
  private activiteService = inject(ActiviteService);

  activites: Activite[] = [];
  loading = true;

  ngOnInit(): void {
    this.activiteService.getAVenir().subscribe({
      next: (data) => { this.activites = data; this.loading = false; },
      error: () => { this.activites = []; this.loading = false; }
    });
  }

  getTypeLabel(type: string): string {
    const map: { [k: string]: string } = {
      SENSIBILISATION: 'Sensibilisation', FORMATION: 'Formation', REUNION: 'Réunion',
      VISITE_TERRAIN: 'Visite terrain', ASSISTANCE_ADMINISTRATIVE: 'Assistance admin.'
    };
    return map[type] || type;
  }
}
