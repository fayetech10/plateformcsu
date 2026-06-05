import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * État vide standardisé pour listes/résultats vides.
 *
 * Usage :
 *   <csu-empty-state icon="bi-search" title="Aucun résultat" message="Affinez votre recherche.">
 *     <button class="csu-btn csu-btn-primary">Nouvelle recherche</button>
 *   </csu-empty-state>
 */
@Component({
  selector: 'csu-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="csu-empty-state" [class.compact]="compact">
      @if (icon) { <i class="bi" [ngClass]="icon"></i> }
      @if (title) { <h3>{{ title }}</h3> }
      @if (message) { <p>{{ message }}</p> }
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    /* Hérite des styles globaux .csu-empty-state ; .compact réduit le padding */
    .csu-empty-state.compact { padding: 1rem; }
    .csu-empty-state.compact i { font-size: 1.75rem; }
    .csu-empty-state.compact h3 { font-size: 0.95rem; margin-bottom: 0.25rem; }
  `]
})
export class EmptyStateComponent {
  @Input() icon?: string;     // ex: 'bi-inbox'
  @Input() title?: string;
  @Input() message?: string;
  /** Accepte aussi <csu-empty-state compact /> (sans valeur). */
  @Input({ transform: booleanAttribute }) compact = false;
}
