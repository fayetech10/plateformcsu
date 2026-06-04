import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { PatientService } from '../../core/services/patient.service';
import { PatientStats } from '../../core/models/patient-stats.model';

/**
 * Tableau de bord visuel des patients : répartition par sexe, catégorie,
 * tranche d'âge et commune. Réutilisé côté agent et côté admin.
 */
@Component({
  selector: 'app-patient-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="csu-card mb-4">
      <div class="csu-card-header">
        <h3 class="csu-card-title">
          <i class="bi bi-pie-chart-fill text-csu-primary"></i>
          Statistiques des patients
        </h3>
        <span class="badge bg-csu-primary-light text-csu-primary fw-semibold">{{ stats?.total || 0 }} patients</span>
      </div>

      @if (loading) {
        <div class="csu-loading"><div class="csu-spinner"></div></div>
      } @else if ((stats?.total || 0) === 0) {
        <div class="csu-empty-state"><i class="bi bi-bar-chart"></i><h3>Aucune donnée</h3><p>Aucun patient à analyser pour le moment.</p></div>
      } @else {
        <div class="charts-grid">
          <div class="chart-box">
            <h4 class="chart-title">Par sexe</h4>
            <div class="chart-canvas"><canvas #sexeCanvas></canvas></div>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Par catégorie</h4>
            <div class="chart-canvas"><canvas #categorieCanvas></canvas></div>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Par tranche d'âge</h4>
            <div class="chart-canvas"><canvas #ageCanvas></canvas></div>
          </div>
          <div class="chart-box">
            <h4 class="chart-title">Top communes</h4>
            <div class="chart-canvas"><canvas #communeCanvas></canvas></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; }
    .chart-box { background: var(--csu-bg); border: 1px solid var(--csu-border-light); border-radius: 14px; padding: 1rem; }
    .chart-title { font-size: 0.85rem; font-weight: 700; color: var(--csu-text); margin: 0 0 0.75rem; text-align: center; }
    .chart-canvas { position: relative; height: 230px; }
  `]
})
export class PatientChartsComponent implements OnInit, AfterViewInit, OnDestroy {
  private patientService = inject(PatientService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('sexeCanvas') sexeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categorieCanvas') categorieCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('ageCanvas') ageCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('communeCanvas') communeCanvas?: ElementRef<HTMLCanvasElement>;

  stats?: PatientStats;
  loading = true;
  private charts: any[] = [];
  private viewReady = false;

  private palette = ['#00875A', '#1565C0', '#F57C00', '#7B1FA2', '#E53935', '#0288D1', '#43A047', '#FB8C00'];

  ngOnInit(): void {
    Chart.register(...registerables);
    this.patientService.getStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; setTimeout(() => this.renderAll(), 0); },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.stats) setTimeout(() => this.renderAll(), 0);
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  private renderAll(): void {
    if (!isPlatformBrowser(this.platformId) || !this.stats || !this.viewReady) return;
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    this.doughnut(this.sexeCanvas, this.stats.parSexe, ['#1565C0', '#E53935']);
    this.doughnut(this.categorieCanvas, this.stats.parCategorie, this.palette);
    this.bar(this.ageCanvas, this.stats.parAge, '#00875A');
    this.bar(this.communeCanvas, this.stats.parCommune, '#7B1FA2', true);
  }

  private doughnut(ref: ElementRef<HTMLCanvasElement> | undefined, data: { [k: string]: number }, colors: string[]): void {
    if (!ref) return;
    const ctx = ref.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = Object.keys(data || {});
    const values = labels.map(l => data[l]);
    this.charts.push(new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } }
      }
    }));
  }

  private bar(ref: ElementRef<HTMLCanvasElement> | undefined, data: { [k: string]: number }, color: string, horizontal = false): void {
    if (!ref) return;
    const ctx = ref.nativeElement.getContext('2d');
    if (!ctx) return;
    const labels = Object.keys(data || {});
    const values = labels.map(l => data[l]);
    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: color, borderRadius: 6, maxBarThickness: 38 }] },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: !horizontal ? false : true, color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, precision: 0 } as any }
        }
      }
    }));
  }
}
