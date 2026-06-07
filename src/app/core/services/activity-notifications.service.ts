import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { ActivityFeedService } from './activity-feed.service';
import { ActivityStreamService } from './activity-stream.service';
import { PermissionService } from './permission.service';
import { ActivityEvent } from '../models/activity-event.model';

/**
 * Centralise les notifications d'activité de l'administration :
 *  - flux d'activité récent des agents, alimenté en temps réel par SSE
 *    (avec repli automatique sur polling si le SSE est indisponible) ;
 *  - nombre d'événements non lus (depuis la dernière consultation) ;
 *  - demandes de permission en attente.
 * Persiste la date de dernière lecture pour calculer les non-lus entre sessions.
 */
@Injectable({ providedIn: 'root' })
export class ActivityNotificationsService {
  private activityFeed = inject(ActivityFeedService);
  private stream = inject(ActivityStreamService);
  private permissionService = inject(PermissionService);
  private platformId = inject(PLATFORM_ID);

  private readonly LAST_SEEN_KEY = 'csu_notif_last_seen';
  private readonly POLL_MS = 20000;
  private readonly PERM_POLL_MS = 60000;

  readonly recent$ = new BehaviorSubject<ActivityEvent[]>([]);
  readonly unreadCount$ = new BehaviorSubject<number>(0);
  readonly pendingPermissions$ = new BehaviorSubject<number>(0);
  /** Statut de la connexion temps réel (pour l'indicateur « en direct »). */
  readonly connected$ = this.stream.connected$;

  private consumers = 0;
  private subs: Subscription[] = [];
  private pollSub?: Subscription;

  get totalBadge(): number {
    return this.unreadCount$.value + this.pendingPermissions$.value;
  }

  private get lastSeen(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.LAST_SEEN_KEY);
  }
  private set lastSeen(v: string | null) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (v) localStorage.setItem(this.LAST_SEEN_KEY, v);
  }

  /** Démarre le service (ref-compté : démarre au 1er consommateur). */
  start(): void {
    this.consumers++;
    if (this.consumers > 1 || !isPlatformBrowser(this.platformId)) return;

    // Chargement initial du flux (snapshot)
    this.activityFeed.getFeed(20, undefined, true).subscribe({
      next: (events) => this.onSnapshot(events),
      error: () => {}
    });

    // Temps réel : SSE
    this.stream.start();
    this.subs.push(this.stream.events$.subscribe(e => this.onNewEvent(e)));

    // Repli polling si le SSE est indisponible
    this.subs.push(this.stream.fallbackPolling$.subscribe(fallback => {
      if (fallback) this.startPolling(); else this.stopPolling();
    }));

    // Demandes de permission (hors flux d'activité) : poll léger
    this.subs.push(
      timer(0, this.PERM_POLL_MS).subscribe(() => this.refreshPermissions())
    );
  }

  /** Libère un consommateur ; arrête tout quand il n'y en a plus. */
  release(): void {
    this.consumers = Math.max(0, this.consumers - 1);
    if (this.consumers === 0) {
      this.subs.forEach(s => s.unsubscribe());
      this.subs = [];
      this.stopPolling();
      this.stream.stop();
    }
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = timer(0, this.POLL_MS).subscribe(() => {
      this.activityFeed.getFeed(20, undefined, true).subscribe({
        next: (events) => this.onSnapshot(events),
        error: () => {}
      });
    });
  }
  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  refreshNow(): void {
    this.activityFeed.getFeed(20, undefined, true).subscribe({
      next: (events) => this.onSnapshot(events),
      error: () => {}
    });
    this.refreshPermissions();
  }

  private refreshPermissions(): void {
    this.permissionService.countAttente().subscribe({
      next: (r) => this.pendingPermissions$.next(r.enAttente),
      error: () => {}
    });
  }

  /** Remplace entièrement la liste (chargement initial / polling de repli). */
  private onSnapshot(events: ActivityEvent[]): void {
    this.recent$.next(events);
    const seen = this.lastSeen;
    if (!seen) {
      this.lastSeen = events[0]?.timestamp || new Date().toISOString();
      this.unreadCount$.next(0);
    } else {
      this.unreadCount$.next(events.filter(e => e.timestamp && e.timestamp > seen).length);
    }
  }

  /** Ajoute un événement poussé en temps réel (en tête de liste). */
  private onNewEvent(e: ActivityEvent): void {
    const cur = this.recent$.value;
    if (cur.some(x => x.id === e.id)) return; // dédoublonnage
    this.recent$.next([e, ...cur].slice(0, 30));
    const seen = this.lastSeen;
    if (e.timestamp && (!seen || e.timestamp > seen)) {
      this.unreadCount$.next(this.unreadCount$.value + 1);
    }
  }

  markAllRead(): void {
    const latest = this.recent$.value[0]?.timestamp || new Date().toISOString();
    this.lastSeen = latest;
    this.unreadCount$.next(0);
  }

  isUnread(e: ActivityEvent): boolean {
    const seen = this.lastSeen;
    return !!(e.timestamp && (!seen || e.timestamp > seen));
  }
}
