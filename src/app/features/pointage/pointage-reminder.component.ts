import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PointageService } from '../../core/services/pointage.service';
import { PointageStatutJour } from '../../core/models/pointage.model';
import Swal from 'sweetalert2';

/**
 * Bannière de rappel de pointage affichée en haut du tableau de bord.
 * Visible dès l'entrée sur la plateforme pour que l'agent n'oublie pas
 * de pointer son arrivée / son départ.
 */
@Component({
  selector: 'app-pointage-reminder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (statut) {
      <!-- Arrivée non pointée -->
      @if (!statut.aPointeArrivee) {
        <div class="punch-banner to-do">
          <div class="banner-ico"><i class="bi bi-alarm"></i></div>
          <div class="banner-text">
            <strong>N'oubliez pas de pointer votre arrivée !</strong>
            <span>Vous n'avez pas encore enregistré votre présence aujourd'hui.</span>
          </div>
          <button class="csu-btn banner-btn" (click)="pointerArrivee()" [disabled]="busy">
            <i class="bi bi-box-arrow-in-right"></i> Pointer mon arrivée
          </button>
        </div>
      } @else if (!statut.aPointeDepart) {
        <!-- En service, départ non pointé -->
        <div class="punch-banner in-service">
          <div class="banner-ico"><i class="bi bi-person-check"></i></div>
          <div class="banner-text">
            <strong>Vous êtes pointé(e) depuis {{ statut.heureArrivee }}</strong>
            <span>Pensez à pointer votre départ en fin de journée.</span>
          </div>
          <button class="csu-btn banner-btn depart" (click)="pointerDepart()" [disabled]="busy">
            <i class="bi bi-box-arrow-right"></i> Pointer mon départ
          </button>
        </div>
      } @else {
        <!-- Terminé -->
        <div class="punch-banner done">
          <div class="banner-ico"><i class="bi bi-check2-all"></i></div>
          <div class="banner-text">
            <strong>Présence enregistrée pour aujourd'hui</strong>
            <span>Arrivée {{ statut.heureArrivee }} · Départ {{ statut.heureDepart }}</span>
          </div>
          <a routerLink="/pointage" class="banner-link">Voir mon historique <i class="bi bi-chevron-right"></i></a>
        </div>
      }
    }
  `,
  styles: [`
    .punch-banner {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px; border-radius: 14px; margin-bottom: 1.25rem;
      border: 1px solid transparent;
      animation: slideDown 0.35s ease;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .banner-ico { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
    .banner-text { display: flex; flex-direction: column; line-height: 1.3; flex-grow: 1; min-width: 0; }
    .banner-text strong { font-size: 0.98rem; }
    .banner-text span { font-size: 0.83rem; opacity: 0.85; }
    .banner-btn { color: #fff; border: none; white-space: nowrap; font-weight: 600; }
    .banner-link { text-decoration: none; font-weight: 600; font-size: 0.85rem; white-space: nowrap; }

    /* À faire (arrivée) */
    .punch-banner.to-do { background: linear-gradient(135deg, rgba(245,124,0,0.1), rgba(245,124,0,0.04)); border-color: rgba(245,124,0,0.25); }
    .punch-banner.to-do .banner-ico { background: rgba(245,124,0,0.15); color: #E65100; }
    .punch-banner.to-do .banner-btn { background: #F57C00; }
    .punch-banner.to-do .banner-btn:hover { background: #E65100; }

    /* En service */
    .punch-banner.in-service { background: linear-gradient(135deg, rgba(0,135,90,0.08), rgba(0,135,90,0.03)); border-color: rgba(0,135,90,0.2); }
    .punch-banner.in-service .banner-ico { background: rgba(0,135,90,0.14); color: #00875A; }
    .punch-banner.in-service .banner-btn.depart { background: #00875A; }
    .punch-banner.in-service .banner-btn.depart:hover { background: #00674a; }

    /* Terminé */
    .punch-banner.done { background: var(--csu-bg); border-color: var(--csu-border-light); }
    .punch-banner.done .banner-ico { background: rgba(0,135,90,0.12); color: #00875A; }
    .punch-banner.done .banner-link { color: var(--csu-primary); }

    @media (max-width: 576px) {
      .punch-banner { flex-direction: column; align-items: flex-start; }
      .banner-btn, .banner-link { align-self: stretch; text-align: center; }
    }
  `]
})
export class PointageReminderComponent implements OnInit {
  private pointageService = inject(PointageService);

  statut?: PointageStatutJour;
  busy = false;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.pointageService.getMyToday().subscribe({
      next: (s) => (this.statut = s),
      error: () => (this.statut = undefined)
    });
  }

  async pointerArrivee(): Promise<void> {
    this.busy = true;
    const coords = await this.pointageService.obtenirPosition();
    this.pointageService.pointerArrivee(coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        if (res.alerte) {
          Swal.fire({ icon: 'warning', title: 'Arrivée enregistrée (hors zone)', text: res.alerte });
        } else if (res.positionVerifiee === false) {
          Swal.fire({ icon: 'info', title: 'Arrivée enregistrée', text: `Heure : ${res.heureArrivee} — position non vérifiée.`, timer: 2500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'success', title: 'Arrivée enregistrée', text: `Heure : ${res.heureArrivee}`, timer: 2000, showConfirmButton: false });
        }
        this.load();
      },
      error: (err) => {
        this.busy = false;
        Swal.fire({ icon: 'warning', title: 'Impossible', text: err?.error?.message || 'Erreur lors du pointage.' });
        this.load();
      }
    });
  }

  async pointerDepart(): Promise<void> {
    this.busy = true;
    const coords = await this.pointageService.obtenirPosition();
    this.pointageService.pointerDepart(coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        if (res.alerte) {
          Swal.fire({ icon: 'warning', title: 'Départ enregistré (hors zone)', text: res.alerte });
        } else {
          Swal.fire({ icon: 'success', title: 'Départ enregistré', text: `Heure : ${res.heureDepart}`, timer: 2000, showConfirmButton: false });
        }
        this.load();
      },
      error: (err) => {
        this.busy = false;
        Swal.fire({ icon: 'warning', title: 'Impossible', text: err?.error?.message || 'Erreur lors du pointage.' });
        this.load();
      }
    });
  }
}
