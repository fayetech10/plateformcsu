import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActivityNotificationsService } from '../../../core/services/activity-notifications.service';
import { ActivityEvent, ActivityType, ACTIVITY_META } from '../../../core/models/activity-event.model';

/**
 * Flux d'activité compact en temps réel, destiné au tableau de bord.
 * S'appuie sur le service de notifications (alimenté par SSE) — aucune logique
 * de connexion propre.
 */
@Component({
  selector: 'app-live-activity-feed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="panel-head">
      <h3>
        <i class="bi bi-activity"></i> Activité en direct
        <span class="live-pill" [class.off]="!connected"><span class="live-dot"></span>{{ connected ? 'live' : 'différé' }}</span>
      </h3>
      <a routerLink="/admin/activite" class="link">Tout voir</a>
    </div>

    @if (events.length === 0) {
      <div class="csu-empty-state py-4">
        <i class="bi bi-broadcast" style="font-size:2.2rem;opacity:0.3;"></i>
        <h3>En attente d'activité</h3>
        <p>Les actions des agents s'afficheront ici en temps réel.</p>
      </div>
    } @else {
      <div class="lf">
        @for (e of events; track e.id) {
          <div class="lf-item" [class.is-new]="isUnread(e)" [routerLink]="e.link">
            <div class="lf-ic" [ngClass]="'tone-' + e.tone"><i class="bi" [ngClass]="icon(e.type)"></i></div>
            <div class="lf-tx">
              <div class="lf-title">{{ e.title }}</div>
              <div class="lf-desc">{{ e.description }}</div>
              <div class="lf-meta">
                @if (e.agentNom) { <span><i class="bi bi-person"></i> {{ e.agentNom }}</span> }
                <span>{{ relative(e.timestamp) }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; }
    .panel-head h3 { display: flex; align-items: center; gap: 9px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.05rem; margin: 0; }
    .panel-head h3 > i { color: var(--csu-primary); }
    .panel-head .link { font-size: 0.82rem; font-weight: 700; color: var(--csu-primary); text-decoration: none; }
    .live-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 0.62rem; font-weight: 800; color: #2E7D32; background: rgba(67,160,71,0.12); padding: 2px 8px; border-radius: 12px; text-transform: uppercase; }
    .live-pill.off { color: #E65100; background: rgba(245,124,0,0.12); }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: blink 1.4s infinite; }
    @keyframes blink { 50% { opacity: 0.3; } }

    .lf { display: flex; flex-direction: column; max-height: 420px; overflow-y: auto; }
    .lf-item { display: flex; gap: 11px; padding: 0.65rem 0.4rem; border-radius: 10px; cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.04); transition: background 0.15s ease; }
    .lf-item:last-child { border-bottom: none; }
    .lf-item:hover { background: var(--csu-bg, #f6f8fa); }
    .lf-item.is-new { animation: flash-new 2.4s ease; }
    @keyframes flash-new { 0% { background: rgba(0,135,90,0.12); } 100% { background: transparent; } }
    .lf-ic { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; font-size: 1.02rem; color: #fff; flex-shrink: 0; }
    .tone-blue { background: linear-gradient(135deg,#1565C0,#42A5F5); }
    .tone-green { background: linear-gradient(135deg,#00875A,#00C67B); }
    .tone-purple { background: linear-gradient(135deg,#7B1FA2,#AB47BC); }
    .tone-orange { background: linear-gradient(135deg,#F57C00,#FFB74D); }
    .tone-teal { background: linear-gradient(135deg,#00838F,#26C6DA); }
    .tone-slate { background: linear-gradient(135deg,#546E7A,#90A4AE); }
    .tone-red { background: linear-gradient(135deg,#E53935,#EF5350); }
    .lf-tx { flex: 1; min-width: 0; }
    .lf-title { font-weight: 700; font-size: 0.85rem; }
    .lf-desc { font-size: 0.78rem; color: var(--csu-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lf-meta { display: flex; gap: 12px; margin-top: 2px; font-size: 0.7rem; color: var(--csu-text-muted); }
    .lf-meta i { font-size: 0.66rem; }
  `]
})
export class LiveActivityFeedComponent implements OnInit, OnDestroy {
  private notif = inject(ActivityNotificationsService);
  private router = inject(Router);

  events: ActivityEvent[] = [];
  connected = false;
  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.notif.start();
    this.subs.push(this.notif.recent$.subscribe(r => (this.events = r.slice(0, 12))));
    this.subs.push(this.notif.connected$.subscribe(c => (this.connected = c)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.notif.release();
  }

  isUnread(e: ActivityEvent): boolean { return this.notif.isUnread(e); }
  icon(t: ActivityType): string { return ACTIVITY_META[t]?.icon || 'bi-dot'; }

  relative(ts: string | null): string {
    if (!ts) return '';
    const d = new Date(ts).getTime();
    if (isNaN(d)) return '';
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return 'hier';
    return `il y a ${Math.floor(diff / 86400)} j`;
  }
}
