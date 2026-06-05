import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Indicateur de chargement unifié : spinner centré ou ligne de skeletons.
 *
 * Usage :
 *   <csu-loading />                             <!-- spinner par défaut -->
 *   <csu-loading message="Chargement..." />
 *   <csu-loading variant="skeleton" rows="5" /> <!-- skeleton lines -->
 */
@Component({
  selector: 'csu-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant === 'skeleton') {
      <div class="skeleton-wrap">
        @for (_ of skeletonRows; track $index) {
          <div class="skeleton-line" [style.width.%]="80 + ($index * 7) % 20"></div>
        }
      </div>
    } @else {
      <div class="csu-loading">
        <div class="csu-spinner"></div>
        @if (message) { <p class="text-muted small mt-2 mb-0">{{ message }}</p> }
      </div>
    }
  `,
  styles: [`
    .skeleton-wrap { display: flex; flex-direction: column; gap: 0.6rem; padding: 0.5rem 0; }
    .skeleton-line {
      height: 14px; border-radius: 8px;
      background: linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.05) 100%);
      background-size: 200% 100%;
      animation: skel-shimmer 1.4s ease-in-out infinite;
    }
    @keyframes skel-shimmer {
      0%   { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `]
})
export class LoadingComponent {
  @Input() variant: 'spinner' | 'skeleton' = 'spinner';
  @Input() message?: string;
  @Input() rows = 4;

  get skeletonRows(): number[] {
    return Array(this.rows).fill(0);
  }
}
