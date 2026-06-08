import { Component, OnInit, OnDestroy, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActivityNotificationsService } from '../../../core/services/activity-notifications.service';
import { ActivityEvent, ACTIVITY_META, ActivityType } from '../../../core/models/activity-event.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrap" #root>
      <button class="notif-btn" (click)="toggle()" [title]="badge > 0 ? (badge + ' notification(s)') : 'Notifications'">
        <i class="bi bi-bell"></i>
        @if (badge > 0) {
          <span class="notif-badge">{{ badge > 99 ? '99+' : badge }}</span>
        }
      </button>

      @if (open) {
        <div class="notif-panel">
          <div class="np-head">
            <div class="np-title">
              <i class="bi bi-broadcast"></i> Notifications
              <span class="np-live" [class.off]="!connected">
                <span class="np-dot"></span>{{ connected ? 'en direct' : 'différé' }}
              </span>
            </div>
            @if (unread > 0) {
              <button class="np-readall" (click)="markAllRead()">Tout marquer lu</button>
            }
          </div>

          <!-- Demandes de permission en attente -->
          @if (pending > 0) {
            <button class="np-alert" (click)="goPermissions()">
              <div class="np-alert-ic"><i class="bi bi-calendar2-week"></i></div>
              <div class="np-alert-tx">
                <b>{{ pending }} demande{{ pending > 1 ? 's' : '' }} de permission</b>
                <span>en attente de traitement</span>
              </div>
              <i class="bi bi-chevron-right"></i>
            </button>
          }

          <div class="np-list">
            @if (recent.length === 0) {
              <div class="np-empty"><i class="bi bi-inbox"></i><span>Aucune activité récente</span></div>
            } @else {
              @for (e of recent; track e.id) {
                <button class="np-item" [class.unread]="notif.isUnread(e)" (click)="openEvent(e)">
                  <div class="np-ic" [ngClass]="'tone-' + e.tone"><i class="bi" [ngClass]="icon(e.type)"></i></div>
                  <div class="np-tx">
                    <div class="np-it">{{ e.title }}</div>
                    <div class="np-id">{{ e.description }}</div>
                    <div class="np-meta">
                      @if (e.agentNom) { <span><i class="bi bi-person"></i> {{ e.agentNom }}</span> }
                      <span class="np-time">{{ relative(e.timestamp) }}</span>
                    </div>
                  </div>
                  @if (notif.isUnread(e)) { <span class="np-unread-dot"></span> }
                </button>
              }
            }
          </div>

          <button class="np-foot" (click)="goActivite()">
            <i class="bi bi-activity"></i> Voir toute l'activité
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-wrap { position: relative; }
    .notif-btn {
      position: relative; width: 42px; height: 42px; border-radius: 50%;
      border: 1px solid var(--csu-border-light, rgba(0,0,0,0.08)); background: #fff;
      color: var(--csu-text, #1a1a2e); font-size: 1.15rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; margin-right: 6px;
    }
    .notif-btn:hover { background: var(--csu-primary, #00875A); color: #fff; transform: translateY(-1px); }
    .notif-badge {
      position: absolute; top: -3px; right: 1px; min-width: 19px; height: 19px; padding: 0 5px; border-radius: 10px;
      background: #E53935; color: #fff; font-size: 0.66rem; font-weight: 800; line-height: 19px; text-align: center;
      box-shadow: 0 0 0 2px #fff; animation: notif-pop 0.3s ease;
    }
    @keyframes notif-pop { from { transform: scale(0); } to { transform: scale(1); } }

    .notif-panel {
      position: absolute; top: 52px; right: 0; width: 380px; max-width: 92vw; background: #fff;
      border: 1px solid rgba(0,0,0,0.07); border-radius: 16px; box-shadow: 0 20px 48px -16px rgba(0,0,0,0.32);
      z-index: 1200; overflow: hidden; animation: np-in 0.18s ease;
    }
    @keyframes np-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .np-head { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .np-title { display: flex; align-items: center; gap: 7px; font-weight: 700; font-family: 'Outfit', sans-serif; font-size: 0.98rem; }
    .np-title > i { color: var(--csu-primary); }
    .np-live { display: inline-flex; align-items: center; gap: 4px; font-size: 0.66rem; font-weight: 700; color: #2E7D32; background: rgba(67,160,71,0.12); padding: 2px 7px; border-radius: 12px; text-transform: uppercase; }
    .np-live.off { color: #6B7280; background: rgba(0,0,0,0.06); }
    .np-dot { width: 6px; height: 6px; border-radius: 50%; background: #2E7D32; animation: blink 1.4s infinite; }
    .np-live.off .np-dot { background: #9CA3AF; animation: none; }
    @keyframes blink { 50% { opacity: 0.3; } }
    .np-readall { background: none; border: none; color: var(--csu-primary); font-size: 0.76rem; font-weight: 700; cursor: pointer; }

    .np-alert { width: 100%; display: flex; align-items: center; gap: 10px; padding: 0.7rem 1rem; background: rgba(245,124,0,0.07);
      border: none; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; text-align: left; transition: background 0.15s ease; }
    .np-alert:hover { background: rgba(245,124,0,0.13); }
    .np-alert-ic { width: 36px; height: 36px; border-radius: 10px; background: rgba(245,124,0,0.18); color: #E65100; display: grid; place-items: center; font-size: 1.1rem; flex-shrink: 0; }
    .np-alert-tx { flex: 1; display: flex; flex-direction: column; }
    .np-alert-tx b { font-size: 0.84rem; }
    .np-alert-tx span { font-size: 0.74rem; color: var(--csu-text-muted); }
    .np-alert > i { color: var(--csu-text-muted); }

    .np-list { max-height: 380px; overflow-y: auto; }
    .np-item { position: relative; width: 100%; display: flex; gap: 11px; padding: 0.7rem 1rem; background: none; border: none;
      border-bottom: 1px solid rgba(0,0,0,0.04); cursor: pointer; text-align: left; transition: background 0.15s ease; }
    .np-item:hover { background: var(--csu-bg, #f6f8fa); }
    .np-item.unread { background: rgba(0,135,90,0.04); }
    .np-ic { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; font-size: 1.05rem; flex-shrink: 0; color: #fff; }
    .tone-blue { background: linear-gradient(135deg,#1565C0,#42A5F5); }
    .tone-green { background: linear-gradient(135deg,#00875A,#00C67B); }
    .tone-purple { background: linear-gradient(135deg,#7B1FA2,#AB47BC); }
    .tone-orange { background: linear-gradient(135deg,#F57C00,#FFB74D); }
    .tone-teal { background: linear-gradient(135deg,#00838F,#26C6DA); }
    .tone-slate { background: linear-gradient(135deg,#546E7A,#90A4AE); }
    .tone-red { background: linear-gradient(135deg,#E53935,#EF5350); }
    .np-tx { flex: 1; min-width: 0; }
    .np-it { font-size: 0.84rem; font-weight: 700; line-height: 1.2; }
    .np-id { font-size: 0.78rem; color: var(--csu-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .np-meta { display: flex; gap: 9px; margin-top: 2px; font-size: 0.7rem; color: var(--csu-text-muted); }
    .np-meta i { font-size: 0.66rem; }
    .np-time { font-weight: 600; }
    .np-unread-dot { position: absolute; top: 0.85rem; right: 0.9rem; width: 8px; height: 8px; border-radius: 50%; background: var(--csu-primary); }

    .np-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 2rem; color: var(--csu-text-muted); }
    .np-empty i { font-size: 1.8rem; opacity: 0.4; }
    .np-empty span { font-size: 0.82rem; }

    .np-foot { width: 100%; padding: 0.8rem; background: var(--csu-bg, #f8fafc); border: none; border-top: 1px solid rgba(0,0,0,0.06);
      color: var(--csu-primary); font-weight: 700; font-size: 0.84rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; }
    .np-foot:hover { background: rgba(0,135,90,0.08); }

    @media (max-width: 576px) { .notif-panel { position: fixed; top: 64px; right: 8px; left: 8px; width: auto; } }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notif = inject(ActivityNotificationsService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  open = false;
  recent: ActivityEvent[] = [];
  unread = 0;
  pending = 0;
  connected = false;
  private subs: Subscription[] = [];

  get badge(): number { return this.unread + this.pending; }

  ngOnInit(): void {
    this.notif.start();
    this.subs.push(this.notif.recent$.subscribe(r => (this.recent = r.slice(0, 5))));
    this.subs.push(this.notif.unreadCount$.subscribe(c => (this.unread = c)));
    this.subs.push(this.notif.pendingPermissions$.subscribe(p => (this.pending = p)));
    this.subs.push(this.notif.connected$.subscribe(c => (this.connected = c)));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.notif.release();
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.notif.refreshNow();
  }

  markAllRead(): void { this.notif.markAllRead(); }

  openEvent(e: ActivityEvent): void {
    this.notif.markAllRead();
    this.open = false;
    if (e.link) this.router.navigateByUrl(e.link);
  }

  goActivite(): void { this.open = false; this.router.navigate(['/admin/activite']); }
  goPermissions(): void {
    this.open = false;
    this.router.navigate(['/dashboard'], { queryParams: { focus: 'permissions' } }).then(() => {
      window.dispatchEvent(new CustomEvent('csu:focus-permissions'));
    });
  }

  icon(type: ActivityType): string { return ACTIVITY_META[type]?.icon || 'bi-dot'; }

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

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(ev.target)) {
      this.open = false;
    }
  }
}
