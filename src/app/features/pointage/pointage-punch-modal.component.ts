import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { PointageService } from '../../core/services/pointage.service';
import { AuthService } from '../../core/services/auth.service';
import { PointageStatutJour, GeoErreur } from '../../core/models/pointage.model';
import Swal from 'sweetalert2';

/**
 * Modal plein écran de pointage affiché à la connexion de l'agent.
 * BLOQUANT : l'agent ne peut rien faire tant qu'il n'a pas pointé son arrivée.
 * Il n'y a aucun moyen de fermer ou de contourner ce modal.
 *
 * Les erreurs (hors zone, localisation requise, etc.) s'affichent
 * directement dans le modal avec des messages très clairs.
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

          <!-- ═══════ Message normal (pas d'erreur) ═══════ -->
          @if (!erreurMessage) {
            <p class="punch-msg">
              Vous devez obligatoirement pointer votre arrivee avant de commencer.<br />
              <strong>Aucune action n'est possible sans pointage.</strong>
            </p>
          }

          <!-- ═══════ Bloc d'erreur inline ═══════ -->
          @if (erreurMessage) {
            <div class="punch-error animate-shake" [ngClass]="erreurType">
              <div class="punch-error-header">
                <div class="punch-error-icon-wrap">
                  <i class="bi" [ngClass]="erreurIcon"></i>
                </div>
                <div class="punch-error-title">{{ erreurTitre }}</div>
              </div>
              <div class="punch-error-text">{{ erreurMessage }}</div>
              @if (erreurEtapes.length > 0) {
                <div class="punch-error-steps">
                  <div class="punch-error-steps-title">Que faire ?</div>
                  @for (etape of erreurEtapes; track etape) {
                    <div class="punch-error-step">
                      <i class="bi bi-arrow-right-circle-fill"></i>
                      <span>{{ etape }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <button class="csu-btn punch-cta" (click)="pointerArrivee()" [disabled]="busy">
            @if (busy) {
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Verification en cours...
            } @else if (erreurMessage) {
              <i class="bi bi-arrow-clockwise me-1"></i> Reessayer le pointage
            } @else {
              <i class="bi bi-box-arrow-in-right me-1"></i> Pointer mon arrivee
            }
          </button>

          <div class="punch-warning-bar">
            <i class="bi bi-shield-lock-fill"></i>
            <span>Vous ne pouvez pas utiliser l'application sans pointer votre arrivee.</span>
          </div>

          <p class="punch-hint"><i class="bi bi-geo-alt"></i> Votre position GPS sera verifiee. Vous devez etre physiquement au bureau.</p>
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
      background: rgba(8, 20, 16, 0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .punch-modal {
      background: #fff;
      border-radius: 24px;
      padding: 2.5rem 2rem 2rem;
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
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
    .punch-msg { color: var(--csu-text-muted, #6B7280); font-size: 0.92rem; margin-bottom: 1.5rem; line-height: 1.5; }
    .punch-msg strong { color: #C62828; }
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
    .punch-hint { font-size: 0.75rem; color: var(--csu-text-muted, #9CA3AF); margin: 1rem 0 0; }

    /* ─── Barre d'avertissement bloquante ─── */
    .punch-warning-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 1rem;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(198, 40, 40, 0.08);
      border: 1px solid rgba(198, 40, 40, 0.2);
      color: #C62828;
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1.3;
    }
    .punch-warning-bar i { font-size: 1rem; flex-shrink: 0; }

    /* ─── Bloc d'erreur inline dans le modal ─── */
    .punch-error {
      text-align: left;
      padding: 18px 16px;
      margin-bottom: 1.25rem;
      border-radius: 16px;
      position: relative;
    }
    .punch-error.erreur-horszone {
      background: linear-gradient(135deg, rgba(229, 57, 53, 0.08), rgba(198, 40, 40, 0.12));
      border: 2px solid rgba(229, 57, 53, 0.35);
    }
    .punch-error.erreur-geo {
      background: linear-gradient(135deg, rgba(245, 124, 0, 0.08), rgba(230, 81, 0, 0.12));
      border: 2px solid rgba(245, 124, 0, 0.35);
    }
    .punch-error.erreur-autre {
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.07));
      border: 2px solid rgba(0, 0, 0, 0.15);
    }

    .punch-error-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .punch-error-icon-wrap {
      flex-shrink: 0;
      width: 40px; height: 40px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem;
    }
    .erreur-horszone .punch-error-icon-wrap { background: rgba(229, 57, 53, 0.18); color: #C62828; }
    .erreur-geo .punch-error-icon-wrap { background: rgba(245, 124, 0, 0.18); color: #E65100; }
    .erreur-autre .punch-error-icon-wrap { background: rgba(0, 0, 0, 0.1); color: #374151; }

    .punch-error-title {
      font-weight: 800;
      font-size: 1rem;
    }
    .erreur-horszone .punch-error-title { color: #B71C1C; }
    .erreur-geo .punch-error-title { color: #E65100; }
    .erreur-autre .punch-error-title { color: #374151; }

    .punch-error-text {
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    .erreur-horszone .punch-error-text { color: #C62828; }
    .erreur-geo .punch-error-text { color: #BF360C; }
    .erreur-autre .punch-error-text { color: #374151; }

    .punch-error-steps {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }
    .punch-error-steps-title {
      font-weight: 800;
      font-size: 0.82rem;
      color: #374151;
      margin-bottom: 8px;
    }
    .punch-error-step {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.8rem;
      color: #4B5563;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    .punch-error-step i {
      color: var(--csu-primary, #00875A);
      font-size: 0.85rem;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-8px); }
      30% { transform: translateX(6px); }
      45% { transform: translateX(-5px); }
      60% { transform: translateX(4px); }
      75% { transform: translateX(-2px); }
    }
  `]
})
export class PointagePunchModalComponent implements OnInit, OnDestroy {
  private pointageService = inject(PointageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  now = new Date();
  statut?: PointageStatutJour;
  busy = false;
  private timer?: any;

  // ─── Erreur affichée dans le modal ───
  erreurTitre = '';
  erreurMessage = '';
  erreurEtapes: string[] = [];
  erreurIcon = 'bi-exclamation-triangle-fill';
  erreurType = 'erreur-autre';  // 'erreur-horszone' | 'erreur-geo' | 'erreur-autre'

  get prenom(): string {
    return this.authService.currentUserValue?.prenom || '';
  }

  /**
   * Le modal est BLOQUANT : il s'affiche tant que l'agent n'a pas pointé.
   * Aucun bouton "Plus tard" n'est disponible.
   */
  get visible(): boolean {
    return this.authService.isAgent()
      && !!this.statut
      && !this.statut.aPointeArrivee;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.authService.isAgent()) return;

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

  private fermerErreur(): void {
    this.erreurMessage = '';
    this.erreurTitre = '';
    this.erreurEtapes = [];
  }

  async pointerArrivee(): Promise<void> {
    this.busy = true;
    this.fermerErreur();

    const pos = await this.pointageService.obtenirPositionDetaillee();

    this.pointageService.pointerArrivee(pos.coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        if (res.positionVerifiee === false) {
          Swal.fire({ icon: 'info', title: 'Arrivee enregistree', text: `Heure : ${res.heureArrivee} — position non verifiee.`, timer: 2500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'success', title: 'Bonne journee !', text: `Arrivee enregistree a ${res.heureArrivee}.`, timer: 2200, showConfirmButton: false });
        }
        this.load(); // statut.aPointeArrivee passe a true -> le modal se ferme
      },
      error: (err) => {
        this.busy = false;
        this.afficherErreurDansModal(err, pos.erreur);
      }
    });
  }

  /** Affiche l'erreur directement dans le modal avec des messages clairs. */
  private afficherErreurDansModal(err: any, geoErreur: GeoErreur | null): void {
    const e = err?.error || {};

    // ── CAS 1 : L'agent n'est PAS au bureau (hors zone) ──
    if (e.horsZone === true) {
      this.erreurType = 'erreur-horszone';
      this.erreurIcon = 'bi-x-circle-fill';
      this.erreurTitre = 'POINTAGE REFUSE';
      this.erreurMessage = 'Vous ne pouvez pas pointer car vous n\'etes pas au bureau. '
        + 'Le systeme a detecte que vous etes trop loin de votre lieu de travail'
        + (e.distanceMetres ? ` (${e.distanceMetres} m)` : '') + '.';
      this.erreurEtapes = [
        'Rendez-vous physiquement a votre bureau',
        'Une fois sur place, appuyez sur "Reessayer le pointage"',
        'Assurez-vous que votre GPS est active et precis'
      ];
      return;
    }

    // ── CAS 2 : Localisation non disponible / refusée ──
    if (e.positionRequise === true || geoErreur) {
      this.erreurType = 'erreur-geo';
      this.erreurIcon = 'bi-geo-alt-fill';
      this.erreurTitre = 'POSITION GPS INTROUVABLE';

      switch (geoErreur) {
        case 'denied':
          this.erreurMessage = 'Vous avez bloque l\'acces a votre position. '
            + 'Le pointage necessite votre localisation pour verifier que vous etes bien au bureau.';
          this.erreurEtapes = [
            'Sur mobile : allez dans Parametres > Applications > Navigateur > Autorisations > Position > Autoriser',
            'Sur ordinateur : cliquez sur l\'icone cadenas dans la barre d\'adresse, puis autorisez la localisation',
            'Rechargez la page et reessayez'
          ];
          break;
        case 'timeout':
          this.erreurMessage = 'Le GPS n\'a pas repondu a temps. Le signal est peut-etre trop faible a votre emplacement actuel.';
          this.erreurEtapes = [
            'Placez-vous pres d\'une fenetre ou a l\'exterieur pour un meilleur signal GPS',
            'Verifiez que le GPS est bien active sur votre appareil',
            'Appuyez sur "Reessayer le pointage"'
          ];
          break;
        case 'unsupported':
          this.erreurMessage = 'Votre appareil ou navigateur ne supporte pas la geolocalisation. Utilisez un autre navigateur ou appareil.';
          this.erreurEtapes = [
            'Utilisez Google Chrome, Firefox ou Safari a jour',
            'Essayez depuis votre telephone portable',
            'Contactez votre superviseur si le probleme persiste'
          ];
          break;
        default:
          this.erreurMessage = e.message || 'Impossible de determiner votre position. Activez le GPS et autorisez la localisation pour ce site.';
          this.erreurEtapes = [
            'Activez le GPS / les services de localisation sur votre appareil',
            'Autorisez la localisation pour ce site dans votre navigateur',
            'Appuyez sur "Reessayer le pointage"'
          ];
          break;
      }
      return;
    }

    // ── CAS 3 : Autre erreur (réseau, déjà pointé, etc.) ──
    this.erreurType = 'erreur-autre';
    this.erreurIcon = 'bi-exclamation-triangle-fill';
    this.erreurTitre = 'ERREUR DE POINTAGE';
    this.erreurMessage = e.message || 'Une erreur inattendue est survenue. Verifiez votre connexion internet et reessayez.';
    this.erreurEtapes = [
      'Verifiez que vous avez une connexion internet',
      'Appuyez sur "Reessayer le pointage"',
      'Si le probleme persiste, contactez votre superviseur'
    ];
  }
}
