import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <h1>Reports</h1>
        <p>Download and review inspection and performance reports</p>
      </div>

      <div class="card generate-card">
        <div class="generate-content">
          <div>
            <h3>Generate New Report</h3>
            <p>Create a custom report for a specific date range</p>
          </div>
          <button class="btn btn-primary">📅 Generate Report</button>
        </div>
      </div>

      <div class="reports-grid">
        <div class="card report-card" *ngFor="let report of reports">
          <div class="report-icon">📄</div>
          <div class="report-info">
            <h4>{{ report.title }}</h4>
            <p class="report-date">{{ report.date }}</p>
            <div class="report-meta">
              <span>{{ report.type }}</span>
              <span>{{ report.size }}</span>
            </div>
          </div>
          <button class="btn btn-secondary icon-btn">⬇️</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      max-width: 1400px;
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

    .generate-card {
      margin-bottom: 2rem;
    }

    .generate-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .generate-content h3 {
      margin-bottom: 0.5rem;
    }

    .generate-content p {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .report-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .report-icon {
      width: 3rem;
      height: 3rem;
      background: var(--gray-100);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .report-info {
      flex: 1;
    }

    .report-info h4 {
      margin-bottom: 0.25rem;
    }

    .report-date {
      color: var(--gray-600);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .report-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .icon-btn {
      padding: 0.5rem;
      min-width: auto;
    }
  `]
})
export class ReportsComponent {
  reports = [
    { title: 'Daily Inspection Summary', date: '2024-01-15', type: 'Daily', size: '2.4 MB' },
    { title: 'Weekly Performance Report', date: '2024-01-08 - 2024-01-14', type: 'Weekly', size: '5.8 MB' },
    { title: 'Monthly Analytics', date: 'December 2023', type: 'Monthly', size: '12.3 MB' },
    { title: 'Model Training Report', date: '2024-01-10', type: 'Model', size: '8.1 MB' }
  ];
}
