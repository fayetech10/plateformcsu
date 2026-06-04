import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PermissionService } from '../../core/services/permission.service';
import { DemandePermission } from '../../core/models/permission.model';

/**
 * Flux d'actions concernant l'agent connecté : réponses de l'administration
 * à ses demandes de permission (approuvées / refusées).
 */
@Component({
  selector: 'app-agent-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="csu-card mb-4">
      <div class="csu-card-header">
        <h3 class="csu-card-title">
          <i class="bi bi-bell text-csu-primary"></i>
          Actions me concernant
          @if (nonLues > 0) { <span class="notif-count">{{ nonLues }}</span> }
        </h3>
        <a routerLink="/permissions" class="small text-csu-primary fw-semibold text-decoration-none">Voir mes demandes</a>
      </div>

      @if (loading) {
        <div class="csu-loading"><div class="csu-spinner"></div></div>
      } @else if (actions.length > 0) {
        <div class="d-flex flex-column gap-2">
          @for (d of actions; track d.id) {
            <div class="notif-item" [ngClass]="d.statut === 'APPROUVEE' ? 'ok' : 'no'">
              <div class="notif-ico">
                <i class="bi" [ngClass]="d.statut === 'APPROUVEE' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
              </div>
              <div class="flex-grow-1 min-w-0">
                <div class="notif-title">
                  Votre demande de <strong>{{ typeLabel(d.type) }}</strong>
                  ({{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }})
                  a été <strong>{{ d.statut === 'APPROUVEE' ? 'approuvée' : 'refusée' }}</strong>
                </div>
                @if (d.commentaireAdmin) {
                  <div class="notif-comment"><i class="bi bi-chat-left-quote"></i> {{ d.commentaireAdmin }}</div>
                }
                <div class="notif-meta">
                  @if (d.traiteeParNom) { Par {{ d.traiteeParNom }} · }
                  {{ d.dateTraitement }}
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="csu-empty-state">
          <i class="bi bi-bell-slash"></i>
          <h3>Aucune action</h3>
          <p>Les réponses de l'administration à vos demandes apparaîtront ici.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-count { background: #E53935; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
    .notif-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--csu-border-light); }
    .notif-item.ok { background: rgba(67,160,71,0.05); border-color: rgba(67,160,71,0.2); }
    .notif-item.no { background: rgba(229,57,53,0.04); border-color: rgba(229,57,53,0.18); }
    .notif-ico { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }
    .notif-item.ok .notif-ico { color: #2E7D32; }
    .notif-item.no .notif-ico { color: #C62828; }
    .notif-title { font-size: 0.9rem; line-height: 1.35; }
    .notif-comment { margin-top: 5px; font-size: 0.83rem; color: #555; background: var(--csu-bg); padding: 6px 10px; border-radius: 8px; }
    .notif-meta { margin-top: 5px; font-size: 0.75rem; color: var(--csu-text-muted); font-weight: 600; }
  `]
})
export class AgentNotificationsComponent implements OnInit {
  private permissionService = inject(PermissionService);

  actions: DemandePermission[] = [];
  loading = true;
  nonLues = 0;

  ngOnInit(): void {
    this.permissionService.mesDemandes().subscribe({
      next: (demandes) => {
        // Uniquement les demandes auxquelles l'admin a répondu
        this.actions = demandes
          .filter(d => d.statut === 'APPROUVEE' || d.statut === 'REFUSEE')
          .sort((a, b) => (b.dateTraitement || '').localeCompare(a.dateTraitement || ''));
        this.nonLues = this.actions.length;
        this.loading = false;
      },
      error: () => { this.actions = []; this.loading = false; }
    });
  }

  typeLabel(t: string): string {
    const map: { [k: string]: string } = { CONGE: 'Congé', ABSENCE: 'Absence', RETARD: 'Retard', SORTIE: 'Sortie', AUTRE: 'Autre' };
    return map[t] || t;
  }
}
