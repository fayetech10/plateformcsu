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
    <div class="container-fluid animate-fade-in">
      <!-- Rappel de pointage (visible dès l'entrée sur la plateforme) -->
      <app-pointage-reminder />

      <!-- Header personnalisé -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">{{ greeting }}, {{ prenom }} 👋</h1>
          <p class="csu-page-subtitle">{{ today | date:'EEEE d MMMM y' }} — voici votre activité du jour</p>
        </div>
        <div class="d-flex gap-2">
          <button (click)="triggerNewAction()" class="csu-btn csu-btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouveau
          </button>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions">
        <a routerLink="/patients/nouveau" class="qa-btn">
          <span class="qa-ico patients"><i class="bi bi-person-plus-fill"></i></span>
          <span>Nouveau patient</span>
        </a>
        <a routerLink="/enrolements/nouveau" class="qa-btn">
          <span class="qa-ico enrol"><i class="bi bi-person-check-fill"></i></span>
          <span>Nouvel enrôlement</span>
        </a>
        <a routerLink="/activites/nouveau" class="qa-btn">
          <span class="qa-ico act"><i class="bi bi-calendar-plus-fill"></i></span>
          <span>Nouvelle activité</span>
        </a>
        <a routerLink="/constats/nouveau" class="qa-btn">
          <span class="qa-ico constat"><i class="bi bi-clipboard-plus-fill"></i></span>
          <span>Nouveau constat</span>
        </a>
      </div>

      <!-- KPI Grid — Modern Minimal Cards -->
      <div class="kpi-grid-container">
        <div class="kpi-grid">
          <!-- Card: Patients -->
        <div class="kpi-card animate-fade-in stagger-1" routerLink="/patients">
          <div class="kpi-icon-wrap patients">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats?.totalPatients || 0 }}</span>
            <span class="kpi-label">Patients</span>
          </div>
          <div class="kpi-trend up">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+12.5%</span>
          </div>
        </div>

        <!-- Card: Bénéficiaires -->
        <div class="kpi-card animate-fade-in stagger-2" routerLink="/enrolements">
          <div class="kpi-icon-wrap beneficiaires">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <polyline points="16 11 18 13 22 9"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats?.totalBeneficiaires || 0 }}</span>
            <span class="kpi-label">Bénéficiaires</span>
          </div>
          <div class="kpi-trend up">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+8.2%</span>
          </div>
        </div>

        <!-- Card: Activités -->
        <div class="kpi-card animate-fade-in stagger-3" routerLink="/activites">
          <div class="kpi-icon-wrap activites">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats?.totalActivites || 0 }}</span>
            <span class="kpi-label">Activités</span>
          </div>
          <div class="kpi-trend up">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            <span>+5 aujourd'hui</span>
          </div>
        </div>

        <!-- Card: Constats -->
        <div class="kpi-card animate-fade-in stagger-4" routerLink="/constats">
          <div class="kpi-icon-wrap constats">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ stats?.totalConstats || 0 }}</span>
            <span class="kpi-label">Constats</span>
          </div>
          <div class="kpi-trend down">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </svg>
            <span>-3 résolus</span>
          </div>
        </div>
      </div>
      </div>

      <!-- Graphiques & Listes du jour -->
      <div class="row g-4 mb-4">
        <!-- Chart: Evolution Mensuelle -->
        <div class="col-12 col-lg-8">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--csu-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Activité d'Enrôlement Mensuelle
              </h3>
              <span class="badge bg-csu-primary-light text-csu-primary fw-semibold">Année courante</span>
            </div>
            <div style="height: 300px; position: relative;">
              <canvas #monthlyChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- List: Activités Récentes du Jour -->
        <div class="col-12 col-lg-4">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--csu-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Activités du Jour
              </h3>
              <a routerLink="/activites" class="small text-csu-primary fw-semibold text-decoration-none">
                Tout voir
              </a>
            </div>

            @if (stats?.activitesDuJour && stats!.activitesDuJour.length > 0) {
              <div class="d-flex flex-column gap-3">
                @for (act of stats?.activitesDuJour; track act.id) {
                  <div class="activity-item">
                    <div class="activity-dot"></div>
                    <div class="flex-grow-1 min-w-0">
                      <h4 class="small fw-bold mb-0 text-truncate">{{ act.typeActivite }}</h4>
                      <p class="text-muted small mb-0 text-truncate">{{ act.description }}</p>
                    </div>
                    <div class="text-end" style="flex-shrink: 0;">
                      <span class="activity-time">{{ act.date }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="csu-empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.3; color: var(--csu-text-muted)">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <line x1="10" y1="14" x2="14" y2="18"/>
                  <line x1="14" y1="14" x2="10" y2="18"/>
                </svg>
                <h3>Aucune activité</h3>
                <p>Aucune activité enregistrée aujourd'hui.</p>
              </div>
            }
          </div>
        </div>
      </div>


      <div class="row g-4 mb-4">
        <!-- Prochaines activités planifiées -->
        <div class="col-12 col-lg-6">
          <app-activites-a-venir />
        </div>
        <!-- Actions concernant l'agent (réponses de l'administration) -->
        <div class="col-12 col-lg-6">
          <app-agent-notifications />
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Quick actions ── */
    .quick-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; }
    .quick-actions .qa-btn {
      flex: 1; min-width: 180px; display: flex; align-items: center; gap: 0.7rem;
      background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 14px;
      padding: 0.85rem 1rem; text-decoration: none; color: var(--csu-text); font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s ease;
    }
    .quick-actions .qa-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); color: var(--csu-primary); }
    .qa-ico { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .qa-ico.patients { background: rgba(21,101,192,0.1); color: #1565C0; }
    .qa-ico.enrol { background: rgba(0,135,90,0.1); color: #00875A; }
    .qa-ico.act { background: rgba(123,31,162,0.1); color: #7B1FA2; }
    .qa-ico.constat { background: rgba(245,124,0,0.1); color: #F57C00; }

    /* ── KPI Grid ── */
    .kpi-grid-container {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
    }
    .kpi-grid-container::-webkit-scrollbar {
      height: 6px;
    }
    .kpi-grid-container::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: 4px;
    }

    .kpi-grid {
      display: flex;
      flex-wrap: nowrap;
      gap: 1rem;
      min-width: min-content;
    }

    .kpi-card {
      flex: 1;
      min-width: 200px;
      background: #fff;
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      min-width: 0;
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 60%, rgba(0, 0, 0, 0.02));
      pointer-events: none;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .kpi-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .kpi-card:hover .kpi-icon-wrap {
      transform: scale(1.1);
    }

    .kpi-icon-wrap.patients {
      background: rgba(21, 101, 192, 0.08);
      color: #1565C0;
    }
    .kpi-icon-wrap.beneficiaires {
      background: rgba(0, 135, 90, 0.08);
      color: #00875A;
    }
    .kpi-icon-wrap.activites {
      background: rgba(123, 31, 162, 0.08);
      color: #7B1FA2;
    }
    .kpi-icon-wrap.constats {
      background: rgba(245, 124, 0, 0.08);
      color: #F57C00;
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .kpi-value {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1.2rem, 2vw, 1.5rem);
      font-weight: 800;
      color: var(--csu-text);
      line-height: 1.1;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-label {
      font-size: 0.8rem;
      color: var(--csu-text-muted);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kpi-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;
      width: fit-content;
      white-space: nowrap;
    }

    .kpi-trend.up {
      color: #2E7D32;
      background: rgba(67, 160, 71, 0.08);
    }

    .kpi-trend.down {
      color: #C62828;
      background: rgba(229, 57, 53, 0.08);
    }

    /* ── Activity Items ── */
    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      transition: background 0.2s ease;
    }

    .activity-item:hover {
      background: var(--csu-border-light);
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--csu-primary);
      flex-shrink: 0;
      box-shadow: 0 0 0 3px rgba(0, 135, 90, 0.15);
    }

    .activity-time {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--csu-text-muted);
      background: var(--csu-bg);
      padding: 4px 8px;
      border-radius: 6px;
    }

    .hide-on-mobile {
      display: flex;
    }

    /* ── Responsive ── */
    @media (max-width: 1200px) {
      .kpi-card {
        min-width: 180px;
      }
    }

    @media (max-width: 992px) {
      .hide-on-mobile {
        display: none !important;
      }

      .csu-page-header {
        margin-bottom: 1rem;
      }

      .csu-page-subtitle {
        display: none;
      }
    }

    @media (max-width: 576px) {
      .kpi-card {
        min-width: 160px;
        padding: 0.85rem;
        border-radius: 14px;
      }

      .kpi-card {
        padding: 1rem;
        border-radius: 14px;
      }

      .kpi-icon-wrap {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }

      .kpi-icon-wrap svg {
        width: 18px;
        height: 18px;
      }

      .kpi-value {
        font-size: 1.5rem;
      }

      .kpi-label {
        font-size: 0.7rem;
      }

      .kpi-trend {
        font-size: 0.65rem;
        padding: 3px 6px;
      }
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

  triggerNewAction(): void {
    window.dispatchEvent(new CustomEvent('csu:open-quick-menu'));
  }

  ngOnInit(): void {
    // Register Chart.js elements
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
          statistiquesMensuelles: {
            labels: [],
            patients: [],
            enrolements: []
          }
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
        this.renderChart(); // Render using fallback
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

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Patients Enregistrés',
            data: patientsData,
            borderColor: '#00875A',
            backgroundColor: 'rgba(0, 135, 90, 0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#00875A',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Bénéficiaires Enrôlés',
            data: enrolementsData,
            borderColor: '#1565C0',
            backgroundColor: 'rgba(21, 101, 192, 0.06)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
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
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                family: "'Inter', sans-serif",
                size: 12,
                weight: 500
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            titleFont: { family: "'Inter', sans-serif", size: 13 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
            boxPadding: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
              color: '#9CA3AF'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.03)'
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 11 },
              color: '#9CA3AF'
            }
          }
        }
      }
    });
  }
}
