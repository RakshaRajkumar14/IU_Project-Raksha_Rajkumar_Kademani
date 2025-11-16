import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Dashboard3DBackgroundComponent } from '../dashboard/ddashboard-3d-background.component';

interface DetectedDamage {
  id: number;
  type: string;
  severity: 'Severe' | 'Moderate' | 'Minor';
  confidence: number; // percent 0-100
  dimensions: string;
  bbox: number[];
  color: string;
}

interface DetectionResponse {
  success: boolean;
  detections: DetectedDamage[];
  annotated_image: string;
  gradcam_image?: string;
  shap_image?: string;
  total_damages: number;
  severity_counts: {
    severe: number;
    moderate: number;
    minor: number;
  };
  is_rejected: boolean;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule, Dashboard3DBackgroundComponent],
  template: `
    <!-- 3D AI Background -->
    <app-dashboard-3d-background></app-dashboard-3d-background>

    <div class="upload-container">
      <!-- Control Panel -->
      <div class="control-panel glass-effect">
        <h2 class="panel-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          Package Inspection
        </h2>
        <div class="controls">
          <button class="control-btn danger-badge" *ngIf="hasDetections">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {{ detectionResult?.total_damages }} damages found
          </button>
          <button class="control-btn secondary" (click)="toggleBoxes()" *ngIf="hasDetections">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ showBoxes ? 'Hide' : 'Show' }} Boxes
          </button>
          <button class="control-btn secondary" (click)="reset()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div class="content-grid">
        <!-- Left Side: Inspection Area -->
        <div class="inspection-section">
          <!-- Upload Zone -->
          <div class="image-display glass-effect" *ngIf="!uploadedImage && !isProcessing">
            <div class="upload-zone" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <h3>Upload Package Image</h3>
              <p>Drag & drop or click to select an image for AI analysis</p>
              <button class="upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                Choose File
              </button>
              <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none;">
            </div>
          </div>

          <!-- Processing Loader -->
          <div class="image-display glass-effect" *ngIf="isProcessing">
            <div class="processing-loader">
              <div class="ai-scanner">
                <div class="scan-line"></div>
              </div>
              <h3>AI Processing...</h3>
              <p>Analyzing damage with YOLOv8</p>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="processingProgress"></div>
              </div>
            </div>
          </div>

          <!-- Detection Results -->
          <div class="image-display glass-effect" *ngIf="uploadedImage && !isProcessing">
            <div class="detection-badge" *ngIf="hasDetections">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {{ detectionResult?.total_damages }} damages detected
            </div>
            
            <!-- Tabs for different views -->
            <div class="view-tabs">
              <button class="tab-btn" [class.active]="currentView === 'original'" (click)="currentView = 'original'">
                Original
              </button>
              <button class="tab-btn" [class.active]="currentView === 'annotated'" (click)="currentView = 'annotated'" *ngIf="detectionResult?.annotated_image">
                Detection
              </button>
              <button class="tab-btn" [class.active]="currentView === 'gradcam'" (click)="currentView = 'gradcam'" *ngIf="detectionResult?.gradcam_image">
                GradCAM
              </button>
              <button class="tab-btn" [class.active]="currentView === 'shap'" (click)="currentView = 'shap'" *ngIf="detectionResult?.shap_image">
                SHAP
              </button>
            </div>

            <img [src]="getDisplayImage()" alt="Package inspection" class="package-image">
          </div>

          <!-- Explainability Section -->
          <div class="explainability-section glass-effect" *ngIf="hasDetections">
            <h3 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              AI Explainability
            </h3>
            <div class="explainability-cards">
              <div class="explainability-card">
                <div class="card-icon gradcam">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h4>GradCAM</h4>
                <p>Visual attention heatmap showing which regions the AI focused on for damage detection</p>
                <button class="view-btn" (click)="currentView = 'gradcam'" *ngIf="detectionResult?.gradcam_image">
                  View Heatmap
                </button>
              </div>
              <div class="explainability-card">
                <div class="card-icon shap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <h4>SHAP Analysis</h4>
                <p>Feature importance showing which parts contributed most to the detection decision</p>
                <button class="view-btn" (click)="currentView = 'shap'" *ngIf="detectionResult?.shap_image">
                  View Analysis
                </button>
              </div>
            </div>
          </div>

          <!-- Package Assessment -->
          <div class="assessment-section glass-effect" *ngIf="hasDetections">
            <h3 class="assessment-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              Package Assessment
            </h3>

            <div class="rejection-alert" *ngIf="detectionResult?.is_rejected">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <div>
                <h4>Package Rejected</h4>
                <p>Severe damage detected - Cannot accept</p>
              </div>
            </div>

            <div class="severity-grid">
              <div class="severity-card severe">
                <div class="severity-number">{{ detectionResult?.severity_counts?.severe || 0 }}</div>
                <div class="severity-label">Severe</div>
              </div>
              <div class="severity-card moderate">
                <div class="severity-number">{{ detectionResult?.severity_counts?.moderate || 0 }}</div>
                <div class="severity-label">Moderate</div>
              </div>
              <div class="severity-card minor">
                <div class="severity-number">{{ detectionResult?.severity_counts?.minor || 0 }}</div>
                <div class="severity-label">Minor</div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="action-btn primary" (click)="downloadReport()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download Inspection Report
              </button>
              <button class="action-btn secondary" (click)="exportData()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Export Data
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Damage Analysis -->
        <div class="analysis-section" *ngIf="hasDetections">
          <div class="analysis-card glass-effect">
            <div class="card-header">
              <h2>Damage Analysis</h2>
              <span class="damage-count">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {{ detectionResult?.total_damages }}
              </span>
            </div>

            <!-- Summary Cards -->
            <div class="summary-cards">
              <div class="summary-card severe">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <div class="summary-info">
                  <div class="summary-number">{{ detectionResult?.severity_counts?.severe || 0 }}</div>
                  <div class="summary-label">Severe</div>
                </div>
              </div>
              <div class="summary-card moderate">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <div class="summary-info">
                  <div class="summary-number">{{ detectionResult?.severity_counts?.moderate || 0 }}</div>
                  <div class="summary-label">Moderate</div>
                </div>
              </div>
              <div class="summary-card minor">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <div class="summary-info">
                  <div class="summary-number">{{ detectionResult?.severity_counts?.minor || 0 }}</div>
                  <div class="summary-label">Minor</div>
                </div>
              </div>
            </div>

            <!-- Detected Damages List -->
            <div class="damages-header">
              <h3>Detected Damages</h3>
              <span class="damages-sort">Severity</span>
            </div>

            <div class="damages-list">
              <div class="damage-item" *ngFor="let damage of detectionResult?.detections">
                <div class="damage-info">
                  <div class="damage-icon" [style.color]="damage.color">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" *ngIf="damage.severity !== 'Minor'"/>
                      <circle cx="12" cy="12" r="10" *ngIf="damage.severity === 'Minor'"/>
                    </svg>
                  </div>
                  <div class="damage-details">
                    <div class="damage-name">{{ damage.type }}</div>
                    <div class="damage-confidence">
                      <span class="severity-badge" [ngClass]="damage.severity.toLowerCase()">
                        {{ damage.severity }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="damage-stats">
                  <div class="confidence-bar">
                    <div class="confidence-fill" 
                         [style.width.%]="damage.confidence"
                         [style.background]="damage.color">
                    </div>
                  </div>
                  <div class="damage-meta">
                    <span>Confidence: {{ damage.confidence.toFixed(1) }}%</span>
                    <span>{{ damage.dimensions }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  `,
  styles: [ /* same styles as in your pasted code */ `
    /* styles omitted here for brevity in the editor; keep the styles from your version */
  ` ]
})
export class UploadComponent {
  private apiUrl = 'http://localhost:5000/api'; // Update with your backend URL

  uploadedImage: string | null = null;
  selectedFile: File | null = null;
  showBoxes = true;
  hasDetections = false;
  isProcessing = false;
  processingProgress = 0;
  currentView: 'original' | 'annotated' | 'gradcam' | 'shap' = 'original';
  detectionResult: DetectionResponse | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedImage = e.target.result;
      this.processImage();
    };
    reader.readAsDataURL(file);
  }

  async processImage() {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    this.processingProgress = 0;
    this.hasDetections = false;

    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('generate_gradcam', 'true');
    formData.append('generate_shap', 'true');

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.processingProgress < 90) {
        this.processingProgress += 10;
      }
    }, 200);

    try {
      const obs = this.http.post<DetectionResponse>(`${this.apiUrl}/detect`, formData);
      this.detectionResult = await firstValueFrom(obs);

      clearInterval(progressInterval);
      this.processingProgress = 100;

      setTimeout(() => {
        this.isProcessing = false;
        this.hasDetections = this.detectionResult!.success && this.detectionResult!.total_damages > 0;
        this.currentView = this.hasDetections ? 'annotated' : 'original';
      }, 500);
    } catch (error) {
      console.error('Detection error:', error);
      clearInterval(progressInterval);
      this.isProcessing = false;
      alert('Error processing image. Please try again.');
    }
  }

  getDisplayImage(): string {
    if (!this.detectionResult) return this.uploadedImage || '';

    switch (this.currentView) {
      case 'annotated':
        return this.detectionResult.annotated_image || this.uploadedImage || '';
      case 'gradcam':
        return this.detectionResult.gradcam_image || this.uploadedImage || '';
      case 'shap':
        return this.detectionResult.shap_image || this.uploadedImage || '';
      default:
        return this.uploadedImage || '';
    }
  }

  toggleBoxes() {
    this.showBoxes = !this.showBoxes;
  }

  reset() {
    this.uploadedImage = null;
    this.selectedFile = null;
    this.hasDetections = false;
    this.isProcessing = false;
    this.processingProgress = 0;
    this.currentView = 'original';
    this.detectionResult = null;
  }

  downloadReport() {
    if (!this.detectionResult) return;
    
    const reportData = JSON.stringify(this.detectionResult, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-report-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportData() {
    if (!this.detectionResult) return;
    
    // Export as CSV
    let csv = 'Type,Severity,Confidence,Dimensions\n';
    this.detectionResult.detections.forEach(damage => {
      csv += `${damage.type},${damage.severity},${damage.confidence},${damage.dimensions}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `damage-data-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}