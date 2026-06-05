import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * En-tête de page standardisé : icône + titre + sous-titre + zone d'actions (slot).
 *
 * Usage :
 *   <csu-page-header icon="bi-people-fill" title="Patients" subtitle="Liste des patients">
 *     <button class="csu-btn csu-btn-primary">Nouveau</button>
 *   </csu-page-header>
 */
@Component({
  selector: 'csu-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="csu-page-header">
      <div class="page-header-text">
        <h1 class="csu-page-title">
          @if (icon) { <i class="bi" [ngClass]="icon" [style.color]="iconColor || null"></i> }
          {{ title }}
        </h1>
        @if (subtitle) { <p class="csu-page-subtitle">{{ subtitle }}</p> }
        @if (badge) {
          <div class="mt-2">
            <span class="page-header-badge" [ngClass]="badgeClass">{{ badge }}</span>
          </div>
        }
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header-text { min-width: 0; flex: 1; }
    .page-header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .page-header-badge {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 4px 12px; border-radius: 99px;
      font-size: 0.78rem; font-weight: 700; letter-spacing: 0.02em;
      background: var(--csu-primary-light, rgba(16,185,129,0.1));
      color: var(--csu-primary-deeper, #047857);
      border: 1px solid rgba(16,185,129,0.2);
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() icon?: string;        // ex: 'bi-people-fill'
  @Input() iconColor?: string;   // ex: 'var(--csu-primary)'
  @Input() badge?: string;
  @Input() badgeClass?: string;
}
