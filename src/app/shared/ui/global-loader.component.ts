import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

/**
 * Loader plein écran de la plateforme Sen-CSU.
 *
 * Recouvre toute la page (fond opaque) afin de masquer le contenu en cours
 * de chargement, avec le logo Sen-CSU au centre et un anneau animé.
 *
 * Placé une seule fois à la racine de l'application (`app.component.html`).
 * S'affiche automatiquement via `LoadingService` / `loadingInterceptor`.
 */
@Component({
  selector: 'csu-global-loader',
  standalone: true,
  template: `
    @if (loading.isLoading()) {
      <div class="csu-overlay" role="status" aria-live="polite" aria-busy="true">
        <div class="csu-loader-box">
          <div class="ring">
            <span class="ring-track"></span>
            <img src="assets/logo.png" alt="Sen-CSU" class="logo" />
          </div>
          <p class="msg">{{ loading.message() || 'Chargement…' }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .csu-overlay {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Fond opaque : on ne voit pas le contenu en cours de chargement */
      background: var(--csu-bg, #f8fafc);
      animation: csu-overlay-in 0.18s ease-out;
    }

    .csu-loader-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .ring {
      position: relative;
      width: 104px;
      height: 104px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Anneau qui tourne autour du logo */
    .ring-track {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 4px solid var(--csu-primary-light, rgba(16, 185, 129, 0.12));
      border-top-color: var(--csu-primary, #10b981);
      animation: csu-spin 0.9s linear infinite;
    }

    .logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 14px;
      animation: csu-pulse 1.4s ease-in-out infinite;
    }

    .msg {
      margin: 0;
      font-family: 'Outfit', 'Inter', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
      color: var(--csu-text-muted, #6b7280);
    }

    @keyframes csu-spin {
      to { transform: rotate(360deg); }
    }

    @keyframes csu-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.9); opacity: 0.72; }
    }

    @keyframes csu-overlay-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Respect des préférences de réduction de mouvement */
    @media (prefers-reduced-motion: reduce) {
      .ring-track, .logo, .csu-overlay { animation: none; }
    }
  `]
})
export class GlobalLoaderComponent {
  loading = inject(LoadingService);
}
