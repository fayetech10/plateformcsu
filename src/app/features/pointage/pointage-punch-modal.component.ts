import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PointageService } from '../../core/services/pointage.service';
import { AuthService } from '../../core/services/auth.service';
import { PointageStatutJour } from '../../core/models/pointage.model';
import Swal from 'sweetalert2';

/**
 * Modal plein écran de pointage affiché à la connexion de l'agent.
 * Bloque la page tant que l'arrivée n'est pas pointée, afin de garder
 * l'attention de l'agent sur l'action de pointage.
 */
@Component({
  selector: 'app-pointage-punch-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="punch-overlay">
        <div class="punch-modal animate-pop">
          <div class="punch-badge"><i class="bi bi-alarm-fill"></i></div>

          <div class="punch-clock">{{ now | date:'HH:mm:ss' }}</div>
          <div class="punch-date">{{ now | date:'EEEE d MMMM y' }}</div>

          <h2 class="punch-title">Bonjour {{ prenom }} 👋</h2>
          <p class="punch-msg">
            Vous n'avez pas encore pointé votre arrivée aujourd'hui.<br />
            Enregistrez votre présence pour commencer votre journée.
          </p>

          <button class="csu-btn punch-cta" (click)="pointerArrivee()" [disabled]="busy">
            @if (busy) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Enregistrement...
            } @else {
              <i class="bi bi-box-arrow-in-right me-1"></i> Pointer mon arrivée
            }
          </button>

          <button class="punch-later" (click)="plusTard()" [disabled]="busy">
            Plus tard
          </button>

          <p class="punch-hint"><i class="bi bi-geo-alt"></i> Votre position sera vérifiée lors du pointage.</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .punch-overlay {
      position: fixed;
      inset: 0;
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(8, 20, 16, 0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .punch-modal {
      background: #fff;
      border-radius: 24px;
      padding: 2.5rem 2rem 2rem;
      width: 100%;
      max-width: 440px;
      text-align: center;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
      position: relative;
    }
    .animate-pop { animation: pop 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes pop { from { opacity: 0; transform: scale(0.92) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .punch-badge {
      width: 72px; height: 72px; margin: 0 auto 1rem;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; color: #fff;
      background: linear-gradient(135deg, #F57C00, #E65100);
      box-shadow: 0 8px 24px rgba(245, 124, 0, 0.4);
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    .punch-clock {
      font-family: 'Outfit', sans-serif;
      font-size: 3rem; font-weight: 800; line-height: 1;
      color: var(--csu-primary, #00875A);
      letter-spacing: -0.02em;
    }
    .punch-date { text-transform: capitalize; color: var(--csu-text-muted, #6B7280); font-weight: 600; margin-top: 4px; }
    .punch-title { font-size: 1.35rem; font-weight: 800; margin: 1.25rem 0 0.5rem; }
    .punch-msg { color: var(--csu-text-muted, #6B7280); font-size: 0.92rem; margin-bottom: 1.5rem; }
    .punch-cta {
      width: 100%;
      background: linear-gradient(135deg, #F57C00, #E65100);
      color: #fff; border: none;
      padding: 0.95rem 1rem; font-size: 1.05rem; font-weight: 700;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(245, 124, 0, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .punch-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(245, 124, 0, 0.45); }
    .punch-cta:disabled { opacity: 0.7; }
    .punch-later {
      background: none; border: none; color: var(--csu-text-muted, #6B7280);
      font-size: 0.85rem; font-weight: 600; margin-top: 0.9rem; cursor: pointer;
      text-decoration: underline; text-underline-offset: 3px;
    }
    .punch-later:hover { color: var(--csu-text, #111); }
    .punch-hint { font-size: 0.75rem; color: var(--csu-text-muted, #9CA3AF); margin: 1rem 0 0; }
  `]
})
export class PointagePunchModalComponent implements OnInit, OnDestroy {
  private pointageService = inject(PointageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private static readonly DISMISS_KEY = 'pointage_modal_dismissed';

  now = new Date();
  statut?: PointageStatutJour;
  busy = false;
  dismissed = false;
  private timer?: any;

  get prenom(): string {
    return this.authService.currentUserValue?.prenom || '';
  }

  /** Le modal s'affiche pour les agents non pointés, tant qu'il n'a pas été reporté. */
  get visible(): boolean {
    return this.authService.isAgent()
      && !!this.statut
      && !this.statut.aPointeArrivee
      && !this.dismissed;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.authService.isAgent()) return;

    this.dismissed = sessionStorage.getItem(PointagePunchModalComponent.DISMISS_KEY) === '1';
    this.timer = setInterval(() => (this.now = new Date()), 1000);
    this.load();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private load(): void {
    this.pointageService.getMyToday().subscribe({
      next: (s) => (this.statut = s),
      error: () => (this.statut = undefined)
    });
  }

  plusTard(): void {
    this.dismissed = true;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(PointagePunchModalComponent.DISMISS_KEY, '1');
    }
  }

  async pointerArrivee(): Promise<void> {
    this.busy = true;
    const coords = await this.pointageService.obtenirPosition();
    this.pointageService.pointerArrivee(coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        if (res.positionVerifiee === false) {
          Swal.fire({ icon: 'info', title: 'Arrivée enregistrée', text: `Heure : ${res.heureArrivee} — position non vérifiée.`, timer: 2500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'success', title: 'Bonne journée !', text: `Arrivée enregistrée à ${res.heureArrivee}.`, timer: 2200, showConfirmButton: false });
        }
        this.load(); // statut.aPointeArrivee passe à true -> le modal se ferme
      },
      error: (err) => {
        this.busy = false;
        const horsZone = err?.error?.horsZone === true;
        Swal.fire({ icon: 'error', title: horsZone ? 'Pointage refusé' : 'Impossible', text: err?.error?.message || 'Erreur lors du pointage.' });
      }
    });
  }
}
