import { Component } from '@angular/core';

/**
 * Carte résumé pour les listes en mobile (`csu-list-card`).
 *
 * Coquille présentationnelle légère : le contenu est entièrement projeté,
 * la mise en forme s'appuie sur les classes globales définies dans `styles.scss`
 * (`.csu-list-card`, `.csu-list-card-head`, `.csu-list-card-lead`,
 * `.csu-list-card-body`, `.csu-list-card-title`, `.csu-list-card-sub`,
 * `.csu-list-card-meta`, `.csu-list-card-actions`).
 *
 * Usage type (dans une liste `<div class="csu-list d-lg-none">`) :
 *
 *   <csu-list-card>
 *     <div class="csu-list-card-head">
 *       <div class="csu-list-card-lead">AB</div>
 *       <div class="csu-list-card-body">
 *         <div class="csu-list-card-title">Titre</div>
 *         <div class="csu-list-card-sub">Sous-titre</div>
 *       </div>
 *     </div>
 *     <div class="csu-list-card-meta">…</div>
 *     <div class="csu-list-card-actions">… boutons …</div>
 *   </csu-list-card>
 */
@Component({
  selector: 'csu-list-card',
  standalone: true,
  template: `<div class="csu-list-card"><ng-content></ng-content></div>`
})
export class CardListItemComponent {}
