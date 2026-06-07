import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';
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
          <button class="csu-btn csu-btn-primary" (click)="imprimer()"><i class="bi bi-printer"></i> Imprimer</button>
          <a routerLink="/bons-commande/nouveau" [queryParams]="{ patientId: patient.id }" class="csu-btn csu-btn-secondary">
            <i class="bi bi-receipt-cutoff"></i> Bon de commande
          </a>
          <a [routerLink]="['/patients', patient.id]" class="csu-btn csu-btn-light">Retour</a>
        </div>
      </div>

      <!-- Document imprimable -->
      <div class="csu-card print-area mx-auto" style="max-width: 820px;">
        <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
          <div class="d-flex align-items-center gap-3">
            <img src="assets/logo.png" alt="CSU" style="height: 56px;" />
            <div>
              <div class="fw-bold fs-5 text-csu-primary">Couverture Sanitaire Universelle</div>
              <div class="small text-muted">République du Sénégal — Programme CSU</div>
            </div>
          </div>
          <div class="text-end">
            <div class="small text-muted">N° Dossier</div>
            <div class="fw-bold">{{ patient.numeroDossier }}</div>
            <div class="small text-muted mt-1">{{ today | date:'dd/MM/yyyy' }}</div>
          </div>
        </div>

        <h2 class="text-center fw-bold text-uppercase mb-4" style="letter-spacing:1px;">Lettre de Garantie</h2>

        <p class="mb-3">
          Le Bureau de la Couverture Sanitaire Universelle garantit la prise en charge des soins
          du bénéficiaire désigné ci-après, conformément aux modalités du régime
          <strong>{{ categorieLabel }}</strong>.
        </p>

        <!-- Identité du bénéficiaire -->
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
          La présente lettre de garantie atteste l'enregistrement du bénéficiaire dans le système CSU et
          ouvre droit à la prise en charge prévue. En cas d'ordonnance dont les médicaments ne sont pas
          disponibles dans l'établissement, un <strong>bon de commande</strong> est délivré pour acquisition
          en pharmacie conventionnée.
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
    @media print {
      .no-print { display: none !important; }
      .print-area { box-shadow: none !important; border: none !important; }
    }
  `]
})
export class LettreGarantieComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);

  patient?: Patient;
  today = new Date();

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

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.patientService.getPatientById(id).subscribe({
      next: (p) => this.patient = p,
      error: () => {
        Swal.fire('Erreur', 'Patient introuvable.', 'error');
        this.router.navigate(['/patients']);
      }
    });
  }

  imprimer(): void {
    if (typeof window !== 'undefined') window.print();
  }
}
