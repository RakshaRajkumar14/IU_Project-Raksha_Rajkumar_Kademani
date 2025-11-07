import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
// import { DetectService } from '../../services/detect.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Monitor package inspections and AI detection performance</p>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        <!-- ... keep your stat cards unchanged ... -->
        <div class="stat-card card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Total Inspected Today</p>
              <h2 class="stat-value">1,247</h2>
              <p class="stat-trend success">+12% from yesterday</p>
            </div>
            <div class="stat-icon" style="background: #eff6ff; color: #2563eb;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Damaged Packages</p>
              <h2 class="stat-value">89</h2>
              <p class="stat-trend warning">+5% from yesterday</p>
            </div>
            <div class="stat-icon" style="background: #fef2f2; color: #dc2626;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Model Accuracy</p>
              <h2 class="stat-value">94.2%</h2>
              <p class="stat-trend success">+2.1% this week</p>
            </div>
            <div class="stat-icon" style="background: #ecfdf5; color: #059669;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-content">
            <div class="stat-info">
              <p class="stat-label">Pending Reviews</p>
              <h2 class="stat-value">12</h2>
            </div>
            <div class="stat-icon" style="background: #f5f3ff; color: #7c3aed;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart + Upload area -->
      <div class="content-grid">
        <div class="chart-card card">
          <h3>Detection Trends</h3>
          <div class="chart-placeholder">
            <p>📈 Chart visualization will appear here</p>
          </div>
        </div>

        <div class="upload-card card">
          <div class="upload-content">
            <div class="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3>Upload Package Image</h3>
            <p>Click below to choose an image from your device</p>

            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onFileSelected($event)"
              hidden
            />

            <button class="btn btn-primary" (click)="fileInput.click()">
              Select Image
            </button>

            <button class="btn" (click)="uploadSelected()" [disabled]="!selectedFile || uploading">
              Upload & Detect
            </button>

            <span *ngIf="uploading">Uploading: {{ uploadProgress }}%</span>

            <div class="preview" *ngIf="previewUrl">
              <h4>Preview:</h4>
              <div style="position:relative; display:inline-block;">
                <img #imgEl [src]="previewUrl" alt="Selected Image" />
                <canvas #canvasEl style="position:absolute; left:0; top:0; pointer-events:none;"></canvas>
              </div>
              <div style="margin-top:0.5rem;">
                <button class="btn" (click)="clearSelection()">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of activities">
            <div class="activity-icon" [ngClass]="activity.status">
              <ng-container [ngSwitch]="activity.status">
                <svg *ngSwitchCase="'damaged'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>

                <svg *ngSwitchCase="'passed'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>

                <svg *ngSwitchDefault width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </ng-container>
            </div>

            <div class="activity-details">
              <div class="activity-header">
                <span class="activity-id">{{ activity.id }}</span>
                <span class="badge" [class]="'badge-' + activity.severity">{{ activity.severity }}</span>
              </div>
              <p class="activity-type">{{ activity.type }}</p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { max-width: 1400px; margin: 0 auto; padding: 1rem; }

    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin-bottom: 0.25rem; font-size: 1.8rem; }
    .page-header p { color: #6b7280; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .stat-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .stat-label { font-size: 0.9rem; color: #6b7280; }
    .stat-value { font-size: 1.8rem; font-weight: 700; margin: 0.25rem 0; }
    .stat-trend { font-size: 0.875rem; font-weight: 500; }
    .success { color: #059669; }
    .warning { color: #d97706; }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }

    .chart-card, .upload-card { background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .chart-placeholder {
      height: 300px;
      border-radius: 8px;
      background: #f3f4f6;
      display:flex; align-items:center; justify-content:center;
      color: #9ca3af;
    }

    .upload-content { text-align: center; }
    .upload-icon {
      width: 80px; height: 80px; border-radius: 50%;
      background: #eff6ff; color: #2563eb;
      display:flex; align-items:center; justify-content:center;
      margin: 0 auto 1rem;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .btn-primary {
      background: #2563eb; color: white; border: none;
      border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer;
    }

    .preview {
      margin-top: 1.5rem;
    }

    .preview h4 {
      margin-bottom: 0.5rem;
    }

    .preview img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      margin-bottom: 0.5rem;
      display: block;
    }

    .activity-section { margin-top: 2rem; }
    .activity-list { display: flex; flex-direction: column; gap: 1rem; }

    .activity-item {
      background: white; padding: 0.75rem 1rem; border-radius: 8px;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .activity-icon {
      width: 44px; height: 44px; border-radius: 8px;
      display:flex; align-items:center; justify-content:center;
    }
    .activity-icon.damaged { background: #fffbeb; color: #b45309; }
    .activity-icon.passed { background: #ecfdf5; color: #065f46; }

    .activity-id { font-weight: 600; }
    .badge-danger { background: #fee2e2; color: #991b1b; padding: 0.1rem 0.45rem; border-radius: 6px; font-size: 0.75rem; }
    .badge-warning { background: #fff7ed; color: #92400e; padding: 0.1rem 0.45rem; border-radius: 6px; font-size: 0.75rem; }
    .badge-success { background: #ecfdf5; color: #065f46; padding: 0.1rem 0.45rem; border-radius: 6px; font-size: 0.75rem; }

    .activity-type { margin: 0; color: #6b7280; }
    .activity-time { margin: 0; font-size: 0.8rem; color: #9ca3af; }

    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imgEl') imgEl!: ElementRef<HTMLImageElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  // detections returned by backend
  detections: Array<{ id: string; class_name: string; score: number; bbox: number[] }> = [];

  origW = 0;
  origH = 0;

  activities = [
    { id: 'PKG-2847', status: 'damaged', severity: 'danger', time: '2 min ago', type: 'Dent detected' },
    { id: 'PKG-2846', status: 'passed', severity: 'success', time: '5 min ago', type: 'No damage' },
    { id: 'PKG-2845', status: 'damaged', severity: 'warning', time: '8 min ago', type: 'Minor scratch' },
    { id: 'PKG-2844', status: 'passed', severity: 'success', time: '12 min ago', type: 'No damage' }
  ];

  constructor() {}

  ngAfterViewInit(): void {
    // nothing to init yet
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    this.selectedFile = file;
    // revoke previous preview if any
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = URL.createObjectURL(file);
    this.detections = [];
    this.uploadProgress = 0;

    // resize canvas once image loads
    setTimeout(() => {
      const img = this.imgEl?.nativeElement;
      if (img && img.complete) {
        this.onImageLoad();
      }
    }, 250);
  }

  clearSelection() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    this.selectedFile = null;
    this.detections = [];
    this.clearCanvas();
  }

  uploadSelected() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadProgress = 0;
    const fd = new FormData();
    fd.append('file', this.selectedFile);
    // optionally append tracking code: fd.append('tracking_code','PKG-1234');

    // TODO: Implement API call
    console.log('File selected for upload:', this.selectedFile.name);
    this.uploading = false;
    
    // Mock detection result
    this.detections = [{
      id: 'mock1',
      class_name: 'Dent',
      score: 0.85,
      bbox: [100, 100, 200, 200]
    }];
    
    setTimeout(() => this.onImageLoad(), 200);
    
    // Add mock activity
    this.activities.unshift({
      id: `PKG-${Math.random().toString(36).slice(2,9).toUpperCase()}`,
      status: 'damaged',
      severity: 'danger',
      time: 'just now',
      type: 'Mock Detection'
    });
  }

  onImageLoad() {
    const img = this.imgEl.nativeElement;
    this.origW = img.naturalWidth;
    this.origH = img.naturalHeight;
    this.resizeCanvas();
    this.drawBoxes();
  }

  resizeCanvas() {
    const img = this.imgEl.nativeElement;
    const canvas = this.canvasEl.nativeElement;
    if (!canvas || !img) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    canvas.style.left = img.offsetLeft + 'px';
    canvas.style.top = img.offsetTop + 'px';
  }

  clearCanvas() {
    const canvas = this.canvasEl?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  drawBoxes() {
    const img = this.imgEl?.nativeElement;
    const canvas = this.canvasEl?.nativeElement;
    if (!img || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.detections || this.detections.length === 0) return;

    const scaleX = img.clientWidth / this.origW;
    const scaleY = img.clientHeight / this.origH;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';

    this.detections.forEach(d => {
      const [x1, y1, x2, y2] = d.bbox;
      const x = x1 * scaleX;
      const y = y1 * scaleY;
      const w = (x2 - x1) * scaleX;
      const h = (y2 - y1) * scaleY;
      ctx.strokeStyle = d.score > 0.5 ? 'lime' : 'orange';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.strokeRect(x, y, w, h);
      const label = `${d.class_name} ${(d.score * 100).toFixed(0)}%`;
      // background for label
      const textWidth = ctx.measureText(label).width + 8;
      ctx.fillRect(x, y - 18, textWidth, 18);
      ctx.fillStyle = '#000';
      ctx.fillText(label, x + 4, y - 4);
    });
  }
}
