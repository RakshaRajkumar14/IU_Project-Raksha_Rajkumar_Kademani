 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PackageChatComponent } from '../../components/package-chat/package-chat.component';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [CommonModule, PackageChatComponent],
  template: `
    <div class="detail-page">
      <div class="header-actions">
        <button class="btn btn-secondary" (click)="goBack()">← Back</button>
        <div class="page-header">
          <h1>Package {{ packageId }}</h1>
          <p>Detailed inspection results</p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary">🔄 Reprocess</button>
          <button class="btn" style="background: var(--warning); color: white;">⚠️ Report Issue</button>
        </div>
      </div>

      <div class="detail-grid">
        <div class="image-card card">
          <h3>Visual Inspection</h3>
          <div class="image-container">
            <div class="image-placeholder">
              📦 Package Image
            </div>
          </div>
          <div class="image-modes">
            <button class="mode-btn" [class.active]="visualMode === 'original'" (click)="visualMode = 'original'">
              Original
            </button>
            <button class="mode-btn" [class.active]="visualMode === 'gradcam'" (click)="visualMode = 'gradcam'">
              Grad-CAM
            </button>
            <button class="mode-btn" [class.active]="visualMode === 'shap'" (click)="visualMode = 'shap'">
              SHAP
            </button>
          </div>
        </div>

        <div class="info-panel">
          <div class="card">
            <h3>Prediction Summary</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Status</label>
                <span class="badge badge-warning">Damaged</span>
              </div>
              <div class="info-item">
                <label>Severity</label>
                <span class="badge badge-danger">High</span>
              </div>
              <div class="info-item">
                <label>Damage Type</label>
                <p>Dent</p>
              </div>
              <div class="info-item">
                <label>Location</label>
                <p>Top-right corner</p>
              </div>
              <div class="info-item">
                <label>Confidence</label>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 94%"></div>
                </div>
                <span class="confidence-value">94.0%</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>Package Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Package ID</label>
                <p>{{ packageId }}</p>
              </div>
              <div class="info-item">
                <label>Timestamp</label>
                <p>2024-01-15 14:32</p>
              </div>
              <div class="info-item">
                <label>Dimensions</label>
                <p>30x20x15 cm</p>
              </div>
              <div class="info-item">
                <label>Weight</label>
                <p>2.5 kg</p>
              </div>
            </div>
          </div>

          <app-package-chat [packageId]="getPackageIdAsNumber()"></app-package-chat>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-page {
      max-width: 1400px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .page-header {
      flex: 1;
    }

    .page-header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--gray-600);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .image-card h3 {
      margin-bottom: 1.5rem;
    }

    .image-container {
      margin-bottom: 1rem;
    }

    .image-placeholder {
      aspect-ratio: 16/9;
      background: var(--gray-100);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: var(--gray-400);
    }

    .image-modes {
      display: flex;
      gap: 0.5rem;
      background: var(--gray-100);
      padding: 0.25rem;
      border-radius: 8px;
    }

    .mode-btn {
      flex: 1;
      padding: 0.5rem;
      background: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      transition: all 0.2s;
    }

    .mode-btn.active {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-panel h3 {
      margin-bottom: 1.5rem;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item label {
      display: block;
      font-size: 0.875rem;
      color: var(--gray-600);
      margin-bottom: 0.25rem;
    }

    .info-item p {
      font-weight: 500;
    }

    .progress-bar {
      height: 0.5rem;
      background: var(--gray-200);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s;
    }

    .confidence-value {
      font-weight: 600;
      color: var(--primary);
    }

    .btn-secondary {
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .btn-secondary:hover {
      background: var(--gray-300);
    }

    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class PackageDetailComponent implements OnInit {
  packageId: string = '';
  visualMode: 'original' | 'gradcam' | 'shap' = 'original';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.packageId = this.route.snapshot.paramMap.get('id') || '';
  }

  getPackageIdAsNumber(): number {
    return parseInt(this.packageId, 10) || 0;
  }

  goBack(): void {
    this.router.navigate(['/queue']);
  }
}
