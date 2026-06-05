import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type KpiTone = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Carte d'indicateur clé : icône colorée + valeur + libellé + tendance optionnelle.
 *
 * Usage :
 *   <csu-kpi-card icon="bi-people-fill" tone="primary"
 *                 [value]="42" label="Patients" trend="3 cette semaine" />
 *   <csu-kpi-card link="/patients" ... />
 */
@Component({
  selector: 'csu-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ng-template #content>
      <div class="kpi-icon" [ngClass]="'tone-' + tone">
        @if (icon) { <i class="bi" [ngClass]="icon"></i> }
      </div>
      <div class="kpi-body">
        <span class="kpi-value">{{ value }}</span>
        <span class="kpi-label">{{ label }}</span>
        @if (trend) {
          <span class="kpi-trend" [class.up]="trendDirection === 'up'" [class.down]="trendDirection === 'down'">
            @if (trendDirection === 'up')   { <i class="bi bi-arrow-up-right"></i> }
            @if (trendDirection === 'down') { <i class="bi bi-arrow-down-right"></i> }
            {{ trend }}
          </span>
        }
      </div>
    </ng-template>

    @if (link) {
      <a [routerLink]="link" class="kpi-card link">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </a>
    } @else {
      <div class="kpi-card">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </div>
    }
  `,
  styles: [`
    .kpi-card {
      display: flex; gap: 1rem; align-items: center;
      background: #fff;
      border-radius: var(--csu-radius-lg, 16px);
      padding: 1rem 1.15rem;
      border: 1px solid rgba(226, 232, 240, 0.6);
      box-shadow: var(--csu-shadow-xs, 0 1px 3px rgba(0,0,0,0.04));
      transition: var(--csu-transition, all .35s cubic-bezier(.16,1,.3,1));
      text-decoration: none; color: inherit;
      min-width: 0;
    }
    .kpi-card.link { cursor: pointer; }
    .kpi-card.link:hover {
      transform: translateY(-3px);
      box-shadow: var(--csu-shadow, 0 10px 25px -5px rgba(0,0,0,0.07));
      border-color: rgba(16, 185, 129, 0.2);
      color: inherit;
    }
    .kpi-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1.3rem; color: #fff; flex-shrink: 0;
      transition: transform .25s ease;
    }
    .kpi-card.link:hover .kpi-icon { transform: scale(1.08) rotate(-3deg); }
    .kpi-icon.tone-primary   { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 6px 14px rgba(16,185,129,0.32); }
    .kpi-icon.tone-secondary { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 6px 14px rgba(59,130,246,0.32); }
    .kpi-icon.tone-accent    { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 6px 14px rgba(245,158,11,0.32); }
    .kpi-icon.tone-success   { background: linear-gradient(135deg, #10b981, #047857); box-shadow: 0 6px 14px rgba(16,185,129,0.32); }
    .kpi-icon.tone-warning   { background: linear-gradient(135deg, #f59e0b, #c2410c); box-shadow: 0 6px 14px rgba(245,158,11,0.32); }
    .kpi-icon.tone-danger    { background: linear-gradient(135deg, #ef4444, #b91c1c); box-shadow: 0 6px 14px rgba(239,68,68,0.32); }
    .kpi-icon.tone-info      { background: linear-gradient(135deg, #0ea5e9, #0369a1); box-shadow: 0 6px 14px rgba(14,165,233,0.32); }
    .kpi-icon.tone-neutral   { background: linear-gradient(135deg, #64748b, #334155); box-shadow: 0 6px 14px rgba(100,116,139,0.32); }

    .kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-value {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(1.3rem, 2vw, 1.6rem);
      font-weight: 800; line-height: 1.05;
      letter-spacing: -0.02em;
      color: var(--csu-text, #0f172a);
    }
    .kpi-label { font-size: 0.82rem; color: var(--csu-text-muted, #64748b); font-weight: 600; }
    .kpi-trend {
      margin-top: 4px;
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 0.72rem; font-weight: 700;
      padding: 2px 8px; border-radius: 99px;
      background: rgba(0,0,0,0.05); color: var(--csu-text-muted, #64748b);
      width: fit-content;
    }
    .kpi-trend.up   { background: rgba(16,185,129,0.1); color: #047857; }
    .kpi-trend.down { background: rgba(239,68,68,0.1); color: #b91c1c; }
  `]
})
export class KpiCardComponent {
  @Input() icon?: string;
  @Input() tone: KpiTone = 'primary';
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() trend?: string;
  @Input() trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() link?: string;
}
