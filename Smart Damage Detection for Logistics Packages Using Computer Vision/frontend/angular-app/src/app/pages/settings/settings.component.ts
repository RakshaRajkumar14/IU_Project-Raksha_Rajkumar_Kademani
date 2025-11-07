import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Settings</h1>
        <p>Manage your account and system preferences</p>
      </div>

      <div class="card">
        <h3>Profile Settings</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="profile.name" class="form-input" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="profile.email" class="form-input" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <input type="text" [(ngModel)]="profile.role" class="form-input" disabled />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary">Save Changes</button>
        </div>
      </div>

      <div class="card">
        <h3>Notification Preferences</h3>
        <div class="settings-list">
          <div class="setting-item" *ngFor="let setting of notificationSettings">
            <div class="setting-info">
              <p class="setting-title">{{ setting.title }}</p>
              <p class="setting-description">{{ setting.description }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="setting.enabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>System Settings</h3>
        <div class="settings-list">
          <div class="setting-item" *ngFor="let setting of systemSettings">
            <div class="setting-info">
              <p class="setting-title">{{ setting.title }}</p>
              <p class="setting-description">{{ setting.description }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="setting.enabled" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 900px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--gray-600);
    }

    .card {
      margin-bottom: 1.5rem;
    }

    .card h3 {
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--gray-700);
    }

    .form-input {
      width: 100%;
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
    }

    .form-input:disabled {
      background: var(--gray-100);
      color: var(--gray-500);
    }

    .form-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-200);
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .setting-description {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .toggle {
      position: relative;
      display: inline-block;
      width: 3rem;
      height: 1.5rem;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--gray-300);
      transition: 0.3s;
      border-radius: 1.5rem;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 1.125rem;
      width: 1.125rem;
      left: 0.1875rem;
      bottom: 0.1875rem;
      background-color: white;
      transition: 0.3s;  
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: var(--primary);
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(1.5rem);
    }
  `]
})
export class SettingsComponent {
  profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Quality Inspector'
  };

  notificationSettings = [
    {
      title: 'Email Notifications',
      description: 'Receive email alerts for high-severity damages',
      enabled: true
    },
    {
      title: 'Push Notifications',
      description: 'Get real-time notifications in the app',
      enabled: true
    },
    {
      title: 'Daily Summary',
      description: 'Receive a daily summary of inspection results',
      enabled: false
    }
  ];

  systemSettings = [
    {
      title: 'Auto-refresh Queue',
      description: 'Automatically refresh inspection queue every 30 seconds',
      enabled: true
    },
    {
      title: 'Show XAI by Default',
      description: 'Display Grad-CAM overlay when opening package details',
      enabled: false
    },
    {
      title: 'High Contrast Mode',
      description: 'Increase contrast for better visibility',
      enabled: false
    }
  ];
}
