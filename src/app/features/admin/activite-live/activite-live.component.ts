import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ActivityFeedService } from '../../../core/services/activity-feed.service';
import { ActivityStreamService } from '../../../core/services/activity-stream.service';
import { ActivityNotificationsService } from '../../../core/services/activity-notifications.service';
import { ActivityEvent, ActivityType, ACTIVITY_META, ACTIVITY_TYPES } from '../../../core/models/activity-event.model';

@Component({
  selector: 'app-activite-live',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-activity text-csu-primary"></i>
            Activité en temps réel
          </h1>
          <p class="csu-page-subtitle">Suivez en direct les actions des agents — flux poussé par le serveur (SSE)</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="live-pill" [class.paused]="!autoRefresh" [class.deferred]="autoRefresh && !connected">
            <span class="live-dot"></span>{{ statusLabel }}
          </span>
          <button class="csu-btn csu-btn-light btn-sm" (click)="toggleAuto()">
            <i class="bi" [ngClass]="autoRefresh ? 'bi-pause-fill' : 'bi-play-fill'"></i>
            {{ autoRefresh ? 'Pause' : 'Reprendre' }}
          </button>
          <button class="csu-btn csu-btn-light btn-sm" (click)="refresh()" [disabled]="loading">
            <i class="bi bi-arrow-clockwise" [class.spin]="loading"></i>
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filter-chips">
        <button class="chip" [class.active]="filtre === ''" (click)="setFiltre('')">
          <i class="bi bi-grid"></i> Tout
        </button>
        @for (t of types; track t) {
          <button class="chip" [class.active]="filtre === t" (click)="setFiltre(t)">
            <i class="bi" [ngClass]="meta(t).icon"></i> {{ meta(t).label }}
          </button>
        }
      </div>

      <!-- Timeline -->
      <div class="csu-card">
        @if (loading && events.length === 0) {
          <div class="csu-loading"><div class="csu-spinner"></div></div>
        } @else if (events.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-inbox"></i>
            <h3>Aucune activité</h3>
            <p>Aucune action récente {{ filtre ? 'de ce type' : '' }} pour le moment.</p>
          </div>
        } @else {
          <div class="timeline">
            @for (e of events; track e.id) {
              <div class="tl-item" [class.is-new]="isNew(e)">
                <div class="tl-ic" [ngClass]="'tone-' + e.tone"><i class="bi" [ngClass]="icon(e.type)"></i></div>
                <div class="tl-body" [routerLink]="e.link">
                  <div class="tl-top">
                    <span class="tl-title">{{ e.title }}</span>
                    <span class="tl-type">{{ meta(e.type).label }}</span>
                    @if (isNew(e)) { <span class="tl-new">nouveau</span> }
                  </div>
                  <div class="tl-desc">{{ e.description }}</div>
                  <div class="tl-meta">
                    @if (e.agentNom) { <span><i class="bi bi-person-circle"></i> {{ e.agentNom }}</span> }
                    <span [title]="absolute(e.timestamp)"><i class="bi bi-clock"></i> {{ relative(e.timestamp) }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .live-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 0.74rem; font-weight: 700; color: #2E7D32;
      background: rgba(67,160,71,0.12); padding: 5px 11px; border-radius: 20px; }
    .live-pill.deferred { color: #E65100; background: rgba(245,124,0,0.12); }
    .live-pill.paused { color: #6B7280; background: rgba(0,0,0,0.06); }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: blink 1.4s infinite; }
    .live-pill.paused .live-dot { animation: none; }
    @keyframes blink { 50% { opacity: 0.3; } }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; }
    .spin { display: inline-block; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .filter-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.1rem; }
    .chip { display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid var(--csu-border-light, rgba(0,0,0,0.1));
      color: var(--csu-text-muted); font-size: 0.8rem; font-weight: 600; padding: 6px 13px; border-radius: 20px; cursor: pointer; transition: all 0.15s ease; }
    .chip:hover { border-color: var(--csu-primary); color: var(--csu-primary); }
    .chip.active { background: var(--csu-primary); border-color: var(--csu-primary); color: #fff; }

    .timeline { display: flex; flex-direction: column; }
    .tl-item { display: flex; gap: 14px; padding: 0.9rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); position: relative; }
    .tl-item:last-child { border-bottom: none; }
    .tl-item.is-new { animation: flash-new 2s ease; }
    @keyframes flash-new { 0% { background: rgba(0,135,90,0.12); } 100% { background: transparent; } }
    .tl-ic { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; font-size: 1.15rem; color: #fff; flex-shrink: 0; }
    .tone-blue { background: linear-gradient(135deg,#1565C0,#42A5F5); }
    .tone-green { background: linear-gradient(135deg,#00875A,#00C67B); }
    .tone-purple { background: linear-gradient(135deg,#7B1FA2,#AB47BC); }
    .tone-orange { background: linear-gradient(135deg,#F57C00,#FFB74D); }
    .tone-teal { background: linear-gradient(135deg,#00838F,#26C6DA); }
    .tone-slate { background: linear-gradient(135deg,#546E7A,#90A4AE); }
    .tone-red { background: linear-gradient(135deg,#E53935,#EF5350); }
    .tl-body { flex: 1; min-width: 0; cursor: pointer; }
    .tl-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .tl-title { font-weight: 700; font-size: 0.92rem; }
    .tl-type { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: rgba(0,0,0,0.05); color: var(--csu-text-muted); }
    .tl-new { font-size: 0.66rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; background: rgba(0,135,90,0.14); color: #2E7D32; text-transform: uppercase; }
    .tl-desc { font-size: 0.85rem; color: var(--csu-text-secondary, #4b5563); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tl-meta { display: flex; gap: 14px; margin-top: 5px; font-size: 0.74rem; color: var(--csu-text-muted); }
    .tl-meta i { font-size: 0.72rem; }
  `]
})
export class ActiviteLiveComponent implements OnInit, OnDestroy {
  private activityFeed = inject(ActivityFeedService);
  private stream = inject(ActivityStreamService);
  private notif = inject(ActivityNotificationsService);

  events: ActivityEvent[] = [];
  loading = true;
  autoRefresh = true;
  connected = false;
  filtre: ActivityType | '' = '';
  types = ACTIVITY_TYPES;

  private knownIds = new Set<string>();
  private newIds = new Set<string>();
  private firstLoad = true;

  private subs: Subscription[] = [];
  private pollSub?: Subscription;
  private readonly POLL_MS = 15000;

  get statusLabel(): string {
    if (!this.autoRefresh) return 'En pause';
    return this.connected ? 'En direct' : 'Différé';
  }

  meta(t: ActivityType) { return ACTIVITY_META[t]; }
  icon(t: ActivityType): string { return ACTIVITY_META[t]?.icon || 'bi-dot'; }

  ngOnInit(): void {
    // Démarre/maintient le flux SSE partagé (ref-compté via le service de notifications)
    this.notif.start();
    this.subs.push(this.stream.connected$.subscribe(c => (this.connected = c)));
    this.subs.push(this.stream.events$.subscribe(e => this.onLiveEvent(e)));
    this.subs.push(this.stream.fallbackPolling$.subscribe(fb => this.onFallback(fb)));
    this.loadOnce();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.stopPolling();
    this.notif.release();
  }

  private onFallback(fallback: boolean): void {
    if (fallback && this.autoRefresh) this.startPolling();
    else this.stopPolling();
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = timer(this.POLL_MS, this.POLL_MS).subscribe(() => this.loadOnce(true));
  }
  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  /** Événement poussé en temps réel. */
  private onLiveEvent(e: ActivityEvent): void {
    if (!this.autoRefresh) return;
    if (this.filtre && e.type !== this.filtre) return;
    if (this.events.some(x => x.id === e.id)) return;
    this.events = [e, ...this.events].slice(0, 80);
    this.knownIds.add(e.id);
    this.newIds = new Set(this.newIds).add(e.id);
    setTimeout(() => {
      const s = new Set(this.newIds); s.delete(e.id); this.newIds = s;
    }, 2200);
  }

  private loadOnce(silent = false): void {
    this.loading = true;
    this.activityFeed.getFeed(50, this.filtre || undefined, silent).subscribe({
      next: (list) => this.applyFeed(list),
      error: () => (this.loading = false)
    });
  }

  private applyFeed(list: ActivityEvent[]): void {
    if (!this.firstLoad) {
      this.newIds = new Set(list.filter(e => !this.knownIds.has(e.id)).map(e => e.id));
    }
    this.events = list;
    this.knownIds = new Set(list.map(e => e.id));
    this.firstLoad = false;
    this.loading = false;
    if (this.newIds.size > 0) {
      setTimeout(() => (this.newIds = new Set()), 2200);
    }
  }

  isNew(e: ActivityEvent): boolean { return this.newIds.has(e.id); }

  setFiltre(t: ActivityType | ''): void {
    this.filtre = t;
    this.firstLoad = true;
    this.events = [];
    this.loadOnce();
  }

  toggleAuto(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.loadOnce();
      if (this.stream.fallbackPolling$.value) this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  refresh(): void { this.loadOnce(); }

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

  absolute(ts: string | null): string {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('fr-FR');
  }
}
