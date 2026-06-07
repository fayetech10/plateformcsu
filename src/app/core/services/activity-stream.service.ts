import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ActivityEvent } from '../models/activity-event.model';

/**
 * Flux d'activité temps réel via Server-Sent Events (SSE).
 * Ouvre une connexion EventSource unique (partagée) vers le serveur, qui pousse
 * les nouveaux événements. Si la connexion échoue (réseau, tunnel…), bascule un
 * indicateur de repli pour que les consommateurs reviennent au polling.
 */
@Injectable({ providedIn: 'root' })
export class ActivityStreamService {
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;

  /** Émis à chaque nouvel événement poussé par le serveur. */
  readonly events$ = new Subject<ActivityEvent>();
  /** Vrai si la connexion SSE est établie. */
  readonly connected$ = new BehaviorSubject<boolean>(false);
  /** Vrai si le SSE est indisponible → les consommateurs doivent poller. */
  readonly fallbackPolling$ = new BehaviorSubject<boolean>(false);

  private es?: EventSource;
  private started = false;
  private openTimer?: any;

  start(): void {
    if (this.started || !isPlatformBrowser(this.platformId)) return;
    if (typeof EventSource === 'undefined') { this.fallbackPolling$.next(true); return; }
    this.started = true;
    this.open();
  }

  private open(): void {
    const token = this.auth.token;
    if (!token) { this.fallbackPolling$.next(true); return; }

    try {
      const url = `${this.apiUrl}/admin/activity/stream?token=${encodeURIComponent(token)}`;
      this.es = new EventSource(url);

      // Si la connexion n'est pas ouverte sous 6 s, on active le repli polling
      // (tout en laissant EventSource retenter en arrière-plan).
      clearTimeout(this.openTimer);
      this.openTimer = setTimeout(() => {
        if (!this.connected$.value) this.fallbackPolling$.next(true);
      }, 6000);

      const onUp = () => {
        this.connected$.next(true);
        this.fallbackPolling$.next(false);
        clearTimeout(this.openTimer);
      };
      this.es.addEventListener('open', onUp);
      this.es.addEventListener('connected', onUp);

      this.es.addEventListener('activity', (ev: MessageEvent) => {
        try { this.events$.next(JSON.parse(ev.data) as ActivityEvent); } catch { /* ignore */ }
      });

      // 'ping' : heartbeat — rien à faire, maintient la connexion.

      this.es.onerror = () => {
        // EventSource se reconnecte automatiquement ; en attendant on bascule en repli.
        this.connected$.next(false);
        this.fallbackPolling$.next(true);
      };
    } catch {
      this.fallbackPolling$.next(true);
    }
  }

  stop(): void {
    this.es?.close();
    this.es = undefined;
    this.started = false;
    this.connected$.next(false);
    clearTimeout(this.openTimer);
  }
}
