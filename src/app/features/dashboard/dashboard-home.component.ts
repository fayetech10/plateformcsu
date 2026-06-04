import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DashboardComponent } from './dashboard.component';
import { AdminDashboardComponent } from '../admin/dashboard/admin-dashboard.component';

/**
 * Point d'entrée unique du tableau de bord.
 * - ADMIN  : affiche la vue d'ensemble d'administration.
 * - Autres : affiche le tableau de bord métier classique.
 */
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, DashboardComponent, AdminDashboardComponent],
  template: `
    @if (isAdmin) {
      <app-admin-dashboard />
    } @else {
      <app-dashboard />
    }
  `
})
export class DashboardHomeComponent {
  private authService = inject(AuthService);

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
