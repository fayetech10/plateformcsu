import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
          } @else {
            <button class="csu-btn csu-btn-primary" (click)="emettre()" [disabled]="emitting || loading">
              @if (emitting) { <span class="spinner-border spinner-border-sm me-1"></span> Émission… }
              @else { <i class="bi bi-file-earmark-plus"></i> Émettre la lettre }
            </button>
          }
          <a routerLink="/bons-commande/nouveau" [queryParams]="{ patientId: patient.id }" class="csu-btn csu-btn-secondary">
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
              <span>Émettez une lettre de garantie : elle sera valable <b>2 semaines</b>. Si le patient revient pendant cette période, la même lettre sera réutilisée.</span>
            </div>
          </div>
        }
      </div>

      <!-- Document imprimable -->
      <div class="csu-card print-area mx-auto" style="max-width: 820px;" [class.draft]="!lettre">
        <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
          <div class="d-flex align-items-center gap-3">
            <img src="assets/logo.png" alt="CSU" style="height: 56px;" />
            <div>
              <div class="fw-bold fs-5 text-csu-primary">Couverture Sanitaire Universelle</div>
              <div class="small text-muted">République du Sénégal — Programme CSU</div>
            </div>
          </div>
          <div class="text-end">
            @if (lettre) {
              <div class="small text-muted">N° Lettre de garantie</div>
              <div class="fw-bold">{{ lettre.reference }}</div>
              <div class="small text-muted mt-1">Émise le {{ lettre.dateEmission | date:'dd/MM/yyyy' }}</div>
            } @else {
              <div class="small text-muted">N° Dossier</div>
              <div class="fw-bold">{{ patient.numeroDossier }}</div>
              <div class="small text-danger mt-1">Brouillon — non émise</div>
            }
          </div>
        </div>

        <h2 class="text-center fw-bold text-uppercase mb-3" style="letter-spacing:1px;">Lettre de Garantie</h2>

        @if (lettre) {
          <p class="text-center mb-4">
            <span class="validity-pill">Valable du {{ lettre.dateEmission | date:'dd/MM/yyyy' }} au {{ lettre.dateExpiration | date:'dd/MM/yyyy' }}</span>
          </p>
        }

        <p class="mb-3">
          Le Bureau de la Couverture Sanitaire Universelle garantit la prise en charge des soins
          du bénéficiaire désigné ci-après, conformément aux modalités du régime
          <strong>{{ categorieLabel }}</strong>.
        </p>

        <table class="table table-bordered align-middle mb-4">
          <tbody>
            <tr><th style="width:40%" class="table-light">Prénom & Nom</th><td class="fw-semibold">{{ patient.prenom }} {{ patient.nom }}</td></tr>
            <tr><th class="table-light">Sexe</th><td>{{ patient.sexe === 'M' ? 'Masculin' : 'Féminin' }}</td></tr>
            <tr><th class="table-light">Date de naissance</th><td>{{ patient.dateNaissance | date:'dd/MM/yyyy' }} ({{ age }} ans)</td></tr>
            <tr><th class="table-light">Téléphone</th><td>{{ patient.telephone || '-' }}</td></tr>
            <tr><th class="table-light">Adresse</th><td>{{ patient.adresse || '-' }}<span *ngIf="patient.commune"> — {{ patient.commune }}, {{ patient.region }}</span></td></tr>
            <tr><th class="table-light">Catégorie de prise en charge</th><td class="fw-semibold">{{ categorieLabel }}</td></tr>
            <tr *ngIf="patient.numeroMatricule"><th class="table-light">N° Matricule</th><td>{{ patient.numeroMatricule }}</td></tr>
            <tr *ngIf="patient.service"><th class="table-light">Service / Établissement</th><td>{{ patient.service }}</td></tr>
          </tbody>
        </table>

        <p class="small text-secondary mb-4">
          La présente lettre de garantie ouvre droit à la prise en charge prévue durant sa période de validité
          (2 semaines). En cas d'ordonnance dont les médicaments ne sont pas disponibles dans l'établissement,
          un <strong>bon de commande</strong> est délivré pour acquisition en pharmacie conventionnée.
        </p>

        <div class="d-flex justify-content-between mt-5 pt-4">
          <div class="text-center small">
            <div style="border-top:1px solid #999; width:200px; margin:0 auto; padding-top:4px;">Le Bénéficiaire</div>
          </div>
          <div class="text-center small">
            <div style="border-top:1px solid #999; width:200px; margin:0 auto; padding-top:4px;">Cachet & Signature — Bureau CSU</div>
          </div>
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

    .validity-pill { display: inline-block; font-size: 0.82rem; font-weight: 700; color: #1B5E20; background: rgba(67,160,71,0.12);
      border: 1px solid rgba(67,160,71,0.3); padding: 4px 14px; border-radius: 20px; }
    .print-area.draft { opacity: 0.85; border: 2px dashed rgba(0,0,0,0.15) !important; }

    @media print {
      .no-print { display: none !important; }
      .print-area { box-shadow: none !important; border: none !important; opacity: 1 !important; }
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
      next: (l) => { this.lettre = l && (l as any).id ? l : null; this.loading = false; },
      error: () => { this.lettre = null; this.loading = false; }
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
}
