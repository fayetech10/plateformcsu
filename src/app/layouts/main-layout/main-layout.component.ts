import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, BottomNavComponent],
  template: `
    <div class="d-flex">
      <!-- Sidebar -->
      <app-sidebar [collapsed]="isSidebarCollapsed"></app-sidebar>

      <!-- Main Panel -->
      <div class="flex-grow-1 csu-main-panel" [class.expanded]="isSidebarCollapsed">
        <!-- Top Navbar -->
        <app-navbar 
          [isSidebarCollapsed]="isSidebarCollapsed" 
          (sidebarToggle)="onSidebarToggle()"
        ></app-navbar>

        <!-- Dynamic Main Content -->
        <main class="csu-main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <app-bottom-nav></app-bottom-nav>
  `
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  onSidebarToggle(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
