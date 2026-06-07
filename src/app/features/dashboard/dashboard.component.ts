import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { PointageReminderComponent } from '../pointage/pointage-reminder.component';
import { AgentNotificationsComponent } from '../pointage/agent-notifications.component';
import { ActivitesAVenirComponent } from '../activites/activites-a-venir.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PointageReminderComponent, AgentNotificationsComponent, ActivitesAVenirComponent],
  template: `
    <div class="dash animate-fade-in">

      <!-- Rappel de pointage (visible dès l'entrée) -->
      <app-pointage-reminder />

      <!-- ════════ HERO ════════ -->
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="hero-main">
          <span class="hero-chip"><span class="dot-live"></span> Espace agent</span>
          <h1>{{ greeting }}, {{ prenom }} 👋</h1>
          <p class="hero-date">{{ today | date:'EEEE d MMMM y' }}</p>
          <p class="hero-summary">{{ resume }}</p>
          <div class="hero-actions">
            <button (click)="triggerNewAction()" class="hero-btn primary"><i class="bi bi-plus-lg"></i> Nouvelle action</button>
            <a routerLink="/patients" class="hero-btn ghost"><i class="bi bi-people"></i> Mes patients</a>
          </div>
        </div>

        <div class="hero-today">
          <div class="ht-num">{{ stats?.activitesDuJour?.length || 0 }}</div>
          <div class="ht-lbl">activité(s)<br>aujourd'hui</div>
        </div>
      </section>

      <!-- Notifications agent -->
      <app-agent-notifications />

      <!-- ════════ BENTO KPI ════════ -->
      <section class="bento">
        <div class="kpi accent-blue" routerLink="/patients">
          <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-people-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
          <div class="kpi-val">{{ stats?.totalPatients || 0 }}</div>
          <div class="kpi-lbl">Patients</div>
          <div class="kpi-foot subtle">Dossiers enregistrés</div>
        </div>

        <div class="kpi accent-green" routerLink="/enrolements">
          <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-person-check-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
          <div class="kpi-val">{{ stats?.totalBeneficiaires || 0 }}</div>
          <div class="kpi-lbl">Bénéficiaires</div>
          <div class="kpi-foot subtle">Enrôlés à la CSU</div>
        </div>

        <div class="kpi accent-purple" routerLink="/activites">
          <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-calendar2-event-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
          <div class="kpi-val">{{ stats?.totalActivites || 0 }}</div>
          <div class="kpi-lbl">Activités</div>
          <div class="kpi-foot subtle">{{ stats?.activitesDuJour?.length || 0 }} aujourd'hui</div>
        </div>

        <div class="kpi accent-orange" routerLink="/constats">
          <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-clipboard-check-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
          <div class="kpi-val">{{ stats?.totalConstats || 0 }}</div>
          <div class="kpi-lbl">Constats</div>
          <div class="kpi-foot subtle">Signalements suivis</div>
        </div>
      </section>

      <!-- ════════ CHART + ACTIVITÉS DU JOUR ════════ -->
      <div class="grid-2">
        <div class="panel">
          <div class="panel-head">
            <h3><i class="bi bi-graph-up-arrow"></i> Activité d'enrôlement mensuelle</h3>
            <span class="tag-year">Année courante</span>
          </div>
          <div style="height: 300px; position: relative;">
            <canvas #monthlyChartCanvas></canvas>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3><i class="bi bi-clock-fill"></i> Activités du jour</h3>
            <a routerLink="/activites" class="link">Tout voir</a>
          </div>

          @if (stats?.activitesDuJour && stats!.activitesDuJour.length > 0) {
            <div class="acts">
              @for (act of stats?.activitesDuJour; track act.id) {
                <div class="act-item">
                  <div class="act-dot"></div>
                  <div class="flex-grow-1 min-w-0">
                    <h4 class="act-title text-truncate">{{ act.typeActivite }}</h4>
                    <p class="act-desc text-truncate">{{ act.description }}</p>
                  </div>
                  <span class="act-time">{{ act.date }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="csu-empty-state">
              <i class="bi bi-calendar-x" style="font-size:2.5rem;opacity:0.3;"></i>
              <h3>Aucune activité</h3>
              <p>Aucune activité enregistrée aujourd'hui.</p>
            </div>
          }
        </div>
      </div>

      <!-- Prochaines activités planifiées -->
      <app-activites-a-venir />
    </div>
  `,
  styles: [`
    .dash { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 1rem; }

    /* ════════ HERO ════════ */
    .hero {
      position: relative; overflow: hidden; border-radius: 24px; padding: 1.75rem 2rem;
      background: linear-gradient(135deg, #016b48 0%, #00875A 42%, #00b074 78%, #12a7b8 130%);
      color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
      box-shadow: 0 18px 40px -18px rgba(0,135,90,0.55);
    }
    .hero-glow { position: absolute; inset: 0; background:
      radial-gradient(620px 320px at 88% -30%, rgba(255,255,255,0.22), transparent 60%),
      radial-gradient(420px 260px at 8% 130%, rgba(255,255,255,0.12), transparent 60%);
      pointer-events: none; }
    .hero-main { position: relative; z-index: 1; flex: 1 1 320px; }
    .hero-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; background: rgba(255,255,255,0.16); padding: 5px 12px; border-radius: 30px; backdrop-filter: blur(6px); }
    .dot-live { width: 7px; height: 7px; border-radius: 50%; background: #B9F6CA; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(185,246,202,0.7); } 70% { box-shadow: 0 0 0 8px rgba(185,246,202,0); } 100% { box-shadow: 0 0 0 0 rgba(185,246,202,0); } }
    .hero h1 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: clamp(1.5rem, 3vw, 2.1rem); margin: 0.7rem 0 0.2rem; letter-spacing: -0.02em; }
    .hero-date { text-transform: capitalize; opacity: 0.9; font-weight: 600; margin: 0; font-size: 0.9rem; }
    .hero-summary { margin: 0.7rem 0 0; font-size: 0.95rem; opacity: 0.95; max-width: 540px; line-height: 1.45; }
    .hero-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1rem; }
    .hero-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 0.85rem; padding: 9px 16px; border-radius: 12px;
      text-decoration: none; border: none; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
    .hero-btn.primary { background: #fff; color: #00875A; }
    .hero-btn.primary:hover { transform: translateY(-2px); }
    .hero-btn.ghost { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .hero-btn.ghost:hover { background: rgba(255,255,255,0.25); }

    .hero-today { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      width: 132px; height: 132px; border-radius: 24px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22); backdrop-filter: blur(6px); flex-shrink: 0; }
    .ht-num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 2.6rem; line-height: 1; }
    .ht-lbl { font-size: 0.74rem; opacity: 0.9; font-weight: 600; text-align: center; margin-top: 4px; }

    /* ════════ BENTO KPI ════════ */
    .bento { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .kpi { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 18px; padding: 1.2rem; cursor: pointer;
      position: relative; overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .kpi::before { content: ''; position: absolute; top: -40%; right: -25%; width: 150px; height: 150px; border-radius: 50%; opacity: 0.1; }
    .kpi:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -16px rgba(0,0,0,0.25); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
    .kpi-ic { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; font-size: 1.3rem; color: #fff; }
    .kpi-go { color: var(--csu-text-muted); opacity: 0; transform: translate(-4px,4px); transition: all 0.25s ease; }
    .kpi:hover .kpi-go { opacity: 1; transform: translate(0,0); }
    .kpi-val { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 2rem; line-height: 1; letter-spacing: -0.02em; }
    .kpi-lbl { font-size: 0.85rem; color: var(--csu-text-muted); font-weight: 600; margin-top: 4px; }
    .kpi-foot { font-size: 0.76rem; font-weight: 600; color: var(--csu-text-muted); margin-top: 0.55rem; }
    .kpi-foot.subtle { margin-top: 0.8rem; }
    .accent-blue   .kpi-ic { background: linear-gradient(135deg,#1565C0,#42A5F5); } .accent-blue::before { background:#1565C0; }
    .accent-green  .kpi-ic { background: linear-gradient(135deg,#00875A,#00C67B); } .accent-green::before { background:#00875A; }
    .accent-purple .kpi-ic { background: linear-gradient(135deg,#7B1FA2,#AB47BC); } .accent-purple::before { background:#7B1FA2; }
    .accent-orange .kpi-ic { background: linear-gradient(135deg,#F57C00,#FFB74D); } .accent-orange::before { background:#F57C00; }

    /* ════════ PANELS ════════ */
    .panel { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 18px; padding: 1.3rem 1.4rem; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
    .panel-head h3 { display: flex; align-items: center; gap: 9px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.05rem; margin: 0; }
    .panel-head h3 i { color: var(--csu-primary); }
    .panel-head .link { font-size: 0.82rem; font-weight: 700; color: var(--csu-primary); text-decoration: none; }
    .tag-year { font-size: 0.74rem; font-weight: 700; padding: 4px 11px; border-radius: 20px; background: rgba(0,135,90,0.1); color: var(--csu-primary); }
    .grid-2 { display: grid; grid-template-columns: 7fr 5fr; gap: 1.25rem; }

    /* Activités du jour */
    .acts { display: flex; flex-direction: column; gap: 0.4rem; }
    .act-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; transition: background 0.2s ease; }
    .act-item:hover { background: var(--csu-bg, #f6f8fa); }
    .act-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--csu-primary); flex-shrink: 0; box-shadow: 0 0 0 3px rgba(0,135,90,0.15); }
    .act-title { font-size: 0.85rem; font-weight: 700; margin: 0; }
    .act-desc { font-size: 0.78rem; color: var(--csu-text-muted); margin: 0; }
    .act-time { font-size: 0.74rem; font-weight: 700; color: var(--csu-text-muted); background: var(--csu-bg, #f1f5f9); padding: 4px 9px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; }

    /* ════════ RESPONSIVE ════════ */
    @media (max-width: 1100px) {
      .bento { grid-template-columns: repeat(2, 1fr); }
      .grid-2 { grid-template-columns: 1fr; }
    }
    @media (max-width: 576px) {
      .hero { padding: 1.3rem 1.2rem; border-radius: 20px; }
      .hero-today { width: 100%; height: 86px; flex-direction: row; gap: 12px; border-radius: 16px; }
      .ht-num { font-size: 2rem; }
      .ht-lbl { text-align: left; }
      .bento { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
      .kpi { padding: 1rem; border-radius: 14px; }
      .kpi-val { font-size: 1.6rem; }
      .panel { padding: 1.1rem; border-radius: 14px; }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('monthlyChartCanvas') monthlyChartCanvas!: ElementRef<HTMLCanvasElement>;

  stats?: DashboardStats;
  chart: any;
  today = new Date();

  get prenom(): string {
    return this.authService.currentUserValue?.prenom || 'Agent';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  /** Phrase de synthèse construite à partir des données de l'agent. */
  get resume(): string {
    if (!this.stats) return 'Voici votre activité du jour.';
    const nbJour = this.stats.activitesDuJour?.length || 0;
    const parts = [
      `${this.stats.totalPatients} patient${this.stats.totalPatients > 1 ? 's' : ''}`,
      `${this.stats.totalBeneficiaires} bénéficiaire${this.stats.totalBeneficiaires > 1 ? 's' : ''}`
    ];
    const base = 'Votre suivi : ' + parts.join(' · ') + '.';
    return nbJour > 0
      ? base + ` ${nbJour} activité${nbJour > 1 ? 's' : ''} prévue${nbJour > 1 ? 's' : ''} aujourd'hui.`
      : base + " Aucune activité aujourd'hui pour le moment.";
  }

  triggerNewAction(): void {
    window.dispatchEvent(new CustomEvent('csu:open-quick-menu'));
  }

  ngOnInit(): void {
    Chart.register(...registerables);
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadMonthlyChartData();
    }
  }

  private loadDashboardStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.stats = {
          totalPatients: 0,
          totalBeneficiaires: 0,
          totalActivites: 0,
          totalConstats: 0,
          activitesDuJour: [],
          statistiquesMensuelles: { labels: [], patients: [], enrolements: [] }
        };
        this.renderChart();
      }
    });
  }

  private loadMonthlyChartData(): void {
    this.dashboardService.getMonthlyStats().subscribe({
      next: (data) => {
        if (this.stats) {
          this.stats.statistiquesMensuelles = data;
        }
        this.renderChart();
      },
      error: () => {
        this.renderChart();
      }
    });
  }

  private renderChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.monthlyChartCanvas) return;

    const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.stats?.statistiquesMensuelles?.labels || [];
    const patientsData = this.stats?.statistiquesMensuelles?.patients || [];
    const enrolementsData = this.stats?.statistiquesMensuelles?.enrolements || [];

    // Dégradés verticaux pour un rendu plus moderne
    const gradPatients = ctx.createLinearGradient(0, 0, 0, 300);
    gradPatients.addColorStop(0, 'rgba(0,135,90,0.22)');
    gradPatients.addColorStop(1, 'rgba(0,135,90,0)');
    const gradEnrol = ctx.createLinearGradient(0, 0, 0, 300);
    gradEnrol.addColorStop(0, 'rgba(21,101,192,0.18)');
    gradEnrol.addColorStop(1, 'rgba(21,101,192,0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Patients enregistrés',
            data: patientsData,
            borderColor: '#00875A',
            backgroundColor: gradPatients,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#00875A',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Bénéficiaires enrôlés',
            data: enrolementsData,
            borderColor: '#1565C0',
            backgroundColor: gradEnrol,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#1565C0',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { family: "'Inter', sans-serif", size: 12, weight: 500 } }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            titleFont: { family: "'Inter', sans-serif", size: 13 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 12, cornerRadius: 10, displayColors: true, boxPadding: 4
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#9CA3AF' } },
          y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.03)' }, ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: '#9CA3AF' } }
        }
      }
    });
  }
}
