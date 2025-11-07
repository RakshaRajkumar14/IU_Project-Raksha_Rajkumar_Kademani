import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay (mobile only) -->
    <div class="sidebar-overlay" *ngIf="isOpen" (click)="closeMenu.emit()"></div>

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">📦</div>
          <span class="logo-text">AI Damage Inspector</span>
        </div>
        <button class="close-btn" (click)="closeMenu.emit()">✕</button>
      </div>

      <!-- Navigation -->
      <nav class="nav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.path"
           routerLinkActive="active"
           class="nav-item"
           (click)="closeMenu.emit()">

          <!-- SVG icon area -->
          <span class="nav-icon" aria-hidden="true">
            <ng-container [ngSwitch]="item.icon">

              <!-- Dashboard -->
              <svg *ngSwitchCase="'dashboard'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 13h8V3H3v10z"></path>
                <path d="M13 21h8v-6h-8v6z"></path>
                <path d="M13 10h8V3h-8v7z"></path>
                <path d="M3 21h8v-6H3v6z"></path>
              </svg>

              <!-- Queue -->
              <svg *ngSwitchCase="'queue'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="4" rx="1"></rect>
                <rect x="3" y="10" width="18" height="4" rx="1"></rect>
                <rect x="3" y="16" width="18" height="4" rx="1"></rect>
              </svg>

              <!-- Reports -->
              <svg *ngSwitchCase="'reports'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                <path d="M8 8h8"></path>
                <path d="M8 12h5"></path>
              </svg>

              <!-- Model Insights -->
              <svg *ngSwitchCase="'insights'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>

              <!-- Settings -->
              <svg *ngSwitchCase="'settings'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01A1.65 1.65 0 009 3.09V3a2 2 0 114 0v.09c0 .66.39 1.26 1 1.51a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06c-.39.39-.58.94-.51 1.51a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"></path>
              </svg>

              <!-- Fallback: empty box -->
              <svg *ngSwitchDefault xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              </svg>

            </ng-container>
          </span>

          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Footer buttons -->
      <div class="sidebar-footer">
        <button class="footer-btn">
          <span class="material-icon" aria-hidden="true">
            <!-- simple user SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <span>Profile</span>
        </button>
        <button class="footer-btn">
          <span class="material-icon" aria-hidden="true">
            <!-- logout SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    /* Overlay (visible only on mobile) */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 40;
    }

    /* Sidebar container */
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 16rem;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.2s ease-in-out;
    }

    .sidebar.open { transform: translateX(0); }

    .sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border-bottom: 1px solid #e5e7eb; }
    .logo { display:flex; align-items:center; gap:0.5rem; }
    .logo-icon { width:2.5rem; height:2.5rem; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#2563eb,#38bdf8); color:white; border-radius:0.5rem; font-size:1.5rem; }
    .logo-text { font-weight:600; font-size:1.1rem; color:#111827; }
    .close-btn { background:none; border:none; font-size:1.5rem; cursor:pointer; color:#6b7280; }

    .nav { flex:1; padding:1rem; overflow-y:auto; }
    .nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border-radius:0.5rem; color:#4b5563; text-decoration:none; transition:all 0.15s; margin-bottom:0.25rem; }
    .nav-item:hover { background:#f3f4f6; color:#111827; }
    .nav-item.active { background:#2563eb; color:white; }

    /* Icon sizing & color */
    .nav-icon { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; }
    .nav-icon svg { width:20px; height:20px; display:block; }

    .nav-label { font-size:0.95rem; }

    .sidebar-footer { border-top:1px solid #e5e7eb; padding:1rem; display:flex; flex-direction:column; gap:0.5rem; }
    .footer-btn { display:flex; align-items:center; gap:0.75rem; border:none; background:none; color:#4b5563; padding:0.75rem; border-radius:0.5rem; cursor:pointer; transition:all 0.15s; }
    .footer-btn:hover { background:#f3f4f6; color:#111827; }

    @media (min-width: 1024px) {
      .sidebar { transform: translateX(0); position:relative; }
      .sidebar-overlay { display:none; }
      .close-btn { display:none; }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/queue', label: 'Inspection Queue', icon: 'queue' },
    { path: '/reports', label: 'Reports', icon: 'reports' },
    { path: '/model-insights', label: 'Model Insights', icon: 'insights' },
    { path: '/settings', label: 'Settings', icon: 'settings' }
  ];
}
