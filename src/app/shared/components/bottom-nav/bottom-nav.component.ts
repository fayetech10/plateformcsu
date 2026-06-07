import { Component, inject, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (!isAdmin) {
    <!-- FAB Overlay -->
    <div class="fab-overlay" [class.active]="isMenuOpen" (click)="toggleMenu()"></div>

    <!-- FAB Menu Items -->
    <div class="fab-menu" [class.active]="isMenuOpen">
      <a class="fab-menu-item" (click)="navigateTo('/patients/nouveau')" [style.transition-delay]="'0.08s'">
        <span class="fab-menu-label">Enregistrer Patient</span>
        <div class="fab-menu-icon patient">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
      </a>
      <a class="fab-menu-item" (click)="navigateTo('/enrolements/nouveau')" [style.transition-delay]="'0.12s'">
        <span class="fab-menu-label">Enrôlement</span>
        <div class="fab-menu-icon enrolement">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="16 11 18 13 22 9"/>
          </svg>
        </div>
      </a>
      <a class="fab-menu-item" (click)="navigateTo('/activites/nouveau')" [style.transition-delay]="'0.16s'">
        <span class="fab-menu-label">Activité</span>
        <div class="fab-menu-icon activite">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="12" y1="14" x2="12" y2="18"/>
            <line x1="10" y1="16" x2="14" y2="16"/>
          </svg>
        </div>
      </a>
      <a class="fab-menu-item" (click)="navigateTo('/constats/nouveau')" [style.transition-delay]="'0.20s'">
        <span class="fab-menu-label">Constat</span>
        <div class="fab-menu-icon constat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
      </a>
      <a class="fab-menu-item" (click)="navigateTo('/bons-commande/nouveau')" [style.transition-delay]="'0.24s'">
        <span class="fab-menu-label">Bon de commande</span>
        <div class="fab-menu-icon bon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
            <line x1="8" y1="8" x2="16" y2="8"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
      </a>
    </div>
    }

    <!-- Bottom Navigation Bar -->
    <nav class="mobile-bottom-nav">
      <a class="bottom-nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <div class="bottom-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span class="bottom-nav-label">Tableau de bord</span>
      </a>

      <!-- FAB Center Button (masqué pour les administrateurs) -->
      @if (!isAdmin) {
        <div class="bottom-nav-fab-wrapper">
          <button class="bottom-nav-fab" [class.active]="isMenuOpen" (click)="toggleMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="fab-icon">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Notifications (Admin) : remplace le FAB dans la barre du bas -->
      @if (isAdmin) {
        <a class="bottom-nav-item" routerLink="/permissions" routerLinkActive="active">
          <div class="bottom-nav-icon notif-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            @if (nbEnAttente > 0) {
              <span class="bottom-nav-badge">{{ nbEnAttente > 99 ? '99+' : nbEnAttente }}</span>
            }
          </div>
          <span class="bottom-nav-label">Demandes</span>
        </a>
      }

      <a class="bottom-nav-item" routerLink="/rapports" routerLinkActive="active">
        <div class="bottom-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <span class="bottom-nav-label">Rapports</span>
      </a>
    </nav>
  `,
  styles: [`
    /* ── Bottom Navigation Bar ── */
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      z-index: 1100;
      justify-content: space-around;
      align-items: center;
      padding: 0 1rem;
      padding-bottom: env(safe-area-inset-bottom, 0);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-decoration: none;
      color: #9CA3AF;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 6px 16px;
      border-radius: 12px;
      position: relative;
    }

    .bottom-nav-item.active {
      color: #00875A;
    }

    .bottom-nav-item.active .bottom-nav-icon {
      transform: translateY(-2px);
    }

    .bottom-nav-item.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      width: 20px;
      height: 3px;
      background: #00875A;
      border-radius: 3px 3px 0 0;
    }

    .bottom-nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s ease;
    }

    /* Badge de notification (compteur de demandes en attente) */
    .notif-icon { position: relative; }
    .bottom-nav-badge {
      position: absolute;
      top: -6px;
      right: -10px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #E53935;
      color: #fff;
      font-size: 0.62rem;
      font-weight: 800;
      line-height: 18px;
      text-align: center;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.92);
      animation: notif-pop 0.3s ease;
    }
    @keyframes notif-pop { from { transform: scale(0); } to { transform: scale(1); } }

    .bottom-nav-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    /* ── FAB Button ── */
    .bottom-nav-fab-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: -28px;
    }

    .bottom-nav-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00875A, #00C67B);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 135, 90, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 1101;
    }

    .bottom-nav-fab:active {
      transform: scale(0.92);
    }

    .bottom-nav-fab.active {
      background: linear-gradient(135deg, #E53935, #FF5252);
      box-shadow: 0 4px 16px rgba(229, 57, 53, 0.4);
    }

    .bottom-nav-fab.active .fab-icon {
      transform: rotate(45deg);
    }

    .fab-icon {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── FAB Menu ── */
    .fab-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1099;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .fab-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .fab-menu {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1100;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding-bottom: 12px;
      display: flex;
      pointer-events: none;
    }

    .fab-menu.active {
      pointer-events: auto;
    }

    .fab-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0;
      cursor: pointer;
      text-decoration: none;
      opacity: 0;
      transform: translateY(20px) scale(0.8);
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-direction: row-reverse;
      pointer-events: none;
    }

    .fab-menu.active .fab-menu-item {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .fab-menu-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .fab-menu-icon.patient    { background: linear-gradient(135deg, #1565C0, #42A5F5); }
    .fab-menu-icon.enrolement { background: linear-gradient(135deg, #00875A, #00C67B); }
    .fab-menu-icon.activite   { background: linear-gradient(135deg, #7B1FA2, #AB47BC); }
    .fab-menu-icon.constat    { background: linear-gradient(135deg, #F57C00, #FFB74D); }
    .fab-menu-icon.bon        { background: linear-gradient(135deg, #00838F, #26C6DA); }

    .fab-menu-item:active .fab-menu-icon {
      transform: scale(0.9);
    }

    .fab-menu-label {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #1A1A2E;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      white-space: nowrap;
    }

    /* ── Responsive: show only on mobile ── */
    @media (max-width: 992px) {
      .mobile-bottom-nav {
        display: flex;
      }
    }
  `]
})
export class BottomNavComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  isMenuOpen = false;
  nbEnAttente = 0;
  private pollTimer?: any;
  private refreshHandler = () => this.refreshCount();

  /** Les administrateurs n'ont pas le bouton d'ajout rapide (FAB) en mobile. */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.refreshCount();
      // Rafraîchissement périodique léger (sans loader global)
      this.pollTimer = setInterval(() => this.refreshCount(), 60000);
      window.addEventListener('csu:permissions-updated', this.refreshHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    window.removeEventListener('csu:permissions-updated', this.refreshHandler);
  }

  private refreshCount(): void {
    this.permissionService.countAttente().subscribe({
      next: (r) => (this.nbEnAttente = r.enAttente),
      error: () => {}
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(path: string): void {
    this.isMenuOpen = false;
    this.router.navigate([path]);
  }

  @HostListener('window:csu:open-quick-menu')
  onOpenQuickMenu(): void {
    this.isMenuOpen = true;
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }
}
