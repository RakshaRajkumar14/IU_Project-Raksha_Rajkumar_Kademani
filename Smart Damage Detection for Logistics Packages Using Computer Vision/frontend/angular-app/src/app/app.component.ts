import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <!-- Mobile Menu Button (Hamburger) -->
      <button class="mobile-menu-btn" (click)="openMobileSidebar()" aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <app-sidebar 
        [isCollapsed]="isSidebarCollapsed"
        [isMobileOpen]="isMobileSidebarOpen"
        (toggleCollapse)="onToggleSidebar($event)"
        (closeMobile)="closeMobileSidebar()">
      </app-sidebar>
      
      <main class="main-content" [class.expanded]="isSidebarCollapsed">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
      position: relative;
    }

    .mobile-menu-btn {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 998;
      width: 48px;
      height: 48px;
      border: none;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      color: #667eea;
      transition: all 0.3s ease;
    }

    .mobile-menu-btn:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
    }

    .mobile-menu-btn:active {
      transform: scale(0.95);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      position: relative;
      overflow-x: hidden;
      transition: margin-left 0.3s ease;
    }

    .main-content.expanded {
      margin-left: 85px;
    }

    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: flex;
      }

      .main-content {
        margin-left: 0;
      }

      .main-content.expanded {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'damage-detect-ai';
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;

  onToggleSidebar(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  openMobileSidebar() {
    this.isMobileSidebarOpen = true;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}