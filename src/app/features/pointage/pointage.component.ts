import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointageService } from '../../core/services/pointage.service';
import { AuthService } from '../../core/services/auth.service';
import { PointageStatutJour, PointageLigne, PointagesJour, GeoErreur, PointageArriveeResponse } from '../../core/models/pointage.model';
import { CardListItemComponent } from '../../shared/ui';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule, FormsModule, CardListItemComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-clock-history text-csu-primary"></i>
            Pointage de présence
          </h1>
          <p class="csu-page-subtitle">{{ isAgent ? 'Enregistrez votre arrivée et votre départ' : 'Liste des pointages et activité du jour' }}</p>
        </div>
      </div>

      <!-- Vue ADMIN / SUPERVISEUR : liste des pointages + activité du jour (pas de badgeage) -->
      @if (!isAgent) {
        <div class="csu-card">
          <div class="csu-card-header">
            <h3 class="csu-card-title"><i class="bi bi-people-fill text-csu-primary"></i> Activité du jour</h3>
            <input type="date" class="form-control form-control-sm date-input" [(ngModel)]="selectedDate" (change)="loadPresence()" [max]="maxDate">
          </div>

          @if (presence) {
            <div class="presence-summary mb-3">
              <div class="pres-item"><span class="num">{{ presence.presents }}<span class="den">/{{ presence.totalAgents }}</span></span><span class="lbl">Présents</span></div>
              <div class="pres-item ok"><span class="num">{{ presence.enService }}</span><span class="lbl">En service</span></div>
              <div class="pres-item info"><span class="num">{{ presence.partis }}</span><span class="lbl">Partis</span></div>
              <div class="pres-item off"><span class="num">{{ presence.absents }}</span><span class="lbl">Absents</span></div>
              @if (nbHorsZone > 0) {
                <div class="pres-item alert"><span class="num">{{ nbHorsZone }}</span><span class="lbl">Hors zone</span></div>
              }
            </div>

            @if (presence.pointages.length > 0) {
              <div class="table-responsive d-none d-lg-block">
                <table class="csu-table">
                  <thead><tr><th>Agent</th><th class="text-center">Arrivée</th><th class="text-center">Départ</th><th class="text-center">Statut</th><th class="text-center">Localisation</th></tr></thead>
                  <tbody>
                    @for (p of presence.pointages; track p.id) {
                      <tr [class.row-hors-zone]="p.horsZone === true">
                        <td class="fw-semibold">{{ p.agentNom }}</td>
                        <td class="text-center"><i class="bi bi-box-arrow-in-right text-success"></i> {{ p.heureArrivee || '—' }}</td>
                        <td class="text-center">
                          @if (p.heureDepart) { <i class="bi bi-box-arrow-right text-warning"></i> {{ p.heureDepart }} }
                          @else { <span class="text-muted">—</span> }
                        </td>
                        <td class="text-center"><span class="tag" [class.en-service]="p.statut === 'EN_SERVICE'">{{ p.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}</span></td>
                        <td class="text-center">
                          @if (p.horsZone === true) {
                            <span class="geo-badge ko" [title]="'Distance au bureau : ' + p.distanceMetres + ' m'"><i class="bi bi-geo-alt-fill"></i> Hors zone ({{ p.distanceMetres }} m)</span>
                          } @else if (p.positionVerifiee === false) {
                            <span class="geo-badge unknown"><i class="bi bi-question-circle"></i> Non vérifiée</span>
                          } @else if (p.horsZone === false) {
                            <span class="geo-badge ok"><i class="bi bi-check-circle"></i> Sur site</span>
                          } @else { <span class="text-muted">—</span> }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Cartes résumé (mobile/tablette) -->
              <div class="csu-list d-lg-none mb-0">
                @for (p of presence.pointages; track p.id) {
                  <csu-list-card>
                    <div class="csu-list-card-head">
                      <div class="csu-list-card-lead"><i class="bi bi-person"></i></div>
                      <div class="csu-list-card-body">
                        <div class="csu-list-card-title">{{ p.agentNom }}</div>
                        <div class="csu-list-card-sub">
                          <i class="bi bi-box-arrow-in-right text-success"></i> {{ p.heureArrivee || '—' }}
                          · <i class="bi bi-box-arrow-right text-warning"></i> {{ p.heureDepart || '—' }}
                        </div>
                      </div>
                      <span class="tag" [class.en-service]="p.statut === 'EN_SERVICE'">{{ p.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}</span>
                    </div>
                    <div class="csu-list-card-meta">
                      @if (p.horsZone === true) {
                        <span class="geo-badge ko"><i class="bi bi-geo-alt-fill"></i> Hors zone ({{ p.distanceMetres }} m)</span>
                      } @else if (p.positionVerifiee === false) {
                        <span class="geo-badge unknown"><i class="bi bi-question-circle"></i> Position non vérifiée</span>
                      } @else if (p.horsZone === false) {
                        <span class="geo-badge ok"><i class="bi bi-check-circle"></i> Sur site</span>
                      }
                    </div>
                  </csu-list-card>
                }
              </div>
            } @else {
              <div class="csu-empty-state"><i class="bi bi-person-x"></i><h3>Aucun pointage</h3><p>Aucun agent ne s'est pointé pour cette date.</p></div>
            }
          } @else {
            <div class="text-muted small"><i class="bi bi-hourglass-split"></i> Chargement…</div>
          }
        </div>
      } @else {

      <div class="row g-4">
        <!-- Carte de pointage -->
        <div class="col-12 col-lg-5">
          <div class="csu-card text-center punch-card">
            <div class="live-clock">{{ now | date:'HH:mm:ss' }}</div>
            <div class="live-date">{{ now | date:'EEEE d MMMM y' }}</div>

            <div class="punch-status mt-4">
              <div class="punch-line" [class.done]="statut?.aPointeArrivee">
                <span class="punch-ico"><i class="bi" [ngClass]="statut?.aPointeArrivee ? 'bi-check-circle-fill' : 'bi-circle'"></i></span>
                <span class="punch-label">Arrivée</span>
                <span class="punch-time">{{ statut?.heureArrivee || '—' }}</span>
              </div>
              <div class="punch-line" [class.done]="statut?.aPointeDepart">
                <span class="punch-ico"><i class="bi" [ngClass]="statut?.aPointeDepart ? 'bi-check-circle-fill' : 'bi-circle'"></i></span>
                <span class="punch-label">Départ</span>
                <span class="punch-time">{{ statut?.heureDepart || '—' }}</span>
              </div>
            </div>

            <div class="d-grid gap-2 mt-4">
              @if (!statut?.aPointeArrivee) {
                <button class="csu-btn csu-btn-primary btn-lg" (click)="pointerArrivee()" [disabled]="busy">
                  <i class="bi bi-box-arrow-in-right"></i> Pointer mon arrivée
                </button>
              } @else if (!statut?.aPointeDepart) {
                <button class="csu-btn btn-depart btn-lg" (click)="pointerDepart()" [disabled]="busy">
                  <i class="bi bi-box-arrow-right"></i> Pointer mon départ
                </button>
              } @else {
                <div class="all-done">
                  <i class="bi bi-check2-all"></i>
                  Présence complète pour aujourd'hui. Bonne journée !
                </div>
              }
            </div>

            @if (!statut?.aPointeDepart) {
              <div class="geo-hint mt-3">
                <i class="bi bi-geo-alt-fill"></i>
                <span>Le pointage nécessite votre <b>localisation</b> et doit être effectué <b>depuis votre bureau</b>. Activez le GPS avant de pointer.</span>
              </div>
            }
          </div>
        </div>

        <!-- Historique -->
        <div class="col-12 col-lg-7">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title"><i class="bi bi-calendar3 text-csu-secondary"></i> Mon historique</h3>
            </div>
            @if (loadingHistory) {
              <div class="csu-loading"><div class="csu-spinner"></div></div>
            } @else if (history.length > 0) {
              <div class="table-responsive d-none d-lg-block">
                <table class="csu-table">
                  <thead><tr><th>Date</th><th>Arrivée</th><th>Départ</th><th class="text-center">Statut</th></tr></thead>
                  <tbody>
                    @for (h of history; track h.id) {
                      <tr>
                        <td class="fw-semibold">{{ h.date | date:'dd/MM/yyyy' }}</td>
                        <td>{{ h.heureArrivee || '—' }}</td>
                        <td>{{ h.heureDepart || '—' }}</td>
                        <td class="text-center">
                          <span class="tag" [class.en-service]="h.statut === 'EN_SERVICE'">
                            {{ h.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Cartes résumé (mobile/tablette) -->
              <div class="csu-list d-lg-none mb-0">
                @for (h of history; track h.id) {
                  <csu-list-card>
                    <div class="csu-list-card-head">
                      <div class="csu-list-card-body">
                        <div class="csu-list-card-title">{{ h.date | date:'EEE d MMM y' }}</div>
                        <div class="csu-list-card-sub">
                          <i class="bi bi-box-arrow-in-right text-success"></i> {{ h.heureArrivee || '—' }}
                          · <i class="bi bi-box-arrow-right text-warning"></i> {{ h.heureDepart || '—' }}
                        </div>
                      </div>
                      <span class="tag" [class.en-service]="h.statut === 'EN_SERVICE'">
                        {{ h.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}
                      </span>
                    </div>
                  </csu-list-card>
                }
              </div>
            } @else {
              <div class="csu-empty-state"><i class="bi bi-clock-history"></i><h3>Aucun pointage</h3><p>Vos pointages apparaîtront ici.</p></div>
            }
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .punch-card { padding: 2rem 1.5rem; }
    .live-clock { font-family: 'Outfit', sans-serif; font-size: 3.2rem; font-weight: 800; letter-spacing: -0.02em; color: var(--csu-primary); line-height: 1; }
    .live-date { text-transform: capitalize; color: var(--csu-text-muted); font-weight: 600; margin-top: 6px; }
    .punch-status { display: flex; flex-direction: column; gap: 10px; }
    .punch-line { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; background: var(--csu-bg); border: 1px solid var(--csu-border-light); }
    .punch-line.done { background: rgba(0,135,90,0.06); border-color: rgba(0,135,90,0.2); }
    .punch-ico { font-size: 1.3rem; color: var(--csu-text-muted); }
    .punch-line.done .punch-ico { color: #00875A; }
    .punch-label { flex-grow: 1; text-align: left; font-weight: 600; }
    .punch-time { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; }
    .btn-lg { padding: 0.85rem 1rem; font-size: 1rem; }
    .btn-depart { background: #F57C00; color: #fff; border: none; }
    .btn-depart:hover { background: #E65100; }
    .all-done { padding: 1rem; border-radius: 12px; background: rgba(0,135,90,0.08); color: #2E7D32; font-weight: 600; }
    .all-done i { font-size: 1.4rem; display: block; margin-bottom: 4px; }
    .geo-hint { display: flex; align-items: flex-start; gap: 8px; text-align: left; padding: 10px 12px; border-radius: 10px; background: rgba(2,136,209,0.07); border: 1px solid rgba(2,136,209,0.2); color: #0277BD; font-size: 0.8rem; line-height: 1.35; }
    .geo-hint i { font-size: 0.95rem; margin-top: 1px; }
    .tag { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: rgba(0,0,0,0.06); color: #6B7280; }
    .tag.en-service { background: rgba(2,136,209,0.12); color: #0277BD; }

    /* Vue admin : activité du jour */
    .date-input { width: auto; }
    .presence-summary { display: flex; flex-wrap: wrap; gap: 1rem; }
    .pres-item { flex: 1; min-width: 110px; background: var(--csu-bg); border: 1px solid var(--csu-border-light); border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 2px; }
    .pres-item .num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; line-height: 1; }
    .pres-item .num .den { font-size: 0.9rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item .lbl { font-size: 0.78rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item.ok { background: rgba(2,136,209,0.06); border-color: rgba(2,136,209,0.2); }
    .pres-item.ok .num { color: #0277BD; }
    .pres-item.info { background: rgba(245,124,0,0.06); border-color: rgba(245,124,0,0.2); }
    .pres-item.info .num { color: #E65100; }
    .pres-item.off { background: rgba(0,0,0,0.03); }
    .pres-item.off .num { color: #6B7280; }
    .pres-item.alert { background: rgba(229,57,53,0.07); border-color: rgba(229,57,53,0.3); }
    .pres-item.alert .num { color: #C62828; }
    .geo-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
    .geo-badge.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .geo-badge.ko { background: rgba(229,57,53,0.12); color: #C62828; }
    .geo-badge.unknown { background: rgba(0,0,0,0.06); color: #6B7280; }
    .row-hors-zone { background: rgba(229,57,53,0.04); }
  `]
})
export class PointageComponent implements OnInit, OnDestroy {
  private pointageService = inject(PointageService);
  private authService = inject(AuthService);

  now = new Date();
  statut?: PointageStatutJour;
  history: PointageLigne[] = [];
  busy = false;
  loadingHistory = true;
  private timer?: any;

  // Vue admin / superviseur : liste des pointages du jour
  presence?: PointagesJour;
  selectedDate = new Date().toISOString().substring(0, 10);
  maxDate = new Date().toISOString().substring(0, 10);

  get isAgent(): boolean {
    return this.authService.isAgent();
  }

  get nbHorsZone(): number {
    return (this.presence?.pointages || []).filter(p => p.horsZone === true).length;
  }

  ngOnInit(): void {
    if (this.isAgent) {
      // Agent : système de badgeage (arrivée / départ)
      this.timer = setInterval(() => (this.now = new Date()), 1000);
      this.loadStatut();
      this.loadHistory();
    } else {
      // Admin / superviseur : liste des pointages et activité du jour
      this.loadPresence();
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  loadPresence(): void {
    this.pointageService.getPointagesJour(this.selectedDate).subscribe({
      next: (p) => (this.presence = p),
      error: (err) => console.error('Erreur chargement présence:', err)
    });
  }

  private loadStatut(): void {
    this.pointageService.getMyToday().subscribe({
      next: (s) => (this.statut = s),
      error: () => (this.statut = { date: '', aPointeArrivee: false, aPointeDepart: false, heureArrivee: null, heureDepart: null })
    });
  }

  private loadHistory(): void {
    this.loadingHistory = true;
    this.pointageService.getMyHistory().subscribe({
      next: (h) => { this.history = h; this.loadingHistory = false; },
      error: () => { this.history = []; this.loadingHistory = false; }
    });
  }

  /** Instructions d'activation de la localisation (mobile + ordinateur). */
  private readonly aideActiverLocalisation =
    "Sur mobile : activez le GPS, puis autorisez la localisation pour ce site. " +
    "Sur ordinateur : cliquez sur l'icône 🔒 dans la barre d'adresse → Localisation → Autoriser, puis réessayez.";

  async pointerArrivee(): Promise<void> {
    this.busy = true;
    const pos = await this.pointageService.obtenirPositionDetaillee();
    this.pointageService.pointerArrivee(pos.coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        // Mise à jour immédiate du statut local pour passer à « Pointer mon départ » sans recharger
        this.statut = {
          date: this.statut?.date || new Date().toISOString().substring(0, 10),
          aPointeArrivee: true,
          aPointeDepart: false,
          heureArrivee: res.heureArrivee,
          heureDepart: null
        };
        this.afficherSucces(res, res.heureArrivee, 'Arrivée');
        this.loadStatut(); this.loadHistory();
      },
      error: (err) => {
        this.busy = false;
        this.afficherRefus(err, pos.erreur);
      }
    });
  }

  async pointerDepart(): Promise<void> {
    this.busy = true;
    const pos = await this.pointageService.obtenirPositionDetaillee();
    this.pointageService.pointerDepart(pos.coords || undefined).subscribe({
      next: (res) => {
        this.busy = false;
        // Mise à jour immédiate du statut local pour afficher « Présence complète » sans recharger
        this.statut = {
          date: this.statut?.date || new Date().toISOString().substring(0, 10),
          aPointeArrivee: true,
          aPointeDepart: true,
          heureArrivee: this.statut?.heureArrivee || null,
          heureDepart: res.heureDepart
        };
        this.afficherSucces(res, res.heureDepart, 'Départ');
        this.loadStatut(); this.loadHistory();
      },
      error: (err) => {
        this.busy = false;
        this.afficherRefus(err, pos.erreur);
      }
    });
  }

  /** Affiche la confirmation de pointage (succès ou succès sans contrôle de zone). */
  private afficherSucces(res: PointageArriveeResponse, heure: string, libelle: string): void {
    if (res.positionVerifiee === false) {
      Swal.fire({
        icon: 'info',
        title: `${libelle} enregistré(e)`,
        text: `Heure : ${heure} — position non vérifiée (contrôle de zone non configuré pour votre bureau).`,
        timer: 2800, showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: `${libelle} enregistré(e)`,
        html: `Heure : <b>${heure}</b>` + (res.distanceMetres != null ? `<br><small class="text-muted">À ${res.distanceMetres} m du bureau ✓</small>` : ''),
        timer: 2200, showConfirmButton: false
      });
    }
  }

  /** Affiche un message de refus clair selon la cause (hors zone, localisation requise…). */
  private afficherRefus(err: any, geoErreur: GeoErreur | null): void {
    const e = err?.error || {};

    // Localisation indisponible / refusée → le bureau exige une présence vérifiée
    if (e.positionRequise === true) {
      const cause = this.messageGeoErreur(geoErreur);
      Swal.fire({
        icon: 'warning',
        title: 'Localisation requise',
        html: `${e.message || "Activez la localisation pour pouvoir pointer."}` +
              (cause ? `<br><br><b>${cause}</b>` : '') +
              `<br><br><small class="text-muted">${this.aideActiverLocalisation}</small>`,
        confirmButtonText: 'Réessayer'
      });
      return;
    }

    // Agent hors de la zone autorisée
    if (e.horsZone === true) {
      Swal.fire({
        icon: 'error',
        title: "Vous n'êtes pas sur le lieu de travail",
        html: `${e.message || 'Vous êtes trop loin du bureau pour pointer.'}` +
              `<br><br><small class="text-muted">Le pointage n'est possible que depuis votre bureau.</small>`,
        confirmButtonText: 'Compris'
      });
      return;
    }

    // Autres erreurs (déjà pointé, réseau, etc.)
    Swal.fire({
      icon: 'error',
      title: 'Pointage impossible',
      text: e.message || 'Une erreur est survenue lors du pointage. Vérifiez votre connexion et réessayez.'
    });
  }

  /** Traduit la cause d'échec GPS en message lisible. */
  private messageGeoErreur(e: GeoErreur | null): string {
    switch (e) {
      case 'denied':      return "Vous avez refusé l'accès à votre position.";
      case 'unavailable': return 'Votre position est momentanément indisponible.';
      case 'timeout':     return "Le délai d'obtention de votre position a expiré (signal GPS faible).";
      case 'unsupported': return "La géolocalisation n'est pas disponible sur cet appareil.";
      default:            return '';
    }
  }
}
