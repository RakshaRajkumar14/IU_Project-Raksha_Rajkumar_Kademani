import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

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

        <a routerLink="/queue" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span *ngIf="!isCollapsed">History</span>
        </a>

        <a routerLink="/reports" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
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
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #1a2332 0%, #0f1419 100%);
      border-right: 1px solid rgba(95, 247, 210, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      overflow-y: auto;
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(95, 247, 210, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #5ff7d2;
    }

    .logo-text h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #5ff7d2;
    }

    .logo-text p {
      margin: 0.25rem 0 0 0;
      font-size: 0.75rem;
      color: rgba(95, 247, 210, 0.6);
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
      background: linear-gradient(135deg, #5ff7d2 0%, #4fd1c5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f1419;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: rgba(95, 247, 210, 0.8);
      text-transform: capitalize;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.5rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      background: none;
      border-right: none;
      border-top: none;
      border-bottom: none;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: rgba(95, 247, 210, 0.05);
      color: #5ff7d2;
      border-left-color: #5ff7d2;
    }

    .nav-item.active {
      background: rgba(95, 247, 210, 0.1);
      color: #5ff7d2;
      border-left-color: #5ff7d2;
    }

    .nav-item svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .sidebar-bottom {
      padding: 1rem;
      border-top: 1px solid rgba(95, 247, 210, 0.1);
    }

    .logout-btn {
      color: #ff6b6b !important;
      background: rgba(255, 107, 107, 0.1) !important;
      margin-bottom: 0.5rem;
    }

    .logout-btn:hover {
      background: rgba(255, 107, 107, 0.2) !important;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      width: 100%;
      background: rgba(95, 247, 210, 0.05);
      border: 1px solid rgba(95, 247, 210, 0.2);
      border-radius: 8px;
      color: #5ff7d2;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      background: rgba(95, 247, 210, 0.1);
    }

    .toggle-btn svg {
      transition: transform 0.3s ease;
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: none;
    }

    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    /* Collapsed state */
    .sidebar.collapsed .logo-text,
    .sidebar.collapsed .user-details,
    .sidebar.collapsed .nav-item span {
      display: none;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.875rem;
    }

    .sidebar.collapsed .user-info {
      justify-content: center;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .mobile-overlay {
        display: block;
      }
    }

    /* Scrollbar */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(95, 247, 210, 0.3);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover {
      background: rgba(95, 247, 210, 0.5);
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<boolean>();
  @Output() closeMobile = new EventEmitter<void>();

  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user on initialization
    this.loadCurrentUser();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      console.log('👤 Sidebar: User updated', user);
      this.currentUser = user;
    });

    // Reload user on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadCurrentUser();
    });
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      console.log('✅ Sidebar: User loaded', user);
      this.currentUser = user;
    } else {
      console.log('⚠️ Sidebar: No user found, attempting to fetch...');
      // If no user in localStorage, try to get from service
      this.authService.currentUser$.subscribe(u => {
        this.currentUser = u;
      });
    }
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.full_name) return 'U';
    const names = this.currentUser.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.full_name[0].toUpperCase();
  }

  logout(): void {
    console.log('🚪 Logout clicked');
    this.authService.logout();
  }

  onNavClick(): void {
    // Close mobile sidebar when navigating
    if (this.isMobileOpen) {
      this.closeMobile.emit();
    }
  }
}