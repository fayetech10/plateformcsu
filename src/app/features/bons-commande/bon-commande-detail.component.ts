import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BonCommandeService } from '../../core/services/bon-commande.service';
import { BonCommande, STATUT_BON_META } from '../../core/models/bon-commande.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bon-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in" *ngIf="bon">
      <!-- Barre d'actions (masquée à l'impression) -->
      <div class="csu-page-header no-print">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-receipt-cutoff text-csu-primary"></i>
            Bon de Commande {{ bon.reference }}
          </h1>
          <p class="csu-page-subtitle">À remettre au patient pour retrait en pharmacie conventionnée</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="csu-btn csu-btn-primary" (click)="imprimer()"><i class="bi bi-printer"></i> Imprimer</button>
          <a [routerLink]="['/bons-commande', bon.id, 'modifier']" class="csu-btn csu-btn-secondary"><i class="bi bi-pencil"></i> Modifier</a>
          <a routerLink="/bons-commande" class="csu-btn csu-btn-light">Retour</a>
        </div>
      </div>

      <!-- Document imprimable -->
      <div class="csu-card print-area mx-auto" style="max-width: 820px;">
        <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <img src="assets/logo.png" alt="CSU" style="height: 52px;" />
            <div>
              <div class="fw-bold fs-5 text-csu-primary">Couverture Sanitaire Universelle</div>
              <div class="small text-muted">Bon de commande de produits pharmaceutiques</div>
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold">{{ bon.reference }}</div>
            <div class="small text-muted">{{ bon.dateCreation | date:'dd/MM/yyyy à HH:mm' }}</div>
            <span class="badge mt-1" [ngClass]="meta(bon.statut).badge">{{ meta(bon.statut).label }}</span>
          </div>
        </div>

        <!-- Patient -->
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="small text-muted text-uppercase fw-bold mb-1">Patient bénéficiaire</div>
            <div class="fw-bold">{{ bon.patientNom || '-' }}</div>
            <div class="small">Dossier : {{ bon.numeroDossier || '-' }}</div>
            <div class="small text-success"><i class="bi bi-shield-check"></i> Lettre de garantie N° {{ bon.referenceLettreGarantie || bon.numeroDossier || '-' }}</div>
          </div>
          <div class="col-md-6">
            <div class="small text-muted text-uppercase fw-bold mb-1">Émis par</div>
            <div>{{ bon.agentNom || 'Agent CSU' }}</div>
          </div>
        </div>

        <!-- Ordonnance -->
        <div class="row g-3 mb-3 p-2 rounded" style="background:#f8f9fa;">
          <div class="col-md-4">
            <div class="small text-muted text-uppercase fw-bold mb-1">Médecin prescripteur</div>
            <div>{{ bon.medecinPrescripteur || '-' }}</div>
          </div>
          <div class="col-md-4">
            <div class="small text-muted text-uppercase fw-bold mb-1">Établissement / Service</div>
            <div>{{ bon.serviceHopital || '-' }}</div>
          </div>
          <div class="col-md-4">
            <div class="small text-muted text-uppercase fw-bold mb-1">Date ordonnance</div>
            <div>{{ bon.dateOrdonnance ? (bon.dateOrdonnance | date:'dd/MM/yyyy') : '-' }}</div>
          </div>
          <div class="col-12">
            <div class="small fst-italic text-secondary">
              <i class="bi bi-info-circle"></i>
              {{ bon.motif || "Médicaments non disponibles à l'établissement de santé" }} — à acquérir en pharmacie conventionnée.
            </div>
          </div>
        </div>

        <!-- Lignes -->
        <div class="small text-muted text-uppercase fw-bold mb-1">Médicaments prescrits à acheter</div>
        <table class="table table-bordered align-middle mb-3">
          <thead class="table-light">
            <tr>
              <th style="width:40px">#</th>
              <th>Désignation</th>
              <th style="width:80px" class="text-center">Qté</th>
              <th>Posologie / Instructions</th>
            </tr>
          </thead>
          <tbody>
            @for (l of bon.lignes; track $index) {
              <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ l.designation }}</td>
                <td class="text-center">{{ l.quantite ?? '-' }}</td>
                <td>{{ l.posologie || '-' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="text-center text-muted">Aucune ligne</td></tr>
            }
          </tbody>
        </table>

        @if (bon.montantEstime != null) {
          <div class="text-end mb-3"><span class="text-muted small">Montant estimé : </span><strong>{{ bon.montantEstime | number }} FCFA</strong></div>
        }

        @if (bon.observations) {
          <div class="mb-3">
            <div class="small text-muted text-uppercase fw-bold mb-1">Observations</div>
            <p class="mb-0 small">{{ bon.observations }}</p>
          </div>
        }

        <!-- Pharmacie suggérée -->
        <div class="p-3 rounded mb-3" style="background:#E8F5EE; border:1px dashed #00875A;">
          <div class="fw-bold text-csu-primary mb-1"><i class="bi bi-shop me-1"></i> Pharmacie conventionnée recommandée</div>
          @if (bon.pharmacieNom) {
            <div class="fw-semibold">{{ bon.pharmacieNom }}</div>
            @if (bon.pharmacieAdresse) { <div class="small"><i class="bi bi-geo-alt"></i> {{ bon.pharmacieAdresse }}</div> }
            @if (bon.pharmacieTelephone) { <div class="small"><i class="bi bi-telephone"></i> {{ bon.pharmacieTelephone }}</div> }
          } @else {
            <div class="small text-muted">À orienter vers une pharmacie partenaire CSU.</div>
          }
        </div>

        <div class="d-flex justify-content-between mt-4 pt-4">
          <div class="text-center small">
            <div style="border-top:1px solid #999; width:180px; margin:0 auto; padding-top:4px;">Signature de l'agent</div>
          </div>
          <div class="text-center small">
            <div style="border-top:1px solid #999; width:180px; margin:0 auto; padding-top:4px;">Cachet de la pharmacie</div>
          </div>
        </div>
      </div>

      <!-- Changement de statut (non imprimé) -->
      <div class="csu-card no-print mt-3 mx-auto" style="max-width: 820px;">
        <h4 class="text-csu-primary mb-3"><i class="bi bi-flag me-2"></i> Suivi</h4>
        <div class="d-flex gap-2 flex-wrap">
          <button class="csu-btn csu-btn-light" [disabled]="bon.statut === 'EN_ATTENTE'" (click)="setStatut('EN_ATTENTE')">En attente</button>
          <button class="csu-btn csu-btn-primary" [disabled]="bon.statut === 'DELIVRE'" (click)="setStatut('DELIVRE')"><i class="bi bi-check-lg"></i> Marquer délivré</button>
          <button class="csu-btn csu-btn-light text-csu-danger" [disabled]="bon.statut === 'ANNULE'" (click)="setStatut('ANNULE')">Annuler le bon</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      .no-print { display: none !important; }
      :host { background: #fff; }
      .print-area { box-shadow: none !important; border: none !important; }
    }
  `]
})
export class BonCommandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bonService = inject(BonCommandeService);

  bon?: BonCommande;

  meta(s: any) { return STATUT_BON_META[s as keyof typeof STATUT_BON_META] || STATUT_BON_META.EN_ATTENTE; }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.bonService.getBonById(id).subscribe({
      next: (b) => this.bon = b,
      error: () => {
        Swal.fire('Erreur', 'Bon introuvable.', 'error');
        this.router.navigate(['/bons-commande']);
      }
    });
  }

  imprimer(): void {
    if (typeof window !== 'undefined') window.print();
  }

  setStatut(statut: 'EN_ATTENTE' | 'DELIVRE' | 'ANNULE'): void {
    if (!this.bon?.id) return;
    this.bonService.changerStatut(this.bon.id, statut).subscribe({
      next: (b) => { this.bon = b; },
      error: () => Swal.fire('Erreur', 'Mise à jour du statut impossible.', 'error')
    });
  }
}
