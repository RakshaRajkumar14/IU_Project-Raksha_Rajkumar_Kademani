import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Overlay -->
    <div class="sidebar-overlay" 
         *ngIf="isMobileOpen" 
         (click)="closeMobileSidebar()">
    </div>

    <!-- Sidebar -->
    <aside class="sidebar" 
           [class.collapsed]="isCollapsed" 
           [class.mobile-open]="isMobileOpen">
      
      <!-- Header Section -->
      <div class="sidebar-header">
        <!-- Logo Icon - AI Themed -->
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <div class="logo-glow"></div>
        </div>

        <!-- Logo Text - Only Expanded -->
        <div class="logo-content" *ngIf="!isCollapsed">
          <h2>DamageDetect AI</h2>
          <p>Computer Vision System</p>
        </div>

        <!-- Desktop Toggle Arrow -->
        <button class="arrow-btn desktop-only" 
                (click)="toggleSidebar()" 
                [attr.aria-label]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline [attr.points]="isCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"></polyline>
          </svg>
        </button>

        <!-- Mobile Close Button -->
        <button class="close-btn mobile-only" 
                (click)="closeMobileSidebar()" 
                aria-label="Close sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Menu Label - Only Expanded -->
      <div class="menu-label" *ngIf="!isCollapsed">
        <span>Navigation</span>
        <div class="menu-line"></div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" 
           routerLinkActive="active" 
           [routerLinkActiveOptions]="{exact: true}" 
           class="nav-item"
           (click)="onNavClick()"
           [title]="isCollapsed ? 'Dashboard' : ''">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span class="nav-text">Dashboard</span>
          <div class="nav-glow"></div>
        </a>

        <a routerLink="/queue" 
           routerLinkActive="active" 
           class="nav-item"
           (click)="onNavClick()"
           [title]="isCollapsed ? 'AI Detections' : ''">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <span class="nav-text">AI Detections</span>
          <div class="nav-glow"></div>
        </a>

        <a routerLink="/reports" 
           routerLinkActive="active" 
           class="nav-item"
           (click)="onNavClick()"
           [title]="isCollapsed ? 'Analytics' : ''">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <span class="nav-text">Analytics</span>
          <div class="nav-glow"></div>
        </a>

        <a routerLink="/settings" 
           routerLinkActive="active" 
           class="nav-item"
           (click)="onNavClick()"
           [title]="isCollapsed ? 'Settings' : ''">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m4.22-13.66l-4.24 4.24m0 5.66l4.24 4.24M23 12h-6m-6 0H5m13.66-4.22l-4.24 4.24m-5.66 0l-4.24-4.24"/>
            </svg>
          </div>
          <span class="nav-text">Settings</span>
          <div class="nav-glow"></div>
        </a>
      </nav>

      <!-- User Section at Bottom -->
      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="user-info">
          <div class="user-avatar">
            <span>{{ getUserInitials() }}</span>
          </div>
          <div class="user-details">
            <p class="user-name">Raksha Rajkumar</p>
            <p class="user-role">AI Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    /* OVERLAY */
    .sidebar-overlay {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* SIDEBAR - AI GLASS EFFECT */
    .sidebar {
      width: 260px;
      height: 100vh;
      background: rgba(10, 25, 41, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(0, 255, 255, 0.2);
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 30px rgba(0, 255, 255, 0.15);
      z-index: 1000;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(180deg, 
        transparent 0%,
        rgba(0, 255, 255, 0.5) 50%,
        transparent 100%
      );
      animation: scanline 3s linear infinite;
    }

    @keyframes scanline {
      0%, 100% { transform: translateY(-100%); }
      50% { transform: translateY(100%); }
    }

    .sidebar.collapsed {
      width: 85px;
    }

    /* HEADER */
    .sidebar-header {
      display: flex;
      align-items: center;
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.15);
      gap: 0.875rem;
      position: relative;
    }

    .sidebar-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%,
        rgba(0, 255, 255, 0.5) 50%,
        transparent 100%
      );
    }

    .sidebar.collapsed .sidebar-header {
      justify-content: center;
      padding: 1.25rem 0.5rem;
      gap: 0.5rem;
    }

    /* LOGO ICON - AI THEMED */
    .logo-icon {
      width: 50px;
      height: 50px;
      min-width: 50px;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.6),
                  0 0 40px rgba(0, 255, 255, 0.3);
      animation: logoPulse 3s ease-in-out infinite;
    }

    @keyframes logoPulse {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.6),
                    0 0 40px rgba(0, 255, 255, 0.3);
      }
      50% { 
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.8),
                    0 0 60px rgba(0, 255, 255, 0.5);
      }
    }

    .logo-icon svg {
      color: #0a0e27;
      position: relative;
      z-index: 2;
    }

    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      animation: rotate 10s linear infinite;
    }

    @keyframes rotate {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* LOGO CONTENT */
    .logo-content {
      flex: 1;
      min-width: 0;
    }

    .logo-content h2 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #00ffff;
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    }

    .logo-content p {
      font-size: 0.7rem;
      color: rgba(0, 255, 255, 0.6);
      margin: 0.2rem 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ARROW BUTTON */
    .arrow-btn,
    .close-btn {
      width: 26px;
      height: 26px;
      min-width: 26px;
      border: 1px solid rgba(0, 255, 255, 0.3);
      background: rgba(0, 255, 255, 0.1);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #00ffff;
      flex-shrink: 0;
    }

    .arrow-btn:hover,
    .close-btn:hover {
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      color: #0a0e27;
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
      border-color: transparent;
    }

    .arrow-btn:active,
    .close-btn:active {
      transform: scale(0.95);
    }

    .mobile-only {
      display: none;
    }

    .desktop-only {
      display: flex;
    }

    /* MENU LABEL */
    .menu-label {
      padding: 1.25rem 1.25rem 0.5rem;
      font-size: 0.65rem;
      font-weight: 700;
      color: rgba(0, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .menu-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, 
        rgba(0, 255, 255, 0.3) 0%,
        transparent 100%
      );
    }

    /* NAVIGATION */
    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
    }

    .sidebar.collapsed .sidebar-nav {
      align-items: center;
      padding: 1rem 0;
      gap: 0.75rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border: 1px solid transparent;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, 
        rgba(0, 255, 255, 0.2) 0%,
        transparent 100%
      );
      transition: width 0.3s ease;
    }

    .nav-glow {
      position: absolute;
      top: 50%;
      left: 0;
      width: 4px;
      height: 0;
      background: linear-gradient(180deg, 
        transparent 0%,
        #00ffff 50%,
        transparent 100%
      );
      transform: translateY(-50%);
      transition: height 0.3s ease;
    }

    .sidebar.collapsed .nav-item {
      width: 50px;
      height: 50px;
      padding: 0;
      justify-content: center;
      border-radius: 12px;
    }

    .nav-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    }

    .nav-text {
      white-space: nowrap;
      position: relative;
      z-index: 2;
    }

    .sidebar.collapsed .nav-text {
      display: none;
    }

    .nav-item:hover {
      background: rgba(0, 255, 255, 0.08);
      color: #00ffff;
      border-color: rgba(0, 255, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
    }

    .nav-item:hover::before {
      width: 100%;
    }

    .nav-item:hover .nav-glow {
      height: 70%;
    }

    .sidebar:not(.collapsed) .nav-item:hover {
      transform: translateX(4px);
    }

    .sidebar.collapsed .nav-item:hover {
      transform: scale(1.08);
    }

    .nav-item.active {
      background: linear-gradient(135deg, 
        rgba(0, 255, 255, 0.2) 0%, 
        rgba(0, 255, 136, 0.2) 100%
      );
      color: #00ffff;
      border-color: rgba(0, 255, 255, 0.5);
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.3),
                  inset 0 0 20px rgba(0, 255, 255, 0.1);
      font-weight: 600;
    }

    .nav-item.active .nav-glow {
      height: 80%;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
    }

    .nav-item.active::before {
      width: 100%;
    }

    /* USER SECTION */
    .sidebar-footer {
      padding: 1.25rem;
      border-top: 1px solid rgba(0, 255, 255, 0.15);
      position: relative;
    }

    .sidebar-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%,
        rgba(0, 255, 255, 0.5) 50%,
        transparent 100%
      );
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #0a0e27;
      font-size: 0.9rem;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(0, 255, 255, 0.6);
      margin: 0.15rem 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* SCROLLBAR */
    .sidebar-nav::-webkit-scrollbar {
      width: 5px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 255, 0.3);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 255, 255, 0.5);
    }

    /* MOBILE STYLES */
    @media (max-width: 768px) {
      .sidebar-overlay {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .sidebar-overlay {
        opacity: 1;
        pointer-events: all;
        animation: fadeIn 0.3s ease;
      }

      .sidebar {
        transform: translateX(-100%);
        width: 260px;
        transition: transform 0.3s ease;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 260px;
      }

      .mobile-only {
        display: flex;
      }

      .desktop-only {
        display: none;
      }

      .sidebar-header {
        justify-content: space-between;
        padding: 1.25rem;
      }

      .logo-content {
        display: block !important;
      }

      .nav-text {
        display: inline !important;
      }

      .nav-item {
        width: auto !important;
        height: auto !important;
        padding: 0.875rem 1rem !important;
        justify-content: flex-start !important;
      }

      .sidebar-footer {
        display: block !important;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() toggleCollapse = new EventEmitter<boolean>();
  @Output() closeMobile = new EventEmitter<void>();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleCollapse.emit(this.isCollapsed);
  }

  closeMobileSidebar() {
    this.isMobileOpen = false;
    this.closeMobile.emit();
  }

  onNavClick() {
    if (window.innerWidth <= 768) {
      this.closeMobileSidebar();
    }
  }

  getUserInitials(): string {
    return 'RR'; // Raksha Rajkumar
  }
}