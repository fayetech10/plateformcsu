import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AdminDashboardService } from '../../core/services/admin-dashboard.service';
import { AdminDashboardStats, AdminAgentStats, AdminGeoStats, PonctualiteStats, BureauCarte } from '../../core/models/admin-dashboard.model';
import { PatientChartsComponent } from '../patients/patient-charts.component';
import { PageHeaderComponent, LoadingComponent, EmptyStateComponent } from '../../shared/ui';

type Onglet = 'agents' | 'patients' | 'geo' | 'bureaux' | 'carte' | 'systeme';

/**
 * Gestion des statistiques de la plateforme : vues consolidées par agent,
 * patient, bureau et indicateurs système. Réservé à l'administration.
 */
@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, RouterLink, PatientChartsComponent, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header (composant partagé) -->
      <csu-page-header
        icon="bi-bar-chart-line-fill"
        iconColor="var(--csu-primary)"
        title="Gestion des statistiques"
        subtitle="Analyses consolidées : agents, patients, bureaux et indicateurs système">
        <button (click)="reload()" class="csu-btn csu-btn-light" [disabled]="loading">
          <i class="bi bi-arrow-clockwise" [class.spin]="loading"></i> Actualiser
        </button>
      </csu-page-header>

      <!-- Onglets -->
      <div class="stat-tabs mb-4">
        <button class="stat-tab" [class.active]="onglet === 'agents'" (click)="setOnglet('agents')">
          <i class="bi bi-person-workspace"></i> Agents
        </button>
        <button class="stat-tab" [class.active]="onglet === 'patients'" (click)="setOnglet('patients')">
          <i class="bi bi-people"></i> Patients
        </button>
        <button class="stat-tab" [class.active]="onglet === 'geo'" (click)="setOnglet('geo')">
          <i class="bi bi-geo-alt"></i> Géographie & Année
        </button>
        <button class="stat-tab" [class.active]="onglet === 'bureaux'" (click)="setOnglet('bureaux')">
          <i class="bi bi-building"></i> Bureaux
        </button>
        <button class="stat-tab" [class.active]="onglet === 'carte'" (click)="setOnglet('carte')">
          <i class="bi bi-map"></i> Carte des bureaux
        </button>
        <button class="stat-tab" [class.active]="onglet === 'systeme'" (click)="setOnglet('systeme')">
          <i class="bi bi-diagram-3"></i> Système
        </button>
      </div>

      @if (loading) {
        <csu-loading message="Chargement des statistiques..." />
      } @else if (error) {
        <csu-empty-state icon="bi-exclamation-triangle" title="Impossible de charger les statistiques">
          <button class="csu-btn csu-btn-primary mt-3" (click)="reload()">Réessayer</button>
        </csu-empty-state>
      } @else {

        <!-- ── Onglet AGENTS ── -->
        @if (onglet === 'agents' && agentStats) {
          <div class="stat-kpis mb-4">
            <div class="stat-kpi"><span class="num">{{ agentStats.nbAgents }}</span><span class="lbl">Agents</span></div>
            <div class="stat-kpi"><span class="num">{{ agentStats.moyennePatientsParAgent }}</span><span class="lbl">Patients / agent (moy.)</span></div>
            <div class="stat-kpi"><span class="num">{{ agentStats.moyenneEnrolementsParAgent }}</span><span class="lbl">Enrôlements / agent (moy.)</span></div>
            <div class="stat-kpi top"><span class="num"><i class="bi bi-trophy-fill"></i></span><span class="lbl">Top : {{ agentStats.agentTop || '—' }}</span></div>
            @if (agentStats.agentsSansActivite > 0) {
              <div class="stat-kpi warn"><span class="num">{{ agentStats.agentsSansActivite }}</span><span class="lbl">Agent(s) sans activité</span></div>
            }
          </div>

          <div class="row g-4">
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-graph-up-arrow text-csu-primary"></i> Contributions (top 8)</h3></div>
                @if (agentStats.agents.length > 0) {
                  <div style="position: relative; height: 340px;"><canvas #agentsChartCanvas></canvas></div>
                } @else { <csu-empty-state icon="bi-people" title="Aucun agent" compact /> }
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-list-ol text-csu-secondary"></i> Classement détaillé</h3></div>
                <div class="table-responsive">
                  <table class="csu-table">
                    <thead><tr><th>Agent</th><th class="text-center">Pat.</th><th class="text-center">Enrôl.</th><th class="text-center">Act.</th><th class="text-center">Const.</th><th class="text-center">Total</th></tr></thead>
                    <tbody>
                      @for (a of agentStats.agents; track a.id) {
                        <tr>
                          <td class="fw-semibold">{{ a.prenom }} {{ a.nom }}<div class="text-muted small fw-normal"><i class="bi bi-building"></i> {{ a.bureauNom }}</div></td>
                          <td class="text-center">{{ a.patients }}</td>
                          <td class="text-center">{{ a.enrolements }}</td>
                          <td class="text-center">{{ a.activites }}</td>
                          <td class="text-center">{{ a.constats }}</td>
                          <td class="text-center"><span class="total-badge">{{ a.total }}</span></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Ponctualité des arrivées -->
          @if (ponctualite) {
            <div class="csu-card mt-4">
              <div class="csu-card-header">
                <h3 class="csu-card-title"><i class="bi bi-alarm text-csu-primary"></i> Ponctualité des arrivées</h3>
                <span class="small text-muted">Heure limite : {{ ponctualite.heureLimite }}</span>
              </div>
              <div class="stat-kpis mb-3">
                <div class="stat-kpi ok"><span class="num">{{ ponctualite.aLHeure }}</span><span class="lbl">Arrivées à l'heure</span></div>
                <div class="stat-kpi warn"><span class="num">{{ ponctualite.enRetard }}</span><span class="lbl">Arrivées en retard</span></div>
                <div class="stat-kpi"><span class="num">{{ ponctualite.tauxPonctualite }}%</span><span class="lbl">Taux de ponctualité</span></div>
                <div class="stat-kpi"><span class="num">{{ ponctualite.totalArrivees }}</span><span class="lbl">Arrivées enregistrées</span></div>
              </div>
              @if (ponctualite.agents.length > 0) {
                <div class="table-responsive">
                  <table class="csu-table">
                    <thead><tr><th>Agent</th><th class="text-center">À l'heure</th><th class="text-center">En retard</th><th class="text-center">Ponctualité</th></tr></thead>
                    <tbody>
                      @for (a of ponctualite.agents; track a.agentId) {
                        <tr>
                          <td class="fw-semibold">{{ a.nom }}<div class="text-muted small fw-normal"><i class="bi bi-building"></i> {{ a.bureauNom }}</div></td>
                          <td class="text-center"><span class="punct-pill ok">{{ a.aLHeure }}</span></td>
                          <td class="text-center"><span class="punct-pill" [class.late]="a.enRetard > 0">{{ a.enRetard }}</span></td>
                          <td class="text-center fw-bold" [style.color]="a.tauxPonctualite >= 80 ? '#2E7D32' : (a.tauxPonctualite >= 50 ? '#E65100' : '#C62828')">{{ a.tauxPonctualite }}%</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="text-muted small">Aucune arrivée enregistrée.</div>
              }
            </div>
          }
        }

        <!-- ── Onglet PATIENTS ── -->
        @if (onglet === 'patients') {
          <app-patient-charts />
        }

        <!-- ── Onglet GÉOGRAPHIE & ANNÉE ── -->
        @if (onglet === 'geo' && geoStats) {
          <div class="row g-4">
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-map text-csu-primary"></i> Patients par région</h3></div>
                @for (b of bars(geoStats.parRegion); track b.label) {
                  <div class="bar-row"><span class="bar-name" [title]="b.label">{{ b.label }}</span><div class="bar-track"><div class="bar-fill" [style.width.%]="b.pct" style="background:#00875A"></div></div><span class="bar-val">{{ b.value }}</span></div>
                } @empty { <div class="text-muted small">Aucune donnée.</div> }
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-signpost-split text-csu-secondary"></i> Patients par département</h3></div>
                @for (b of bars(geoStats.parDepartement); track b.label) {
                  <div class="bar-row"><span class="bar-name" [title]="b.label">{{ b.label }}</span><div class="bar-track"><div class="bar-fill" [style.width.%]="b.pct" style="background:#1565C0"></div></div><span class="bar-val">{{ b.value }}</span></div>
                } @empty { <div class="text-muted small">Aucune donnée.</div> }
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-pin-map text-csu-primary"></i> Patients par commune (top 12)</h3></div>
                @for (b of bars(geoStats.parCommune, 12); track b.label) {
                  <div class="bar-row"><span class="bar-name" [title]="b.label">{{ b.label }}</span><div class="bar-track"><div class="bar-fill" [style.width.%]="b.pct" style="background:#F57C00"></div></div><span class="bar-val">{{ b.value }}</span></div>
                } @empty { <div class="text-muted small">Aucune donnée.</div> }
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-calendar3 text-csu-secondary"></i> Patients par année d'enregistrement</h3></div>
                @for (b of bars(geoStats.parAnnee, 30); track b.label) {
                  <div class="bar-row"><span class="bar-name">{{ b.label }}</span><div class="bar-track"><div class="bar-fill" [style.width.%]="b.pct" style="background:#7B1FA2"></div></div><span class="bar-val">{{ b.value }}</span></div>
                } @empty { <div class="text-muted small">Aucune donnée.</div> }
              </div>
            </div>
          </div>
        }

        <!-- ── Onglet BUREAUX ── -->
        @if (onglet === 'bureaux' && stats) {
          <div class="row g-4">
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-bar-chart text-csu-primary"></i> Patients par bureau</h3></div>
                @if (stats.bureauxStats.length > 0) {
                  <div style="position: relative; height: 340px;"><canvas #bureauxChartCanvas></canvas></div>
                } @else { <csu-empty-state icon="bi-building" title="Aucun bureau" compact /> }
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="csu-card h-100">
                <div class="csu-card-header">
                  <h3 class="csu-card-title"><i class="bi bi-table text-csu-secondary"></i> Charge par bureau</h3>
                  <a routerLink="/admin/bureaux" class="small text-csu-primary fw-semibold text-decoration-none">Gérer</a>
                </div>
                <div class="table-responsive">
                  <table class="csu-table">
                    <thead><tr><th>Bureau</th><th>Agents</th><th class="text-center">Pat.</th><th class="text-center">Enrôl.</th><th class="text-center">Act.</th><th class="text-center">Const.</th></tr></thead>
                    <tbody>
                      @for (b of stats.bureauxStats; track b.id) {
                        <tr>
                          <td class="fw-semibold">{{ b.nom }}<div class="text-muted small fw-normal">{{ b.region || '—' }}</div></td>
                          <td class="text-center">{{ b.agents }}</td>
                          <td class="text-center">{{ b.patients }}</td>
                          <td class="text-center">{{ b.enrolements }}</td>
                          <td class="text-center">{{ b.activites }}</td>
                          <td class="text-center">{{ b.constats }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ── Onglet CARTE DES BUREAUX ── -->
        @if (onglet === 'carte') {
          <div class="csu-card">
            <div class="csu-card-header">
              <h3 class="csu-card-title"><i class="bi bi-geo-alt-fill text-csu-primary"></i> Cartographie des bureaux</h3>
              <span class="small text-muted">{{ bureauxCarte.length }} bureau(x) géolocalisé(s) · cliquez un repère</span>
            </div>
            @if (bureauxCarte.length === 0) {
              <csu-empty-state icon="bi-pin-map" title="Aucun bureau géolocalisé"
                message="Renseignez les coordonnées des bureaux pour les afficher sur la carte." />
            }
            <div #mapContainer class="bureaux-map" [class.d-none]="bureauxCarte.length === 0"></div>
          </div>
        }

        <!-- ── Onglet SYSTÈME ── -->
        @if (onglet === 'systeme' && stats) {
          <div class="stat-kpis mb-4">
            <div class="stat-kpi"><span class="num">{{ stats.totalUtilisateurs }}</span><span class="lbl">Utilisateurs</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalBureaux }}</span><span class="lbl">Bureaux</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalCategories }}</span><span class="lbl">Catégories</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalPatients }}</span><span class="lbl">Patients</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalEnrolements }}</span><span class="lbl">Enrôlements</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalActivites }}</span><span class="lbl">Activités</span></div>
            <div class="stat-kpi"><span class="num">{{ stats.totalConstats }}</span><span class="lbl">Constats</span></div>
          </div>

          <div class="csu-card">
            <div class="csu-card-header"><h3 class="csu-card-title"><i class="bi bi-people-fill text-csu-primary"></i> Répartition des utilisateurs par rôle</h3></div>
            <div class="d-flex flex-column gap-2">
              @for (r of roleEntries; track r.key) {
                <div class="role-row">
                  <span class="role-name">{{ roleLabel(r.key) }}</span>
                  <div class="role-bar"><div class="role-fill" [style.width.%]="rolePct(r.value)" [style.background]="r.color"></div></div>
                  <span class="role-count">{{ r.value }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .stat-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--csu-border-light); padding-bottom: 0.25rem; }
    .stat-tab {
      background: transparent; border: none; border-radius: 10px 10px 0 0;
      padding: 0.6rem 1.1rem; font-size: 0.9rem; font-weight: 600; color: var(--csu-text-muted);
      cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
      border-bottom: 3px solid transparent; transition: all 0.15s ease;
    }
    .stat-tab:hover { color: var(--csu-primary); }
    .stat-tab.active { color: var(--csu-primary); border-bottom-color: var(--csu-primary); background: var(--csu-primary-light, rgba(0,135,90,0.06)); }

    .stat-kpis { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .stat-kpi {
      flex: 1; min-width: 130px; background: #fff; border: 1px solid var(--csu-border-light);
      border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .stat-kpi .num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; line-height: 1; color: var(--csu-primary); }
    .stat-kpi .lbl { font-size: 0.76rem; color: var(--csu-text-muted); font-weight: 600; }
    .stat-kpi.top { background: rgba(245,193,7,0.08); border-color: rgba(245,193,7,0.3); }
    .stat-kpi.top .num { color: #F59E0B; font-size: 1.35rem; }
    .stat-kpi.warn { background: rgba(229,57,53,0.06); border-color: rgba(229,57,53,0.25); }
    .stat-kpi.warn .num { color: #C62828; }
    .total-badge { background: var(--csu-primary); color: #fff; font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 0.8rem; padding: 2px 10px; border-radius: 20px; display: inline-block; min-width: 30px; }
    .stat-kpi.ok { background: rgba(67,160,71,0.08); border-color: rgba(67,160,71,0.3); }
    .stat-kpi.ok .num { color: #2E7D32; }
    .punct-pill { font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 0.8rem; padding: 2px 10px; border-radius: 20px; background: rgba(0,0,0,0.06); color: #6B7280; display: inline-block; min-width: 30px; }
    .punct-pill.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .punct-pill.late { background: rgba(229,57,53,0.12); color: #C62828; }
    .bureaux-map { width: 100%; height: 480px; border-radius: 12px; overflow: hidden; border: 1px solid var(--csu-border-light); z-index: 0; }

    .bar-row { display: flex; align-items: center; gap: 12px; padding: 5px 0; }
    .bar-name { width: 140px; font-size: 0.83rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
    .bar-track { flex-grow: 1; height: 9px; border-radius: 6px; background: rgba(0,0,0,0.06); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 6px; transition: width 0.4s ease; }
    .bar-val { font-weight: 800; font-family: 'Outfit', sans-serif; min-width: 34px; text-align: right; font-size: 0.85rem; }

    .role-row { display: flex; align-items: center; gap: 12px; }
    .role-name { width: 120px; font-weight: 600; font-size: 0.85rem; }
    .role-bar { flex-grow: 1; height: 10px; border-radius: 6px; background: rgba(0,0,0,0.06); overflow: hidden; }
    .role-fill { height: 100%; border-radius: 6px; transition: width 0.4s ease; }
    .role-count { font-weight: 800; font-family: 'Outfit', sans-serif; min-width: 30px; text-align: right; }

    .spin { display: inline-block; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class StatistiquesComponent implements OnInit, OnDestroy {
  private adminDashboardService = inject(AdminDashboardService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  @ViewChild('agentsChartCanvas') agentsChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('bureauxChartCanvas') bureauxChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  onglet: Onglet = 'agents';
  loading = true;
  error = false;

  stats?: AdminDashboardStats;
  agentStats?: AdminAgentStats;
  geoStats?: AdminGeoStats;
  ponctualite?: PonctualiteStats;
  bureauxCarte: BureauCarte[] = [];
  roleEntries: Array<{ key: string; value: number; color: string }> = [];
  private roleColors: { [k: string]: string } = { ADMIN: '#E53935', SUPERVISEUR: '#FB8C00', AGENT: '#1E88E5' };

  private agentsChart: any;
  private bureauxChart: any;
  private map: any;
  private L: any;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Chart.register(...registerables);
    }
    this.reload();
  }

  ngOnDestroy(): void {
    if (this.agentsChart) this.agentsChart.destroy();
    if (this.bureauxChart) this.bureauxChart.destroy();
    if (this.map) { this.map.remove(); this.map = undefined; }
  }

  reload(): void {
    this.loading = true;
    this.error = false;
    let done = 0;
    const finish = () => { if (++done === 2) { this.loading = false; this.renderActiveChart(); } };

    this.adminDashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.roleEntries = Object.keys(data.repartitionRoles || {}).map(key => ({
          key, value: data.repartitionRoles[key], color: this.roleColors[key] || '#9CA3AF'
        }));
        finish();
      },
      error: () => { this.error = true; this.loading = false; }
    });

    this.adminDashboardService.getStatsAgents().subscribe({
      next: (data) => { this.agentStats = data; finish(); },
      error: () => { this.error = true; this.loading = false; }
    });

    this.adminDashboardService.getStatsGeo().subscribe({
      next: (data) => { this.geoStats = data; },
      error: (err) => console.error('Erreur chargement stats géo:', err)
    });

    this.adminDashboardService.getStatsPonctualite().subscribe({
      next: (data) => { this.ponctualite = data; },
      error: (err) => console.error('Erreur chargement ponctualité:', err)
    });

    this.adminDashboardService.getBureauxCarte().subscribe({
      next: (data) => { this.bureauxCarte = data; if (this.onglet === 'carte') this.renderActiveChart(); },
      error: (err) => console.error('Erreur chargement carte bureaux:', err)
    });
  }

  /** Convertit une map {clé: valeur} en barres triées avec pourcentage relatif au max. */
  bars(map?: { [k: string]: number }, limit = 12): { label: string; value: number; pct: number }[] {
    if (!map) return [];
    const entries = Object.entries(map);
    const max = Math.max(1, ...entries.map(e => e[1]));
    return entries.slice(0, limit).map(([label, value]) => ({
      label, value, pct: Math.round((value / max) * 100)
    }));
  }

  setOnglet(o: Onglet): void {
    this.onglet = o;
    this.renderActiveChart();
  }

  private renderActiveChart(): void {
    // Laisse Angular peindre le canvas/div de l'onglet avant de dessiner
    setTimeout(() => {
      if (this.onglet === 'agents') this.renderAgentsChart();
      if (this.onglet === 'bureaux') this.renderBureauxChart();
      if (this.onglet === 'carte') this.initMap();
    }, 0);
  }

  private async initMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapContainer || this.bureauxCarte.length === 0) return;

    if (!this.L) {
      const leaflet = await import('leaflet');
      this.L = (leaflet as any).default || leaflet;
      this.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    }

    // (Ré)initialise la carte
    if (this.map) { this.map.remove(); this.map = undefined; }
    this.map = this.L.map(this.mapContainer.nativeElement);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }).addTo(this.map);

    const bounds: [number, number][] = [];
    for (const b of this.bureauxCarte) {
      const agentsHtml = b.agents.length > 0
        ? '<ul style="margin:4px 0 0;padding-left:18px;">' + b.agents.map(a => `<li>${a}</li>`).join('') + '</ul>'
        : '<em>Aucun agent</em>';
      const popup =
        `<div style="min-width:180px">
           <strong>${b.nom}</strong><br/>
           <span style="color:#6B7280;font-size:12px">${b.commune || ''} ${b.region ? '— ' + b.region : ''}</span>
           <div style="margin-top:6px;font-size:12px"><b>${b.nbAgents}</b> agent(s) · <b>${b.patients}</b> patient(s)</div>
           <div style="margin-top:4px;font-size:12px"><b>Agents :</b>${agentsHtml}</div>
           <button class="leaflet-detail-btn" data-id="${b.id}" style="margin-top:8px;background:#00875A;color:#fff;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-weight:600;">Voir le détail</button>
         </div>`;
      const marker = this.L.marker([b.latitude, b.longitude]).addTo(this.map).bindPopup(popup);
      marker.on('popupopen', () => {
        const btn = document.querySelector(`.leaflet-detail-btn[data-id="${b.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => this.router.navigate(['/admin/bureaux', b.id, 'details']), { once: true });
        }
      });
      bounds.push([b.latitude, b.longitude]);
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 15);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private renderAgentsChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.agentsChartCanvas || !this.agentStats) return;
    const ctx = this.agentsChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.agentsChart) this.agentsChart.destroy();
    const top = [...this.agentStats.agents].slice(0, 8);
    this.agentsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top.map(a => `${a.prenom} ${a.nom}`),
        datasets: [
          { label: 'Patients', data: top.map(a => a.patients), backgroundColor: '#F57C00' },
          { label: 'Enrôlements', data: top.map(a => a.enrolements), backgroundColor: '#00875A' },
          { label: 'Activités', data: top.map(a => a.activites), backgroundColor: '#1565C0' },
          { label: 'Constats', data: top.map(a => a.constats), backgroundColor: '#7B1FA2' }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        scales: { x: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }, y: { stacked: true } },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
      }
    });
  }

  private renderBureauxChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.bureauxChartCanvas || !this.stats) return;
    const ctx = this.bureauxChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.bureauxChart) this.bureauxChart.destroy();
    const data = [...this.stats.bureauxStats].slice(0, 10);
    this.bureauxChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(b => b.nom),
        datasets: [
          { label: 'Patients', data: data.map(b => b.patients), backgroundColor: '#00875A' },
          { label: 'Enrôlements', data: data.map(b => b.enrolements), backgroundColor: '#1565C0' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
      }
    });
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateurs';
      case 'SUPERVISEUR': return 'Superviseurs';
      case 'AGENT': return 'Agents';
      default: return role || '—';
    }
  }

  rolePct(value: number): number {
    const total = this.roleEntries.reduce((s, r) => s + r.value, 0) || 1;
    return Math.round((value / total) * 100);
  }
}
