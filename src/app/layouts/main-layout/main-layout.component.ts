import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { PointagePunchModalComponent } from '../../features/pointage/pointage-punch-modal.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, BottomNavComponent, PointagePunchModalComponent],
  template: `
    <div class="d-flex">
      <!-- Sidebar (desktop : visible/collapse ; mobile : drawer coulissant) -->
      <app-sidebar
        [collapsed]="isSidebarCollapsed"
        [mobileOpen]="mobileSidebarOpen"
        (linkClicked)="closeMobileSidebar()"
      ></app-sidebar>

      <!-- Backdrop mobile : visible quand le drawer est ouvert -->
      <div class="csu-sidebar-backdrop" [class.show]="mobileSidebarOpen" (click)="closeMobileSidebar()"></div>

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

    <!-- Modal plein écran de pointage (agents non pointés) -->
    <app-pointage-punch-modal></app-pointage-punch-modal>
  `
})
export class MainLayoutComponent {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isSidebarCollapsed = false;
  mobileSidebarOpen = false;

  constructor() {
    // Ferme automatiquement le drawer mobile à chaque changement de route
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.mobileSidebarOpen = false;
    });
  }

  private isMobile(): boolean {
    return isPlatformBrowser(this.platformId) && window.innerWidth <= 992;
  }

  onSidebarToggle(): void {
    if (this.isMobile()) {
      // En mobile : le bouton hamburger ouvre/ferme le drawer
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
    } else {
      // En desktop : il collapse / déploie la sidebar
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    // Si on repasse en desktop, on referme le drawer mobile (au cas où il était ouvert)
    if (!this.isMobile() && this.mobileSidebarOpen) {
      this.mobileSidebarOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileSidebarOpen) this.mobileSidebarOpen = false;
  }
}
