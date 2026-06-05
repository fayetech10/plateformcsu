import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="csu-navbar" [class.expanded]="isSidebarCollapsed">
      <div class="csu-navbar-left">
        <button class="csu-navbar-toggle" (click)="toggleSidebar()" aria-label="Ouvrir le menu">
          <i class="bi bi-list"></i>
        </button>
        <div class="d-none d-md-flex align-items-center gap-2">
          <span class="badge bg-csu-primary-light text-csu-primary px-3 py-2 rounded-pill fw-semibold">
            <i class="bi bi-building-fill me-1"></i>
            {{ user?.bureauCsuNom || 'Bureau non affecté' }}
          </span>
          @if (user?.structureNom) {
            <span class="badge bg-light text-secondary px-3 py-2 rounded-pill fw-semibold border">
              <i class="bi bi-hospital me-1"></i>
              {{ user?.structureNom }}
            </span>
          }
        </div>
      </div>

      <div class="csu-navbar-right">
        <!-- Notifications : demandes de permission (Admin) -->
        @if (isAdmin) {
          <button class="notif-btn" (click)="goToPermissions()"
                  [title]="nbEnAttente > 0 ? (nbEnAttente + ' demande(s) de permission en attente') : 'Aucune demande en attente'">
            <i class="bi bi-bell"></i>
            @if (nbEnAttente > 0) {
              <span class="notif-badge">{{ nbEnAttente > 99 ? '99+' : nbEnAttente }}</span>
            }
          </button>
        }

        <div class="csu-navbar-user dropdown">
          <div class="d-flex align-items-center gap-2" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="csu-navbar-avatar text-uppercase">
              {{ initials }}
            </div>
            <div class="csu-navbar-user-info d-none d-sm-block">
              <div class="csu-navbar-user-name">{{ user?.prenom }} {{ user?.nom }}</div>
              <div class="csu-navbar-user-role text-uppercase">{{ roleLabel }}</div>
            </div>
            <i class="bi bi-chevron-down text-muted small ms-1"></i>
          </div>

          <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-2 p-2" aria-labelledby="userDropdown">
            <li class="px-3 py-2 border-bottom mb-2">
              <span class="d-block fw-bold small text-muted">Bureau de rattachement</span>
              <span class="small">{{ user?.bureauCsuNom || 'Non affecté' }}</span>
              @if (user?.structureNom) {
                <span class="d-block fw-bold small text-muted mt-2">Structure</span>
                <span class="small">{{ user?.structureNom }}</span>
              }
            </li>
            <li>
              <button class="dropdown-item rounded py-2 d-flex align-items-center gap-2" (click)="goChangePassword()">
                <i class="bi bi-key"></i>
                <span>Changer mon mot de passe</span>
              </button>
            </li>
            <li><hr class="dropdown-divider my-1"></li>
            <li>
              <button class="dropdown-item rounded py-2 d-flex align-items-center gap-2 text-danger" (click)="onLogout()">
                <i class="bi bi-box-arrow-right"></i>
                <span>Se déconnecter</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .notif-btn {
      position: relative; width: 42px; height: 42px; border-radius: 50%;
      border: 1px solid var(--csu-border-light, rgba(0,0,0,0.08)); background: #fff;
      color: var(--csu-text, #1a1a2e); font-size: 1.15rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; margin-right: 6px;
    }
    .notif-btn:hover { background: var(--csu-primary, #00875A); color: #fff; transform: translateY(-1px); }
    .notif-badge {
      position: absolute; top: -3px; right: -3px; min-width: 19px; height: 19px;
      padding: 0 5px; border-radius: 10px; background: #E53935; color: #fff;
      font-size: 0.66rem; font-weight: 800; line-height: 19px; text-align: center;
      box-shadow: 0 0 0 2px #fff; animation: notif-pop 0.3s ease;
    }
    @keyframes notif-pop { from { transform: scale(0); } to { transform: scale(1); } }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);

  @Output() sidebarToggle = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;

  nbEnAttente = 0;
  private pollTimer?: any;
  private refreshHandler = () => this.refreshCount();

  get user() {
    return this.authService.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.refreshCount();
      // Rafraîchissement périodique léger
      this.pollTimer = setInterval(() => this.refreshCount(), 60000);
      // Mise à jour immédiate après traitement d'une demande dans le dashboard
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

  goChangePassword(): void {
    this.router.navigate(['/changer-mot-de-passe']);
  }

  goToPermissions(): void {
    this.router.navigate(['/dashboard'], { queryParams: { focus: 'permissions' } }).then(() => {
      // Cas où le dashboard est déjà affiché : signaler le focus
      window.dispatchEvent(new CustomEvent('csu:focus-permissions'));
    });
  }

  get initials(): string {
    if (!this.user) return 'U';
    const first = this.user.prenom ? this.user.prenom.charAt(0) : '';
    const last = this.user.nom ? this.user.nom.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  get roleLabel(): string {
    const role = this.user?.role;
    if (role === 'ADMIN') return 'Administrateur';
    if (role === 'SUPERVISEUR') return 'Superviseur';
    if (role === 'AGENT') return 'Agent CSU';
    return 'Utilisateur';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarToggle.emit();
  }

  onLogout(): void {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnexion',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Déconnexion réussie',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}
