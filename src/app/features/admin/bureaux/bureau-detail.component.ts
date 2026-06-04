import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { BureauDetail } from '../../../core/models/admin-dashboard.model';

type Tab = 'agents' | 'patients' | 'activites' | 'enrolements' | 'constats';

@Component({
  selector: 'app-bureau-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Breadcrumb / back -->
      <div class="mb-3">
        <a routerLink="/dashboard" class="text-decoration-none text-muted small">
          <i class="bi bi-arrow-left"></i> Retour au tableau de bord
        </a>
      </div>

      @if (loading) {
        <div class="csu-loading"><div class="csu-spinner"></div></div>
      } @else if (error) {
        <div class="csu-empty-state">
          <i class="bi bi-exclamation-triangle text-warning"></i>
          <h3>Bureau introuvable</h3>
          <a routerLink="/dashboard" class="csu-btn csu-btn-primary mt-3">Retour</a>
        </div>
      } @else if (detail) {
        <!-- Header -->
        <div class="csu-page-header">
          <div>
            <h1 class="csu-page-title">
              <i class="bi bi-building text-csu-primary"></i>
              {{ detail.bureau.nom }}
              <span class="status-pill ms-2" [class.off]="!detail.bureau.actif">{{ detail.bureau.actif ? 'Actif' : 'Inactif' }}</span>
            </h1>
            <p class="csu-page-subtitle">
              {{ detail.bureau.type || 'Bureau CSU' }}
              @if (detail.bureau.code) { · Code {{ detail.bureau.code }} }
            </p>
          </div>
          <a [routerLink]="['/admin/bureaux', detail.bureau.id, 'modifier']" class="csu-btn csu-btn-light">
            <i class="bi bi-pencil"></i> Modifier le bureau
          </a>
        </div>

        <!-- Infos bureau -->
        <div class="csu-card mb-4">
          <div class="row g-3">
            <div class="col-6 col-md-3 info-item"><span class="lbl">Région</span><span class="val">{{ detail.bureau.region || '—' }}</span></div>
            <div class="col-6 col-md-3 info-item"><span class="lbl">Département</span><span class="val">{{ detail.bureau.departement || '—' }}</span></div>
            <div class="col-6 col-md-3 info-item"><span class="lbl">Commune</span><span class="val">{{ detail.bureau.commune || '—' }}</span></div>
            <div class="col-6 col-md-3 info-item"><span class="lbl">Téléphone</span><span class="val">{{ detail.bureau.telephone || '—' }}</span></div>
            <div class="col-12 info-item"><span class="lbl">Adresse</span><span class="val">{{ detail.bureau.adresse || '—' }}</span></div>
          </div>
        </div>

        <!-- KPI -->
        <div class="kpi-grid-container">
          <div class="kpi-grid">
            <div class="kpi-card stat" [class.active]="tab === 'agents'" (click)="tab = 'agents'">
              <div class="kpi-icon-wrap users"><i class="bi bi-people-fill"></i></div>
              <div class="kpi-content"><span class="kpi-value">{{ detail.stats.agents }}</span><span class="kpi-label">Agents</span></div>
            </div>
            <div class="kpi-card stat" [class.active]="tab === 'patients'" (click)="tab = 'patients'">
              <div class="kpi-icon-wrap patients"><i class="bi bi-person-vcard"></i></div>
              <div class="kpi-content"><span class="kpi-value">{{ detail.stats.patients }}</span><span class="kpi-label">Patients</span></div>
            </div>
            <div class="kpi-card stat" [class.active]="tab === 'enrolements'" (click)="tab = 'enrolements'">
              <div class="kpi-icon-wrap enrol"><i class="bi bi-person-check"></i></div>
              <div class="kpi-content"><span class="kpi-value">{{ detail.stats.enrolements }}</span><span class="kpi-label">Enrôlements</span></div>
            </div>
            <div class="kpi-card stat" [class.active]="tab === 'activites'" (click)="tab = 'activites'">
              <div class="kpi-icon-wrap activites"><i class="bi bi-calendar2-event"></i></div>
              <div class="kpi-content"><span class="kpi-value">{{ detail.stats.activites }}</span><span class="kpi-label">Activités</span></div>
            </div>
            <div class="kpi-card stat" [class.active]="tab === 'constats'" (click)="tab = 'constats'">
              <div class="kpi-icon-wrap constats"><i class="bi bi-clipboard-check"></i></div>
              <div class="kpi-content"><span class="kpi-value">{{ detail.stats.constats }}</span><span class="kpi-label">Constats</span></div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="csu-card mt-4">
          <div class="tab-nav">
            <button class="tab-btn" [class.active]="tab === 'agents'" (click)="tab = 'agents'">Agents ({{ detail.stats.agents }})</button>
            <button class="tab-btn" [class.active]="tab === 'patients'" (click)="tab = 'patients'">Patients ({{ detail.stats.patients }})</button>
            <button class="tab-btn" [class.active]="tab === 'enrolements'" (click)="tab = 'enrolements'">Enrôlements ({{ detail.stats.enrolements }})</button>
            <button class="tab-btn" [class.active]="tab === 'activites'" (click)="tab = 'activites'">Activités ({{ detail.stats.activites }})</button>
            <button class="tab-btn" [class.active]="tab === 'constats'" (click)="tab = 'constats'">Constats ({{ detail.stats.constats }})</button>
          </div>

          <div class="table-responsive mt-3">
            <!-- AGENTS -->
            @if (tab === 'agents') {
              @if (detail.agents.length > 0) {
                <table class="csu-table">
                  <thead><tr><th>Nom complet</th><th>Rôle</th><th>Email</th><th>Téléphone</th><th class="text-center">Statut</th></tr></thead>
                  <tbody>
                    @for (a of detail.agents; track a.id) {
                      <tr>
                        <td class="fw-semibold">{{ a.prenom }} {{ a.nom }}</td>
                        <td><span class="role-badge" [ngClass]="'role-' + (a.role || '').toLowerCase()">{{ roleLabel(a.role) }}</span></td>
                        <td class="text-muted">{{ a.email || '—' }}</td>
                        <td class="text-muted">{{ a.telephone || '—' }}</td>
                        <td class="text-center"><span class="status-pill" [class.off]="!a.actif">{{ a.actif ? 'Actif' : 'Inactif' }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else { <div class="csu-empty-state"><i class="bi bi-people"></i><h3>Aucun agent rattaché</h3></div> }
            }

            <!-- PATIENTS -->
            @if (tab === 'patients') {
              @if (detail.patients.length > 0) {
                <table class="csu-table">
                  <thead><tr><th>N° Dossier</th><th>Nom complet</th><th>Sexe</th><th>Catégorie</th><th>Commune</th><th>Agent</th><th>Enregistré le</th></tr></thead>
                  <tbody>
                    @for (p of detail.patients; track p.id) {
                      <tr [routerLink]="['/patients', p.id]" class="clickable-row">
                        <td class="fw-semibold">{{ p.numeroDossier || '—' }}</td>
                        <td>{{ p.prenom }} {{ p.nom }}</td>
                        <td>{{ p.sexe || '—' }}</td>
                        <td>{{ p.categorie || '—' }}</td>
                        <td class="text-muted">{{ p.commune || '—' }}</td>
                        <td class="text-muted">{{ p.agent }}</td>
                        <td class="text-muted">{{ p.date }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else { <div class="csu-empty-state"><i class="bi bi-person-vcard"></i><h3>Aucun patient</h3></div> }
            }

            <!-- ENROLEMENTS -->
            @if (tab === 'enrolements') {
              @if (detail.enrolements.length > 0) {
                <table class="csu-table">
                  <thead><tr><th>N° Bénéficiaire</th><th>Patient</th><th>Statut</th><th>Agent</th><th>Date</th></tr></thead>
                  <tbody>
                    @for (e of detail.enrolements; track e.id) {
                      <tr>
                        <td class="fw-semibold">{{ e.numeroBeneficiaire || '—' }}</td>
                        <td>{{ e.patient }}</td>
                        <td><span class="tag" [ngClass]="'st-' + (e.statut || '').toLowerCase()">{{ e.statut || '—' }}</span></td>
                        <td class="text-muted">{{ e.agent }}</td>
                        <td class="text-muted">{{ e.date }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else { <div class="csu-empty-state"><i class="bi bi-person-check"></i><h3>Aucun enrôlement</h3></div> }
            }

            <!-- ACTIVITES -->
            @if (tab === 'activites') {
              @if (detail.activites.length > 0) {
                <table class="csu-table">
                  <thead><tr><th>Type</th><th>Description</th><th class="text-center">Participants</th><th>Agent</th><th>Date</th></tr></thead>
                  <tbody>
                    @for (a of detail.activites; track a.id) {
                      <tr>
                        <td class="fw-semibold">{{ a.typeActivite || '—' }}</td>
                        <td class="text-muted text-truncate" style="max-width: 300px;">{{ a.description || '—' }}</td>
                        <td class="text-center">{{ a.nombreParticipants ?? '—' }}</td>
                        <td class="text-muted">{{ a.agent }}</td>
                        <td class="text-muted">{{ a.date }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else { <div class="csu-empty-state"><i class="bi bi-calendar2-event"></i><h3>Aucune activité</h3></div> }
            }

            <!-- CONSTATS -->
            @if (tab === 'constats') {
              @if (detail.constats.length > 0) {
                <table class="csu-table">
                  <thead><tr><th>Référence</th><th>Description</th><th>Priorité</th><th>Statut</th><th>Responsable</th><th>Date</th></tr></thead>
                  <tbody>
                    @for (c of detail.constats; track c.id) {
                      <tr>
                        <td class="fw-semibold">{{ c.referenceConstat || '—' }}</td>
                        <td class="text-muted text-truncate" style="max-width: 280px;">{{ c.description || '—' }}</td>
                        <td><span class="tag" [ngClass]="'pr-' + (c.priorite || '').toLowerCase()">{{ c.priorite || '—' }}</span></td>
                        <td><span class="tag" [ngClass]="'st-' + (c.statut || '').toLowerCase()">{{ c.statut || '—' }}</span></td>
                        <td class="text-muted">{{ c.responsable }}</td>
                        <td class="text-muted">{{ c.date }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else { <div class="csu-empty-state"><i class="bi bi-clipboard-check"></i><h3>Aucun constat</h3></div> }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .info-item { display: flex; flex-direction: column; gap: 2px; }
    .info-item .lbl { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--csu-text-muted); font-weight: 600; }
    .info-item .val { font-weight: 600; color: var(--csu-text); }

    .kpi-grid-container { width: 100%; overflow-x: auto; padding-bottom: 0.5rem; }
    .kpi-grid { display: flex; flex-wrap: nowrap; gap: 1rem; min-width: min-content; }
    .kpi-card {
      flex: 1; min-width: 160px; background: #fff; border-radius: 16px; padding: 1rem;
      display: flex; align-items: center; gap: 0.75rem; border: 1px solid rgba(0,0,0,0.04);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease;
    }
    .kpi-card.stat { cursor: pointer; }
    .kpi-card.stat:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .kpi-card.active { border-color: var(--csu-primary); box-shadow: 0 0 0 2px rgba(0,135,90,0.2); }
    .kpi-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
    .kpi-icon-wrap.users { background: rgba(21,101,192,0.08); color: #1565C0; }
    .kpi-icon-wrap.patients { background: rgba(245,124,0,0.08); color: #F57C00; }
    .kpi-icon-wrap.enrol { background: rgba(0,135,90,0.08); color: #00875A; }
    .kpi-icon-wrap.activites { background: rgba(123,31,162,0.08); color: #7B1FA2; }
    .kpi-icon-wrap.constats { background: rgba(2,136,209,0.08); color: #0288D1; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-value { font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; line-height: 1.1; }
    .kpi-label { font-size: 0.8rem; color: var(--csu-text-muted); font-weight: 600; }

    .tab-nav { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 2px solid var(--csu-border-light); }
    .tab-btn { background: transparent; border: none; padding: 10px 16px; font-weight: 600; font-size: 0.88rem; color: var(--csu-text-muted); border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; transition: all 0.15s ease; }
    .tab-btn:hover { color: var(--csu-text); }
    .tab-btn.active { color: var(--csu-primary); border-bottom-color: var(--csu-primary); }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: var(--csu-border-light); }

    .status-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(67,160,71,0.12); color: #2E7D32; white-space: nowrap; }
    .status-pill.off { background: rgba(0,0,0,0.06); color: #6B7280; }
    .role-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
    .role-badge.role-admin { background: rgba(229,57,53,0.1); color: #C62828; }
    .role-badge.role-superviseur { background: rgba(245,124,0,0.1); color: #E65100; }
    .role-badge.role-agent { background: rgba(21,101,192,0.1); color: #1565C0; }

    .tag { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(0,0,0,0.06); color: #555; white-space: nowrap; }
    .tag.st-valide, .tag.st-resolu { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .tag.st-en_cours, .tag.st-ouvert { background: rgba(2,136,209,0.12); color: #0277BD; }
    .tag.st-rejete, .tag.st-suspendu { background: rgba(229,57,53,0.1); color: #C62828; }
    .tag.pr-urgente, .tag.pr-haute { background: rgba(229,57,53,0.1); color: #C62828; }
    .tag.pr-moyenne { background: rgba(245,124,0,0.12); color: #E65100; }
    .tag.pr-basse { background: rgba(67,160,71,0.12); color: #2E7D32; }
  `]
})
export class BureauDetailComponent implements OnInit {
  private adminDashboardService = inject(AdminDashboardService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  detail?: BureauDetail;
  loading = true;
  error = false;
  tab: Tab = 'agents';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = true; this.loading = false; return; }
    this.adminDashboardService.getBureauDetail(id).subscribe({
      next: (data) => { this.detail = data; this.loading = false; },
      error: (err) => { console.error('Erreur détail bureau:', err); this.error = true; this.loading = false; }
    });
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'SUPERVISEUR': return 'Superviseur';
      case 'AGENT': return 'Agent';
      default: return role || '—';
    }
  }
}
