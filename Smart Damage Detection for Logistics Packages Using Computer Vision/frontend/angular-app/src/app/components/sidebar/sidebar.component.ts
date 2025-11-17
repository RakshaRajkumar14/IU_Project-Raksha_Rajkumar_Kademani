import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed" [class.mobile-open]="isMobileOpen">
      <!-- Close button for mobile -->
      <button class="close-btn" (click)="closeMobile.emit()" *ngIf="isMobileOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Logo/Header -->
      <div class="sidebar-header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <div class="logo-text" *ngIf="!isCollapsed">
          <h2>Package AI</h2>
          <p>Damage Detection</p>
        </div>
      </div>

      <!-- User Info -->
      <div class="user-info" *ngIf="!isCollapsed && currentUser">
        <div class="user-avatar">{{ getUserInitials() }}</div>
        <div class="user-details">
          <p class="user-name">{{ currentUser.full_name }}</p>
          <p class="user-role">{{ currentUser.role }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span *ngIf="!isCollapsed">Dashboard</span>
        </a>

        <a routerLink="/upload" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          <span *ngIf="!isCollapsed">Upload & Detect</span>
        </a>

        <a routerLink="/history" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span *ngIf="!isCollapsed">History</span>
        </a>

        <a routerLink="/analytics" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span *ngIf="!isCollapsed">Analytics</span>
        </a>
      </nav>

      <!-- Bottom Actions -->
      <div class="sidebar-bottom">
        <button class="nav-item logout-btn" (click)="logout()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span *ngIf="!isCollapsed">Logout</span>
        </button>

        <button class="toggle-btn" (click)="toggleCollapse.emit(!isCollapsed)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [style.transform]="isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)'">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" *ngIf="isMobileOpen" (click)="closeMobile.emit()"></div>
  `,
  styles: [`
    /* Your existing sidebar styles + logout button styles */
    .logout-btn {
      color: #ff6b6b !important;
      background: rgba(255, 107, 107, 0.1) !important;
    }

    .logout-btn:hover {
      background: rgba(255, 107, 107, 0.2) !important;
    }

    .user-info {
      padding: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .user-role {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: capitalize;
    }

    /* Add your existing sidebar styles here */
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<boolean>();
  @Output() closeMobile = new EventEmitter<void>();

  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.full_name) return 'U';
    const names = this.currentUser.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.full_name[0].toUpperCase();
  }

  logout() {
    this.authService.logout();
  }

  onNavClick() {
    // Close mobile sidebar when navigating
    if (this.isMobileOpen) {
      this.closeMobile.emit();
    }
  }
}