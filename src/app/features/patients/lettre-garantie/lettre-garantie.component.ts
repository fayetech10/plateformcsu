import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientService } from '../../../core/services/patient.service';
import { LettreGarantieService } from '../../../core/services/lettre-garantie.service';
import { Patient } from '../../../core/models/patient.model';
import { LettreGarantie } from '../../../core/models/lettre-garantie.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lettre-garantie',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in" *ngIf="patient">
      <!-- Actions (non imprimées) -->
      <div class="csu-page-header no-print">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-shield-check text-csu-primary"></i>
            Lettre de Garantie
          </h1>
          <p class="csu-page-subtitle">Engagement de prise en charge — {{ patient.prenom }} {{ patient.nom }}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          @if (lettre) {
            <button class="csu-btn csu-btn-primary" (click)="imprimer()"><i class="bi bi-printer"></i> Imprimer</button>
            <button class="csu-btn csu-btn-secondary" (click)="telechargerPDF()" [disabled]="generatingPdf">
              @if (generatingPdf) { <span class="spinner-border spinner-border-sm me-1"></span> Génération... }
              @else { <i class="bi bi-file-earmark-pdf"></i> PDF }
            </button>
          } @else {
            <button class="csu-btn csu-btn-primary" (click)="emettre()" [disabled]="emitting || loading">
              @if (emitting) { <span class="spinner-border spinner-border-sm me-1"></span> Émission… }
              @else { <i class="bi bi-file-earmark-plus"></i> Émettre la lettre }
            </button>
            <button class="csu-btn csu-btn-secondary" (click)="telechargerPDF()" [disabled]="generatingPdf">
               @if (generatingPdf) { <span class="spinner-border spinner-border-sm me-1"></span> Génération... }
               @else { <i class="bi bi-file-earmark-pdf"></i> Aperçu PDF }
            </button>
          }
          <a routerLink="/bons-commande/nouveau" [queryParams]="{ patientId: patient.id }" class="csu-btn csu-btn-light">
            <i class="bi bi-receipt-cutoff"></i> Bon de commande
          </a>
          <a [routerLink]="['/patients', patient.id]" class="csu-btn csu-btn-light">Retour</a>
        </div>
      </div>

      <!-- Bandeau de statut (non imprimé) -->
      <div class="no-print mb-3" *ngIf="!loading">
        @if (lettre) {
          <div class="status-banner active">
            <i class="bi bi-shield-fill-check"></i>
            <div>
              <b>Lettre de garantie active — {{ lettre.reference }}</b>
              <span>Émise le {{ lettre.dateEmission | date:'dd/MM/yyyy' }}, <b>valable jusqu'au {{ lettre.dateExpiration | date:'dd/MM/yyyy' }}</b>
                ({{ joursRestants }} jour(s) restant(s)). Le patient se soigne avec cette lettre — ne pas réémettre avant son expiration.</span>
            </div>
          </div>
        } @else {
          <div class="status-banner none">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>
              <b>Aucune lettre de garantie active</b>
              <span>Émettez une lettre de garantie : elle sera valable <b>1 mois</b>. Si le patient revient pendant cette période, la même lettre sera réutilisée.</span>
            </div>
          </div>
        }
      </div>

      <!-- ========== DOCUMENT IMPRIMABLE (format officiel SEN-CSU) ========== -->
      <div class="lettre-doc print-area mx-auto" [class.draft]="!lettre">

        <!-- En-tête officiel -->
        <div class="lettre-header">
          <div class="lettre-header-left">
            <img src="assets/logo.png" alt="SEN-CSU" class="lettre-logo" />
            <div class="lettre-agency">
              <div class="agency-name">AGENCE SÉNÉGALAISE DE LA</div>
              <div class="agency-name">COUVERTURE SANITAIRE</div>
              <div class="agency-name">UNIVERSELLE</div>
            </div>
          </div>
          <div class="lettre-header-right">
            <div class="republic-title">REPUBLIQUE DU SENEGAL</div>
            <div class="republic-motto">UN PEUPLE — UN BUT — UNE FOI</div>
          </div>
        </div>

        <!-- Titre encadré -->
        <div class="lettre-title-box">
          <span class="lettre-title">LETTRE DE GARANTIE</span>
        </div>

        <!-- Numéro de référence -->
        <div class="lettre-ref">
          N° <span class="dotted-field">{{ lettre ? lettre.reference : '...........................' }}</span>
        </div>

        <!-- Souche -->
        <div class="lettre-souche">Souche</div>

        <!-- Structure -->
        <div class="lettre-section">
          <span class="field-label-bold">STRUCTURE :</span>
          <span class="dotted-field dotted-long">{{ lettre?.structure || patient.service || '.........................................................................' }}</span>
        </div>

        <!-- Champs du formulaire -->
        <div class="lettre-fields">
          <div class="field-row">
            <span class="field-label">Prénom et nom de l'assuré</span>
            <span class="dotted-field dotted-long">{{ patient.prenom }} {{ patient.nom }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Type d'assuré</span>
            <span class="dotted-field dotted-long">{{ typeAssureLabel }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Code assuré/immatriculation</span>
            <span class="dotted-field dotted-long">{{ codeAssure }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Date de naissance / Age</span>
            <span class="dotted-field dotted-long">{{ patient.dateNaissance | date:'dd/MM/yyyy' }} ({{ lettre?.ageBeneficiaire || age }} ans)</span>
          </div>
          <div class="field-row">
            <span class="field-label">Sexe</span>
            <span class="dotted-field dotted-long">
              {{ (lettre?.sexeBeneficiaire || patient.sexe) === 'M' ? 'Masculin' : ((lettre?.sexeBeneficiaire || patient.sexe) === 'F' ? 'Féminin' : '-') }}
            </span>
          </div>
        </div>

        <!-- Motif -->
        <div class="lettre-section mt-3">
          <div class="field-row">
            <span class="field-label">Motif</span>
            <span class="dotted-field dotted-long">{{ lettre?.motif || patient.diagnosticMotif || '.........................................................................' }}</span>
          </div>
        </div>

        <!-- Taux de prise en charge -->
        <div class="lettre-section mt-4">
          <div class="field-row">
            <span class="field-label">Taux de prise en charge</span>
            <span class="dotted-field dotted-long">{{ lettre?.tauxPriseEnCharge || '80%' }}</span>
          </div>
        </div>

        <!-- Date -->
        <div class="lettre-section mt-4">
          <div class="field-row">
            <span class="field-label">Date :</span>
            <span class="dotted-field">{{ lettre ? (lettre.dateEmission | date:'dd/MM/yyyy') : '..............................' }}</span>
          </div>
        </div>

        <!-- Signature et cachet -->
        <div class="lettre-signature">
          <span class="signature-label">Signature et cachet</span>
        </div>

        <!-- Pied de page -->
        <div class="lettre-footer">
          Valable pour une période d'un mois à partir de la date de délivrance
        </div>

      </div>
    </div>
  `,
  styles: [`
    .status-banner { display: flex; align-items: flex-start; gap: 12px; padding: 0.9rem 1.1rem; border-radius: 14px; }
    .status-banner i { font-size: 1.3rem; margin-top: 1px; }
    .status-banner div { display: flex; flex-direction: column; gap: 2px; }
    .status-banner b { font-size: 0.92rem; }
    .status-banner span { font-size: 0.84rem; line-height: 1.4; }
    .status-banner.active { background: rgba(67,160,71,0.1); border: 1px solid rgba(67,160,71,0.3); color: #1B5E20; }
    .status-banner.none { background: rgba(245,124,0,0.1); border: 1px solid rgba(245,124,0,0.3); color: #E65100; }

    .print-area.draft { opacity: 0.85; border: 2px dashed rgba(0,0,0,0.15) !important; }

    /* ========== Lettre de Garantie - Format officiel ========== */
    .lettre-doc {
      max-width: 820px;
      background: #fff;
      padding: 40px 48px;
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.06);
      font-family: 'Times New Roman', Times, serif;
      font-size: 14px;
      color: #222;
      line-height: 1.7;
    }

    /* En-tête */
    .lettre-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .lettre-header-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .lettre-logo { height: 56px; }
    .lettre-agency { font-size: 11px; font-weight: 700; line-height: 1.4; text-transform: uppercase; }
    .agency-name { letter-spacing: 0.3px; }
    .lettre-header-right { text-align: right; }
    .republic-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .republic-motto { font-size: 12px; margin-top: 4px; font-style: italic; }

    /* Titre encadré */
    .lettre-title-box {
      text-align: center;
      margin: 20px 0 16px;
    }
    .lettre-title {
      display: inline-block;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border: 2px solid #333;
      padding: 6px 28px;
    }

    /* Référence */
    .lettre-ref {
      margin-bottom: 20px;
      font-size: 14px;
    }

    /* Souche */
    .lettre-souche {
      font-size: 14px;
      margin-bottom: 16px;
    }

    /* Section */
    .lettre-section {
      margin-bottom: 8px;
    }

    /* Labels et champs */
    .field-label-bold { font-weight: 700; font-size: 15px; margin-right: 6px; }
    .field-label { font-size: 14px; margin-right: 6px; white-space: nowrap; }
    .field-row {
      display: flex;
      align-items: baseline;
      margin-bottom: 10px;
    }

    .dotted-field {
      border-bottom: 1px dotted #666;
      flex: 1;
      min-width: 80px;
      padding-bottom: 1px;
      font-weight: 600;
    }
    .dotted-long { flex: 1; }

    .lettre-fields {
      margin-top: 12px;
    }

    /* Signature */
    .lettre-signature {
      margin-top: 40px;
      margin-bottom: 60px;
    }
    .signature-label {
      font-size: 15px;
      font-weight: 700;
    }

    /* Footer */
    .lettre-footer {
      border-top: 1px solid #999;
      padding-top: 10px;
      font-size: 13px;
      font-style: italic;
      color: #555;
    }

    @media print {
      .no-print { display: none !important; }
      .lettre-doc { box-shadow: none !important; border: none !important; opacity: 1 !important; border-radius: 0; padding: 20px 30px; }
    }
  `]

})
export class LettreGarantieComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private lettreService = inject(LettreGarantieService);

  patient?: Patient;
  lettre: LettreGarantie | null = null;
  loading = true;
  emitting = false;
  generatingPdf = false;

  private static LABELS: Record<string, string> = {
    'classique': 'Classique',
    '0-5ans': 'Enfants de moins de 5 ans',
    'cesarienne': 'Césarienne',
    'dialyse-peritoneale': 'Dialyse péritonéale',
    'hemodialyse': 'Hémodialyse',
    'bsf': 'Bourse de Sécurité Familiale',
    'cec': 'Carte Égalité des Chances',
    'plan-sesame': 'Plan Sésame',
    'ndongo-dara': 'Plan Ndongo Dara / Élève'
  };

  get categorieLabel(): string {
    const c = this.patient?.categorie;
    return (c && LettreGarantieComponent.LABELS[c]) ? LettreGarantieComponent.LABELS[c] : 'Classique';
  }

  get age(): number {
    if (!this.patient?.dateNaissance) return 0;
    const today = new Date();
    const birth = new Date(this.patient.dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  get joursRestants(): number {
    if (!this.lettre?.dateExpiration) return 0;
    const exp = new Date(this.lettre.dateExpiration).getTime();
    const diff = Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  /** Type d'assuré affiché sur la lettre (correspond à la catégorie). */
  get typeAssureLabel(): string {
    if (this.lettre?.typeAssure) {
      const l = LettreGarantieComponent.LABELS[this.lettre.typeAssure];
      if (l) return l;
    }
    return this.categorieLabel;
  }

  /** Code assuré / immatriculation affiché sur la lettre. */
  get codeAssure(): string {
    if (this.lettre?.codeAssureImmatriculation) return this.lettre.codeAssureImmatriculation;
    return this.patient?.numeroMatricule || this.patient?.numeroCni || '-';
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.patientService.getPatientById(id).subscribe({
      next: (p) => {
        this.patient = p;
        this.chargerLettreActive(id);
      },
      error: () => {
        Swal.fire('Erreur', 'Patient introuvable.', 'error');
        this.router.navigate(['/patients']);
      }
    });
  }

  private chargerLettreActive(patientId: number): void {
    this.lettreService.getActive(patientId).subscribe({
      next: (l) => { 
        this.lettre = l && (l as any).id ? l : null; 
        this.loading = false;
        // Auto-téléchargement si demandé par l'admin
        setTimeout(() => {
          if (this.route.snapshot.queryParamMap.get('downloadPdf') === 'true') {
            this.telechargerPDF();
          }
        }, 500);
      },
      error: () => { 
        this.lettre = null; 
        this.loading = false; 
        setTimeout(() => {
          if (this.route.snapshot.queryParamMap.get('downloadPdf') === 'true') {
            this.telechargerPDF();
          }
        }, 500);
      }
    });
  }

  emettre(): void {
    if (!this.patient?.id) return;
    this.emitting = true;
    this.lettreService.emettre(this.patient.id).subscribe({
      next: (res) => {
        this.emitting = false;
        this.lettre = res.lettre;
        if (res.reused) {
          Swal.fire({
            icon: 'info',
            title: 'Lettre déjà valable',
            text: res.message,
            confirmButtonColor: '#00875A'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Lettre émise',
            text: res.message,
            timer: 2200,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        this.emitting = false;
        Swal.fire('Erreur', err?.error?.message || "Émission impossible.", 'error');
      }
    });
  }

  imprimer(): void {
    if (typeof window !== 'undefined') window.print();
  }

  telechargerPDF(): void {
    const docElement = document.querySelector('.lettre-doc') as HTMLElement;
    if (!docElement) return;

    this.generatingPdf = true;

    // Masquer la classe "draft" temporairement pour ne pas imprimer la bordure pointillée
    const wasDraft = docElement.classList.contains('draft');
    if (wasDraft) docElement.classList.remove('draft');

    html2canvas(docElement, { scale: 2, useCORS: true }).then(canvas => {
      if (wasDraft) docElement.classList.add('draft');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Lettre_Garantie_${this.lettre?.reference || 'Brouillon'}.pdf`);
      
      this.generatingPdf = false;
    }).catch(err => {
      this.generatingPdf = false;
      console.error('Erreur PDF', err);
    });
  }
}
