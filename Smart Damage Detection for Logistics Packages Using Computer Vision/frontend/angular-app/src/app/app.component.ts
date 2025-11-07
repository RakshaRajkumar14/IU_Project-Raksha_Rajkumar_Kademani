import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopBarComponent } from './components/topbar/topbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopBarComponent],
  template: `
    <div class="app-container">
      <app-sidebar [isOpen]="sidebarOpen" (closeMenu)="closeSidebar()"></app-sidebar>
      <div class="main-content">
        <app-top-bar (menuClick)="toggleSidebar()"></app-top-bar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      outline: 2px dashed red;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: var(--gray-50);
    }

    @media (max-width: 768px) {
      .content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'PackageAI - Smart Damage Detection';

  // Add the boolean used in the template
  sidebarOpen: boolean = false;

  // Methods called from the template (safer & easier to unit test)
  openSidebar() { this.sidebarOpen = true; }
  closeSidebar() { this.sidebarOpen = false; }
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
}
