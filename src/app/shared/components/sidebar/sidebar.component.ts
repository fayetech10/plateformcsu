import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="csu-sidebar" [class.collapsed]="collapsed">
      <div class="csu-sidebar-brand">
        <div class="csu-sidebar-brand-icon" style="background: transparent; box-shadow: none;">
          <img src="assets/logo.png" alt="CSU Logo" style="max-height: 40px; border-radius: 8px;" />
        </div>
        <div class="csu-sidebar-brand-text" *ngIf="!collapsed">
          CSU Plateforme
          <div class="csu-sidebar-brand-sub">Gestion Bureaux</div>
        </div>
      </div>

      <div class="csu-sidebar-nav">
        <!-- Section: Principal -->
        <div class="csu-sidebar-section">
          <div class="csu-sidebar-section-title" *ngIf="!collapsed">Principal</div>
          
          <a class="csu-sidebar-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <i class="bi bi-speedometer2"></i>
            <span *ngIf="!collapsed">Tableau de bord</span>
          </a>
        </div>

        <!-- Section: Opérations -->
        <div class="csu-sidebar-section">
          <div class="csu-sidebar-section-title" *ngIf="!collapsed">Opérations</div>

          <a class="csu-sidebar-link" routerLink="/patients" routerLinkActive="active">
            <i class="bi bi-people"></i>
            <span *ngIf="!collapsed">Patients</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/enrolements" routerLinkActive="active">
            <i class="bi bi-person-check"></i>
            <span *ngIf="!collapsed">Enrôlements</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/activites" routerLinkActive="active">
            <i class="bi bi-calendar2-event"></i>
            <span *ngIf="!collapsed">Activités</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/constats" routerLinkActive="active">
            <i class="bi bi-clipboard-check"></i>
            <span *ngIf="!collapsed">Constats</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/pointage" routerLinkActive="active">
            <i class="bi bi-clock-history"></i>
            <span *ngIf="!collapsed">Pointage</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/permissions" routerLinkActive="active">
            <i class="bi bi-calendar2-week"></i>
            <span *ngIf="!collapsed">Permissions</span>
          </a>
        </div>

        <!-- Section: Rapports -->
        <div class="csu-sidebar-section">
          <div class="csu-sidebar-section-title" *ngIf="!collapsed">Statistiques</div>

          <a class="csu-sidebar-link" *ngIf="isAdmin" routerLink="/statistiques" routerLinkActive="active">
            <i class="bi bi-bar-chart-line"></i>
            <span *ngIf="!collapsed">Statistiques</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/rapports" routerLinkActive="active">
            <i class="bi bi-file-earmark-bar-graph"></i>
            <span *ngIf="!collapsed">Rapports</span>
          </a>
        </div>

        <!-- Section: Administration (Admin only) -->
        <div class="csu-sidebar-section" *ngIf="isAdmin">
          <div class="csu-sidebar-section-title" *ngIf="!collapsed">Configuration</div>

          <a class="csu-sidebar-link" routerLink="/admin/utilisateurs" routerLinkActive="active">
            <i class="bi bi-people-fill"></i>
            <span *ngIf="!collapsed">Utilisateurs</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/admin/bureaux" routerLinkActive="active">
            <i class="bi bi-building"></i>
            <span *ngIf="!collapsed">Bureaux CSU</span>
          </a>

          <a class="csu-sidebar-link" routerLink="/admin/categories" routerLinkActive="active">
            <i class="bi bi-tags"></i>
            <span *ngIf="!collapsed">Catégories</span>
          </a>
        </div>
      </div>

      <div class="csu-sidebar-footer text-center" *ngIf="!collapsed">
        <small class="text-white-50">v1.0.0 — CSU &copy; 2026</small>
      </div>
    </div>
  `
})
export class SidebarComponent {
  private authService = inject(AuthService);

  @Input() collapsed = false;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
