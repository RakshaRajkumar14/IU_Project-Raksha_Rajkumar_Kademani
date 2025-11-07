import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics">
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Comprehensive insights into detection performance and trends</p>
      </div>

      <div class="analytics-grid">
        <div class="chart-card card">
          <h3>Damage Types Distribution</h3>
          <div class="chart-placeholder">
            <p>Pie chart visualization</p>
          </div>
        </div>

        <div class="chart-card card">
          <h3>Model Accuracy Trend</h3>
          <div class="chart-placeholder">
            <p>Line chart visualization</p>
          </div>
        </div>

        <div class="chart-card card full-width">
          <h3>Average Review Duration by Operator</h3>
          <div class="chart-placeholder">
            <p>Bar chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics {
      max-width: 1400px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .chart-card {
      padding: 1.5rem;
    }

    .chart-card.full-width {
      grid-column: 1 / -1;
    }

    .chart-card h3 {
      margin-bottom: 1.5rem;
    }

    .chart-placeholder {
      height: 300px;
      background: var(--bg-secondary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }

    @media (max-width: 1024px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsComponent {}
