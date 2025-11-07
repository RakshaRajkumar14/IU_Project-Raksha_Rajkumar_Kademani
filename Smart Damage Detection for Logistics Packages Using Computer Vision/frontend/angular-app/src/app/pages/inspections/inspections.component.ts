import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InspectionService } from '../../services/inspection.service';

@Component({
  selector: 'app-inspections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inspections">
      <div class="page-header">
        <h1>Inspections</h1>
        <p>Review and manage package damage detections</p>
      </div>

      <div class="inspections-grid">
        <div class="inspections-list">
          <h3>Recent Inspections</h3>
          <div class="inspection-items">
            @for (inspection of inspectionService.inspections(); track inspection.id) {
              <div class="inspection-item card">
                <img [src]="inspection.imageUrl" alt="Package" />
                <div class="inspection-details">
                  <h4>{{ inspection.damageType }}</h4>
                  <p class="timestamp">{{ inspection.timestamp | date:'short' }}</p>
                  <div class="inspection-meta">
                    <span class="badge" [ngClass]="'badge-' + inspection.status">
                      {{ inspection.status }}
                    </span>
                    <span class="confidence">{{ inspection.confidence }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="inspection-detail card">
          <h3>Select an inspection to view details</h3>
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <p>Click on an inspection from the list</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inspections {
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

    .inspections-grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 1.5rem;
    }

    .inspections-list h3 {
      margin-bottom: 1rem;
    }

    .inspection-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: calc(100vh - 250px);
      overflow-y: auto;
    }

    .inspection-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .inspection-item:hover {
      border-color: var(--primary-500);
    }

    .inspection-item img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }

    .inspection-details {
      flex: 1;
      min-width: 0;
    }

    .inspection-details h4 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .timestamp {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-bottom: 0.5rem;
    }

    .inspection-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .confidence {
      font-size: 0.875rem;
      font-weight: 600;
      font-family: monospace;
      color: var(--text-secondary);
    }

    .badge-pending {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .badge-approved {
      background: var(--success-50);
      color: var(--success-700);
    }

    .badge-rejected {
      background: var(--error-50);
      color: var(--error-700);
    }

    .badge-flagged {
      background: var(--warning-50);
      color: var(--warning-700);
    }

    .inspection-detail {
      padding: 2rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      color: var(--text-tertiary);
    }

    .empty-state svg {
      margin-bottom: 1rem;
    }

    @media (max-width: 1024px) {
      .inspections-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InspectionsComponent {
  inspectionService = inject(InspectionService);
}
