import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointageService } from '../../core/services/pointage.service';
import { AuthService } from '../../core/services/auth.service';
import { PointageStatutJour, PointageLigne } from '../../core/models/pointage.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-clock-history text-csu-primary"></i>
            Pointage de présence
          </h1>
          <p class="csu-page-subtitle">Enregistrez votre arrivée et votre départ</p>
        </div>
      </div>

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
              <div class="table-responsive">
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
            } @else {
              <div class="csu-empty-state"><i class="bi bi-clock-history"></i><h3>Aucun pointage</h3><p>Vos pointages apparaîtront ici.</p></div>
            }
          </div>
        </div>
      </div>
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
    .tag { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: rgba(0,0,0,0.06); color: #6B7280; }
    .tag.en-service { background: rgba(2,136,209,0.12); color: #0277BD; }
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

  ngOnInit(): void {
    this.timer = setInterval(() => (this.now = new Date()), 1000);
    this.loadStatut();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
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
        this.loadStatut(); this.loadHistory();
      },
      error: (err) => {
        this.busy = false;
        Swal.fire({ icon: 'warning', title: 'Impossible', text: err?.error?.message || 'Erreur lors du pointage.' });
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
        this.loadStatut(); this.loadHistory();
      },
      error: (err) => {
        this.busy = false;
        Swal.fire({ icon: 'warning', title: 'Impossible', text: err?.error?.message || 'Erreur lors du pointage.' });
      }
    });
  }
}
