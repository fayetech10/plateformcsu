import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="csu-navbar" [class.expanded]="isSidebarCollapsed">
      <div class="csu-navbar-left">
        <button class="csu-navbar-toggle" (click)="toggleSidebar()">
          <i class="bi" [class.bi-list]="isSidebarCollapsed" [class.bi-x]="!isSidebarCollapsed"></i>
        </button>
        <div class="d-none d-md-flex align-items-center gap-2">
          <span class="badge bg-csu-primary-light text-csu-primary px-3 py-2 rounded-pill fw-semibold">
            <i class="bi bi-building-fill me-1"></i>
            {{ user?.bureauCsuNom || 'Bureau Principal' }}
          </span>
        </div>
      </div>

      <div class="csu-navbar-right">
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
            </li>
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
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Output() sidebarToggle = new EventEmitter<void>();
  @Input() isSidebarCollapsed = false;

  get user() {
    return this.authService.currentUserValue;
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
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
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
