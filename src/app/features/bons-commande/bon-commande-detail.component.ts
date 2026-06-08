import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
          <button class="csu-btn csu-btn-primary" (click)="imprimer()">
            <i class="bi bi-printer"></i> Imprimer
          </button>
          <button class="csu-btn csu-btn-secondary" (click)="telechargerPDF()" [disabled]="generatingPdf">
            @if (generatingPdf) { <span class="spinner-border spinner-border-sm me-1"></span> Génération... }
            @else { <i class="bi bi-file-earmark-pdf"></i> PDF }
          </button>
          <a [routerLink]="['/bons-commande', bon.id, 'modifier']" class="csu-btn csu-btn-light">
            <i class="bi bi-pencil"></i> Modifier
          </a>
          <button class="csu-btn csu-btn-danger" (click)="supprimer()">
            <i class="bi bi-trash"></i> Supprimer
          </button>
          <a routerLink="/bons-commande" class="csu-btn csu-btn-light">Retour</a>
        </div>
      </div>

      <!-- ========== DOCUMENT IMPRIMABLE (format officiel SEN-CSU) ========== -->
      <div class="bon-doc print-area mx-auto" id="bon-content">

        <!-- En-tête officiel -->
        <div class="bon-header">
          <div class="bon-header-left">
            <img src="assets/logo.png" alt="SEN-CSU" class="bon-logo" />
            <div class="bon-agency">
              <div class="agency-name">AGENCE SÉNÉGALAISE</div>
              <div class="agency-name">DE LA COUVERTURE</div>
              <div class="agency-name">SANITAIRE UNIVERSELLE</div>
            </div>
          </div>
        </div>

        <!-- Titre encadré -->
        <div class="bon-title-box">
          <span class="bon-title">BON DE COMMANDE</span>
        </div>

        <!-- Cases à cocher type circuit + N° -->
        <div class="bon-circuit-row">
          <div class="circuit-options">
            <div class="circuit-option">
              <span class="checkbox-box" [class.checked]="bon.typeCircuit === 'PUBLIQUE'">
                {{ bon.typeCircuit === 'PUBLIQUE' ? '✓' : '' }}
              </span>
              <span>MEDICAMENT DU CIRCUIT PUBLIQUE (PEC 80%)</span>
            </div>
            <div class="circuit-option">
              <span class="checkbox-box" [class.checked]="bon.typeCircuit === 'OFFICINE'">
                {{ bon.typeCircuit === 'OFFICINE' ? '✓' : '' }}
              </span>
              <span>MEDICAMENT DU CIRCUIT D'OFFICINE (PEC 50%)</span>
            </div>
          </div>
          <div class="bon-ref">
            N° <span class="dotted-value">{{ bon.reference }}</span>
          </div>
        </div>

        <!-- Champs principaux -->
        <div class="bon-fields">
          <div class="field-row">
            <span class="field-label">Date émission :</span>
            <span class="dotted-value">{{ bon.dateCreation | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Nom du bénéficiaire :</span>
            <span class="dotted-value">{{ bon.patientNom || '-' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">CODE ASSURE / NUM D'immatriculation :</span>
            <span class="dotted-value">{{ bon.codeAssureImmatriculation || bon.numeroDossier || '-' }}</span>
          </div>
          <div class="field-row-inline">
            <div class="field-row" style="flex:1">
              <span class="field-label">Age :</span>
              <span class="dotted-value">{{ bon.ageBeneficiaire != null ? bon.ageBeneficiaire + ' ans' : '-' }}</span>
            </div>
            <div class="field-row" style="flex:1">
              <span class="field-label">Sexe :</span>
              <span class="dotted-value">{{ bon.sexeBeneficiaire === 'M' ? 'Masculin' : bon.sexeBeneficiaire === 'F' ? 'Féminin' : '-' }}</span>
            </div>
          </div>
          <div class="field-row">
            <span class="field-label">Structure de santé :</span>
            <span class="dotted-value">{{ bon.structureSante || bon.serviceHopital || '-' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Pharmacie :</span>
            <span class="dotted-value">{{ bon.pharmacieNom || '-' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Prénom et Nom du prescripteur :</span>
            <span class="dotted-value">{{ bon.medecinPrescripteur || '-' }}</span>
          </div>
        </div>

        <!-- Tableau des médicaments -->
        <table class="bon-table">
          <thead>
            <tr>
              <th class="col-designation">Désignation</th>
              <th class="col-qte">Quantité</th>
              <th class="col-pu">Prix Unitaire</th>
              <th class="col-total">Total</th>
              <th class="col-taux">Taux de prise en charge</th>
            </tr>
          </thead>
          <tbody>
            @for (l of bon.lignes; track $index) {
              <tr>
                <td>{{ l.designation }}</td>
                <td class="text-center">{{ l.quantite ?? '-' }}</td>
                <td class="text-end">{{ l.prixUnitaire != null ? (l.prixUnitaire | number) : '-' }}</td>
                <td class="text-end">{{ ligneTotal(l) }}</td>
                <td class="text-center">{{ l.tauxPriseEnCharge || bon.tauxPriseEnCharge || '-' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center text-muted">Aucune ligne</td></tr>
            }
            <!-- Lignes vides pour compléter le tableau (format officiel) -->
            @for (_ of emptyRows; track $index) {
              <tr class="empty-row">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Totaux officiels -->
        <div class="bon-totals">
          <div class="total-row total-general">
            <span class="total-label">TOTAL GENERAL</span>
            <span class="total-value">{{ totalGeneral | number }} FCFA</span>
          </div>
          <div class="total-row">
            <span class="total-label">Montant à payer par le patient</span>
            <span class="total-value">{{ bon.montantPatient != null ? (bon.montantPatient | number) + ' FCFA' : '-' }}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Montant à facturer au tiers payant</span>
            <span class="total-value">{{ bon.montantTiersPayant != null ? (bon.montantTiersPayant | number) + ' FCFA' : '-' }}</span>
          </div>
        </div>

        <!-- Cachet -->
        <div class="bon-cachet">
          <span class="cachet-label">Cachet Assureur</span>
          <div class="cachet-box"></div>
        </div>

      </div>

      <!-- Changement de statut (non imprimé) -->
      <div class="csu-card no-print mt-3 mx-auto" style="max-width: 820px;">
        <h4 class="text-csu-primary mb-3"><i class="bi bi-flag me-2"></i> Suivi</h4>
        <div class="d-flex gap-2 flex-wrap align-items-center mb-2">
          <span class="badge" [ngClass]="meta(bon.statut).badge">{{ meta(bon.statut).label }}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="csu-btn csu-btn-light" [disabled]="bon.statut === 'EN_ATTENTE'" (click)="setStatut('EN_ATTENTE')">En attente</button>
          <button class="csu-btn csu-btn-primary" [disabled]="bon.statut === 'DELIVRE'" (click)="setStatut('DELIVRE')"><i class="bi bi-check-lg"></i> Marquer délivré</button>
          <button class="csu-btn csu-btn-light text-csu-danger" [disabled]="bon.statut === 'ANNULE'" (click)="setStatut('ANNULE')">Annuler le bon</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== Bon de Commande - Format officiel SEN-CSU ========== */
    .bon-doc {
      max-width: 860px;
      background: #fff;
      padding: 36px 44px;
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.06);
      font-family: 'Times New Roman', Times, serif;
      font-size: 13.5px;
      color: #222;
      line-height: 1.6;
    }

    /* En-tête */
    .bon-header {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .bon-header-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .bon-logo { height: 52px; }
    .bon-agency { font-size: 11px; font-weight: 700; line-height: 1.4; text-transform: uppercase; }
    .agency-name { letter-spacing: 0.3px; }

    /* Titre encadré */
    .bon-title-box {
      text-align: center;
      margin: 14px 0 16px;
    }
    .bon-title {
      display: inline-block;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      border: 2px solid #333;
      padding: 6px 32px;
    }

    /* Cases à cocher circuit */
    .bon-circuit-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 16px;
    }
    .circuit-options {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .circuit-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      font-weight: 600;
    }
    .checkbox-box {
      width: 16px;
      height: 16px;
      border: 1.5px solid #333;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .checkbox-box.checked {
      background: #e8f5e9;
      border-color: #2e7d32;
      color: #2e7d32;
    }
    .bon-ref {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* Champs */
    .bon-fields {
      margin-bottom: 16px;
    }
    .field-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;
    }
    .field-row-inline {
      display: flex;
      gap: 24px;
      margin-bottom: 8px;
    }
    .field-label {
      font-size: 13px;
      margin-right: 6px;
      white-space: nowrap;
    }
    .dotted-value {
      border-bottom: 1px dotted #666;
      flex: 1;
      min-width: 60px;
      padding-bottom: 1px;
      font-weight: 600;
    }

    /* Tableau */
    .bon-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .bon-table th,
    .bon-table td {
      border: 1px solid #333;
      padding: 6px 8px;
    }
    .bon-table th {
      background: #f5f5f5;
      font-weight: 700;
      font-size: 12px;
      text-align: center;
      text-transform: uppercase;
    }
    .col-designation { width: 35%; }
    .col-qte { width: 12%; }
    .col-pu { width: 15%; }
    .col-total { width: 15%; }
    .col-taux { width: 23%; }
    .empty-row td { height: 28px; }

    /* Totaux */
    .bon-totals {
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      border-bottom: 1px solid #ddd;
    }
    .total-row.total-general {
      font-weight: 700;
      font-size: 15px;
      background: #f5f5f5;
      border: 1px solid #333;
    }
    .total-label { font-size: 13px; }
    .total-value { font-weight: 700; font-size: 14px; }

    /* Cachet */
    .bon-cachet {
      margin-top: 24px;
    }
    .cachet-label {
      font-size: 14px;
      font-weight: 700;
      font-style: italic;
      display: block;
      margin-bottom: 8px;
    }
    .cachet-box {
      width: 200px;
      height: 80px;
      border: 1px solid #999;
    }

    @media print {
      .no-print { display: none !important; }
      :host { background: #fff; }
      .bon-doc { box-shadow: none !important; border: none !important; border-radius: 0; padding: 16px 24px; }
    }
  `]

})
export class BonCommandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bonService = inject(BonCommandeService);

  bon?: BonCommande;
  loading = true;
  generatingPdf = false;

  meta(s: any) { return STATUT_BON_META[s as keyof typeof STATUT_BON_META] || STATUT_BON_META.EN_ATTENTE; }

  /** Calcule le total d'une ligne (Quantité × Prix Unitaire). */
  ligneTotal(l: any): string {
    if (l.total != null) return l.total.toLocaleString('fr-FR');
    if (l.quantite != null && l.prixUnitaire != null) {
      return (l.quantite * l.prixUnitaire).toLocaleString('fr-FR');
    }
    return '-';
  }

  /** Total général = somme des totaux de toutes les lignes. */
  get totalGeneral(): number {
    if (!this.bon?.lignes) return 0;
    if (this.bon.montantEstime != null) return this.bon.montantEstime;
    return this.bon.lignes.reduce((sum, l) => {
      if (l.total != null) return sum + l.total;
      if (l.quantite != null && l.prixUnitaire != null) return sum + (l.quantite * l.prixUnitaire);
      return sum;
    }, 0);
  }

  /** Lignes vides pour compléter le tableau à un minimum de 8 lignes (format officiel). */
  get emptyRows(): number[] {
    const count = this.bon?.lignes?.length ?? 0;
    const min = 8;
    return count >= min ? [] : new Array(min - count);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bonService.getBonById(+id).subscribe({
        next: (b) => {
          this.bon = b;
          this.loading = false;
          
          setTimeout(() => {
            if (this.route.snapshot.queryParamMap.get('downloadPdf') === 'true') {
              this.telechargerPDF();
            }
          }, 500);
        },
        error: () => {
          Swal.fire('Erreur', 'Bon de commande introuvable.', 'error');
          this.router.navigate(['/bons-commande']);
        }
      });
    }
  }

  imprimer(): void {
    if (typeof window !== 'undefined') window.print();
  }

  telechargerPDF(): void {
    const element = document.getElementById('bon-content');
    if (!element) return;
    this.generatingPdf = true;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`bon_commande_${this.bon?.reference}.pdf`);
      this.generatingPdf = false;
    });
  }

  supprimer(): void {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer'
    }).then((result) => {
      if (result.isConfirmed && this.bon?.id) {
        this.bonService.deleteBon(this.bon.id).subscribe(() => {
          Swal.fire('Supprimé !', 'Le bon a été supprimé.', 'success');
          this.router.navigate(['/bons-commande']);
        });
      }
    });
  }

  setStatut(statut: 'EN_ATTENTE' | 'DELIVRE' | 'ANNULE'): void {
    if (!this.bon?.id) return;
    this.bonService.changerStatut(this.bon.id, statut).subscribe({
      next: (b) => { this.bon = b; },
      error: () => Swal.fire('Erreur', 'Mise à jour du statut impossible.', 'error')
    });
  }
}
