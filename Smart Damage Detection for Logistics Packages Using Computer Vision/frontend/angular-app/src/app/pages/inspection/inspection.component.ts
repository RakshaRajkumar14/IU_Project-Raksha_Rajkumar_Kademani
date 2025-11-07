import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Package {
  id: string;
  status: string;
  severity: string;
  timestamp: string;
  confidence: number;
  damageType: string;
}

@Component({
  selector: 'app-inspection-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="queue-page">
      <div class="page-header">
        <h1>Inspection Queue</h1>
        <p>Monitor and manage package inspection results</p>
      </div>

      <div class="filters card">
        <input 
          type="search" 
          placeholder="Search by package ID..."
          [(ngModel)]="searchQuery"
          class="search-input"
        />
        <select [(ngModel)]="statusFilter" class="filter-select">
          <option value="all">All Status</option>
          <option value="damaged">Damaged</option>
          <option value="passed">Passed</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      <div class="table-card card">
        <table class="package-table">
          <thead>
            <tr>
              <th>Package ID</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Damage Type</th>
              <th>Confidence</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pkg of filteredPackages" (click)="viewDetails(pkg.id)">
              <td class="font-medium">{{ pkg.id }}</td>
              <td>
                <span class="badge" [class]="'badge-' + pkg.status">
                  {{ pkg.status }}
                </span>
              </td>
              <td>
                <span class="badge" [class]="'badge-' + pkg.severity">
                  {{ pkg.severity }}
                </span>
              </td>
              <td>{{ pkg.damageType }}</td>
              <td>{{ pkg.confidence > 0 ? (pkg.confidence * 100).toFixed(1) + '%' : '-' }}</td>
              <td class="text-muted">{{ pkg.timestamp }}</td>
              <td>
                <button class="btn btn-primary btn-sm" (click)="viewDetails(pkg.id); $event.stopPropagation()">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .queue-page {
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

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1.5rem;
    }

    .search-input {
      flex: 1;
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      background: white;
    }

    .table-card {
      overflow-x: auto;
    }

    .package-table {
      width: 100%;
      border-collapse: collapse;
    }

    .package-table thead {
      background: var(--gray-50);
    }

    .package-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--gray-700);
      font-size: 0.875rem;
    }

    .package-table td {
      padding: 1rem;
      border-top: 1px solid var(--gray-200);
    }

    .package-table tbody tr {
      cursor: pointer;
      transition: background 0.2s;
    }

    .package-table tbody tr:hover {
      background: var(--gray-50);
    }

    .font-medium {
      font-weight: 500;
    }

    .text-muted {
      color: var(--gray-600);
      font-size: 0.875rem;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
  `]
})
export class InspectionQueueComponent {
  searchQuery = '';
  statusFilter = 'all';

  packages: Package[] = [
    { id: 'PKG-2847', status: 'damaged', severity: 'danger', timestamp: '2024-01-15 14:32', confidence: 0.94, damageType: 'Dent' },
    { id: 'PKG-2846', status: 'passed', severity: 'success', timestamp: '2024-01-15 14:27', confidence: 0.98, damageType: 'None' },
    { id: 'PKG-2845', status: 'damaged', severity: 'warning', timestamp: '2024-01-15 14:24', confidence: 0.87, damageType: 'Scratch' },
    { id: 'PKG-2844', status: 'passed', severity: 'success', timestamp: '2024-01-15 14:20', confidence: 0.96, damageType: 'None' },
    { id: 'PKG-2843', status: 'damaged', severity: 'secondary', timestamp: '2024-01-15 14:17', confidence: 0.82, damageType: 'Surface mark' }
  ];

  constructor(private router: Router) {}

  get filteredPackages(): Package[] {
    return this.packages.filter(pkg => {
      const matchesSearch = pkg.id.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === 'all' || pkg.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/package', id]);
  }
}
