import { Component, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Dashboard3DBackgroundComponent } from '../dashboard/dashboard-3d-background.component';
import { AuthService } from '../../services/auth.service';

interface DetectedDamage {
  id: number;
  class_name: string;
  severity: string;
  score: number;
  bbox: number[];
  color: string;
  dimensions: string;
}

interface DetectionResponse {
  success: boolean;
  detections: DetectedDamage[];
  annotated_image_url: string;
  gradcam_url?: string;
  shap_url?: string;
  total_damages: number;
  severity_counts: {
    severe: number;
    moderate: number;
    minor: number;
  };
  status: string;
  tracking_code: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule, Dashboard3DBackgroundComponent],
  template: `
    <app-dashboard-3d-background></app-dashboard-3d-background>

    <div class="upload-container">
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <div>
            <h1>Smart Damage Detection</h1>
            <p>AI-powered package inspection for logistics</p>
          </div>
        </div>
        <div class="inspector-badge">
          <span class="badge-label">Inspector ID</span>
          <span class="badge-value">LOG-2025-001</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div class="error-alert" *ngIf="errorMessage">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <div>
          <h4>Error</h4>
          <p>{{ errorMessage }}</p>
        </div>
        <button (click)="errorMessage = null" class="close-btn">×</button>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Left Panel -->
        <div class="left-panel">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
              <button class="control-btn primary" (click)="runDetection()" *ngIf="uploadedImage && !isProcessing && !hasDetections">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run Detection
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

          <!-- Upload Zone -->
          <div class="image-display glass-effect" *ngIf="!uploadedImage && !isProcessing">
            <div class="upload-zone" (click)="openFileInput()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
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

          <!-- Processing -->
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
              <p class="progress-text">{{ getProgressText() }}</p>
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
            
            <img [src]="getDisplayImage()" alt="Package inspection" class="package-image">
          </div>

          <!-- Package Assessment -->
          <div class="assessment-section glass-effect" *ngIf="hasDetections">
            <h3 class="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              Package Assessment
            </h3>

            <div class="rejection-alert" *ngIf="detectionResult?.status === 'damaged' && getSeverityCount('severe') > 0">
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
                <div class="severity-number">{{ getSeverityCount('severe') }}</div>
                <div class="severity-label">Severe</div>
              </div>
              <div class="severity-card moderate">
                <div class="severity-number">{{ getSeverityCount('moderate') }}</div>
                <div class="severity-label">Moderate</div>
              </div>
              <div class="severity-card minor">
                <div class="severity-number">{{ getSeverityCount('minor') }}</div>
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
              <button class="action-btn secondary" (click)="openFileInput()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                More Photos
              </button>
              <button class="action-btn secondary" (click)="downloadOperatorReport()">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2v7M12 22v-7M5 7h14M5 17h14"/>
  </svg>
  Download Operator Report
</button>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="right-panel" *ngIf="hasDetections">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" *ngIf="damage.severity !== 'secondary'">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" *ngIf="damage.severity === 'secondary'">
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <div class="damage-details">
                    <div class="damage-name">{{ damage.class_name }}</div>
                    <span class="severity-badge" [ngClass]="getSeverityClass(damage.severity)">
                      {{ getSeverityLabel(damage.severity) }}
                    </span>
                  </div>
                </div>
                <div class="damage-stats">
                  <div class="confidence-bar">
                    <div class="confidence-fill" 
                         [style.width.%]="damage.score * 100"
                         [style.background]="damage.color">
                    </div>
                  </div>
                  <div class="damage-meta">
                    <span>Confidence: {{ (damage.score * 100).toFixed(1) }}%</span>
                    <span>{{ damage.dimensions }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Damage Types Summary -->
            <div class="damage-types-section">
              <h3>Damage Types</h3>
              <div class="damage-type-list">
                <div class="damage-type-item" *ngFor="let type of getDamageTypeSummary()">
                  <div class="type-info">
                    <span class="type-name">{{ type.name }}</span>
                    <span class="type-count">{{ type.count }}</span>
                  </div>
                  <div class="type-bar" [style.background]="type.color"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Explainability Section -->
          <div class="explainability-section glass-effect" *ngIf="detectionResult?.gradcam_url || detectionResult?.shap_url">
            <button class="preview-btn" (click)="toggleExplainability()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              {{ showExplainability ? 'Hide' : 'Preview' }} AI Explainability
            </button>
          </div>
        </div>
      </div>

      <!-- Explainability Modal -->
      <div class="explainability-modal" *ngIf="showExplainability" (click)="toggleExplainability()">
        <div class="modal-content glass-effect" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="toggleExplainability()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <h2>AI Explainability Analysis</h2>
          <!-- BEGIN: Operator Textual Damage Explanation -->
<div class="damage-type-header">
  <span class="damage-type-label">Damage Type:</span>
  <span class="damage-type-value">{{ getPrimaryDamage()?.class_name || '-' }}</span>
  <span class="confidence-badge" *ngIf="getPrimaryDamage()">
    {{ getPrimaryConfidencePercent() }}%
  </span>
</div>

<div class="explanation-sections" *ngIf="primaryDamage; else noDamageBlock">
  <div class="explain-section"><strong>📋 What happened:</strong>
    <p>{{ primaryExplanation?.what }}</p>
  </div>
  <div class="explain-section"><strong>⚠️ Why it matters:</strong>
    <p>{{ primaryExplanation?.why }}</p>
  </div>
  <div class="explain-section"><strong>🔧 Likely cause:</strong>
    <p>{{ primaryExplanation?.cause }}</p>
  </div>
  <div class="explain-section recommendation"><strong>✅ Recommendation:</strong>
    <p>{{ primaryExplanation?.recommendation }}</p>
  </div>
</div>

<ng-template #noDamageBlock>
  <div style="color:#ffa500; font-size:16px;">No damage detected on this package.</div>
</ng-template>
<!-- END: Operator Textual Damage Explanation -->
          
          <div class="explainability-tabs">
            <button class="tab-btn" [class.active]="explainView === 'gradcam'" (click)="explainView = 'gradcam'" *ngIf="detectionResult?.gradcam_url">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              GradCAM
            </button>
            <button class="tab-btn" [class.active]="explainView === 'shap'" (click)="explainView = 'shap'" *ngIf="detectionResult?.shap_url">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
              SHAP
            </button>
          </div>

          <div class="explainability-content">
            <div class="explain-image-wrapper" *ngIf="explainView === 'gradcam' && detectionResult?.gradcam_url">
              <img [src]="detectionResult?.gradcam_url || ''" alt="GradCAM Heatmap">
              <div class="explain-description">
                <h4>Gradient-weighted Class Activation Mapping</h4>
                <p>Highlights the regions that most influenced the AI's damage detection decision. Warmer colors (red/yellow) indicate higher importance.</p>
              </div>
            </div>
            <div class="explain-image-wrapper" *ngIf="explainView === 'shap' && detectionResult?.shap_url">
              <img [src]="detectionResult?.shap_url || ''" alt="SHAP Analysis">
              <div class="explain-description">
                <h4>SHAP (SHapley Additive exPlanations)</h4>
                <p>Shows feature importance and contribution to the model's prediction. Helps understand which image features drove the detection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }

    .upload-container {
      position: relative;
      z-index: 1;
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .logo-section h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: white;
    }

    .logo-section p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    .inspector-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .badge-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-value {
      font-size: 18px;
      font-weight: 700;
      color: white;
      font-family: 'Courier New', monospace;
    }

    /* Error Alert */
    .error-alert {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(255, 77, 109, 0.1);
      border: 1px solid rgba(255, 77, 109, 0.3);
      border-radius: 12px;
      margin-bottom: 20px;
      position: relative;
    }

    .error-alert svg {
      color: #ff4d6d;
      flex-shrink: 0;
    }

    .error-alert h4 {
      margin: 0 0 4px 0;
      color: #ff4d6d;
      font-size: 16px;
      font-weight: 700;
    }

    .error-alert p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: #ff4d6d;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .close-btn:hover {
      opacity: 0.8;
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
    }

    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Control Panel */
    .control-panel {
      padding: 20px;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .control-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .control-btn.danger-badge {
      background: #ff6b6b;
      color: white;
    }

    .control-btn.primary {
      background: #000;
      color: white;
    }

    .control-btn.primary:hover {
      background: #222;
    }

    .control-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .control-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Image Display */
    .image-display {
      padding: 20px;
      position: relative;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-zone {
      text-align: center;
      cursor: pointer;
      padding: 60px 40px;
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      transition: all 0.3s ease;
      width: 100%;
    }

    .upload-zone:hover {
      border-color: #00ffff;
      background: rgba(0, 255, 255, 0.05);
    }

    .upload-icon {
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 20px;
    }

    .upload-zone h3 {
      margin: 0 0 8px 0;
      color: white;
      font-size: 20px;
    }

    .upload-zone p {
      margin: 0 0 20px 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    .upload-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 32px;
      background: #000;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .upload-button:hover {
      background: #222;
      transform: translateY(-2px);
    }

    /* Processing Loader */
    .processing-loader {
      text-align: center;
      width: 100%;
    }

    .ai-scanner {
      width: 200px;
      height: 200px;
      margin: 0 auto 30px;
      border: 3px solid rgba(0, 255, 255, 0.3);
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .scan-line {
      position: absolute;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #00ffff, transparent);
      animation: scan 2s linear infinite;
      box-shadow: 0 0 10px #00ffff;
    }

    @keyframes scan {
      0% { top: 0; }
      50% { top: 100%; }
      100% { top: 0; }
    }

    .processing-loader h3 {
      margin: 0 0 8px 0;
      color: white;
      font-size: 20px;
    }

    .processing-loader p {
      margin: 0 0 20px 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    .progress-bar {
      width: 100%;
      max-width: 300px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin: 0 auto;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #00ff88);
      transition: width 0.3s ease;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { opacity: 0.7; }
      50% { opacity: 1; }
      100% { opacity: 0.7; }
    }

    .progress-text {
      margin-top: 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Detection Results */
    .detection-badge {
      position: absolute;
      top: 30px;
      left: 30px;
      background: #ff6b6b;
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      z-index: 10;
    }

    .package-image {
      width: 100%;
      height: auto;
      border-radius: 12px;
      object-fit: contain;
      max-height: 600px;
    }

    /* Assessment Section */
    .assessment-section {
      padding: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .rejection-alert {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .rejection-alert svg {
      color: #ff6b6b;
      flex-shrink: 0;
    }

    .rejection-alert h4 {
      margin: 0 0 4px 0;
      color: #ff6b6b;
      font-size: 16px;
      font-weight: 700;
    }

    .rejection-alert p {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }

    .severity-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .severity-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .severity-card.severe {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
    }

    .severity-card.moderate {
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
    }

    .severity-card.minor {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .severity-number {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .severity-card.severe .severity-number {
      color: #ff6b6b;
    }

    .severity-card.moderate .severity-number {
      color: #ffa500;
    }

    .severity-card.minor .severity-number {
      color: #22c55e;
    }

    .severity-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn.primary {
      background: #000;
      color: white;
    }

    .action-btn.primary:hover {
      background: #222;
      transform: translateY(-2px);
    }

    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Right Panel */
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .analysis-card {
      padding: 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: white;
    }

    .damage-count {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #ff6b6b;
      color: white;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
    }

    /* Summary Cards */
    .summary-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
    }

    .summary-card.severe {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
    }

    .summary-card.moderate {
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
    }

    .summary-card.minor {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .summary-card svg {
      flex-shrink: 0;
    }

    .summary-card.severe svg {
      color: #ff6b6b;
    }

    .summary-card.moderate svg {
      color: #ffa500;
    }

    .summary-card.minor svg {
      color: #22c55e;
    }

    .summary-info {
      flex: 1;
    }

    .summary-number {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }

    .summary-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Damages Header */
    .damages-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .damages-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: white;
    }

    .damages-sort {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Damages List */
    .damages-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 8px;
    }

    .damages-list::-webkit-scrollbar {
      width: 6px;
    }

    .damages-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .damages-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .damage-item {
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .damage-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .damage-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .damage-icon {
      flex-shrink: 0;
    }

    .damage-details {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .damage-name {
      font-weight: 600;
      color: white;
      font-size: 14px;
    }

    .severity-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .severity-badge.severe {
      background: #ff6b6b;
      color: white;
    }

    .severity-badge.moderate {
      background: #ffa500;
      color: white;
    }

    .severity-badge.minor {
      background: #22c55e;
      color: white;
    }

    .damage-stats {
      margin-top: 8px;
    }

    .confidence-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .confidence-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .damage-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Damage Types Summary */
    .damage-types-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .damage-types-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: white;
    }

    .damage-type-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .damage-type-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .type-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .type-name {
      font-size: 14px;
      color: white;
      font-weight: 500;
    }

    .type-count {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 700;
    }

    .type-bar {
      height: 6px;
      border-radius: 3px;
      width: 100%;
    }

    /* Explainability Section */
    .explainability-section {
      padding: 16px;
      display: flex;
      justify-content: center;
    }

    .preview-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .preview-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    /* Explainability Modal */
    .explainability-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(5px);
    }

    .modal-content {
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 32px;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-content h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 700;
      color: white;
    }

    .explainability-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .tab-btn.active {
      background: #00ffff;
      color: #000;
      border-color: #00ffff;
    }

    .explainability-content {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 24px;
    }

    .explain-image-wrapper img {
      width: 100%;
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .explain-description h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .explain-description p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .right-panel {
        order: 2;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .inspector-badge {
        align-items: center;
      }

      .severity-grid {
        grid-template-columns: 1fr;
      }

      .controls {
        flex-direction: column;
      }

      .control-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private apiUrl = 'http://localhost:8000/api';
  private isBrowser: boolean;
primaryDamage: DetectedDamage | null = null;
primaryExplanation: { what: string; why: string; cause: string; recommendation: string } | null = null;

  uploadedImage: string | null = null;
  selectedFile: File | null = null;
  showBoxes = true;
  hasDetections = false;
  isProcessing = false;
  processingProgress = 0;
  currentView: 'original' | 'annotated' | 'gradcam' | 'shap' = 'original';
  detectionResult: DetectionResponse | null = null;
  showExplainability = false;
  explainView: 'gradcam' | 'shap' = 'gradcam';
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  openFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

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
    this.errorMessage = null;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  runDetection() {
    this.processImage();
  }

  getProgressText(): string {
    if (this.processingProgress < 30) return 'Uploading image...';
    if (this.processingProgress < 60) return 'Running YOLO detection...';
    if (this.processingProgress < 90) return 'Generating explainability...';
    return 'Finalizing results...';
  }

  async processImage() {
    if (!this.selectedFile) {
    console.error('❌ No file selected');
    return;};

    const token = this.authService.getToken();
    
    if (!token) {
          console.error('❌ No token found');
      this.errorMessage = 'You must be logged in to detect damages. Redirecting to login...';
      setTimeout(() => {
        this.authService.logout();
      }, 2000);
      return;
    }
console.log('✅ Starting detection process...');
  console.log('📁 File:', this.selectedFile.name);

    this.isProcessing = true;
    this.processingProgress = 0;
    this.hasDetections = false;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const progressInterval = setInterval(() => {
      if (this.processingProgress < 90) {
        this.processingProgress += 10;
      }
    }, 300);
// Timeout after 60 seconds
  const timeoutId = setTimeout(() => {
    clearInterval(progressInterval);
    this.isProcessing = false;
    this.errorMessage = 'Request timeout. The server took too long to respond. Please try again.';
    console.error('❌ Request timeout after 60 seconds');
  }, 60000);
    try {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('🚀 Sending POST to:', `${this.apiUrl}/detect`);
    console.log('📦 FormData contains:', this.selectedFile.name);
    
    const startTime = Date.now();
    
    // Make the request
    const response$ = this.http.post<DetectionResponse>(
      `${this.apiUrl}/detect`, 
      formData, 
      { headers }
    );
    
    this.detectionResult = await firstValueFrom(response$);
    this.primaryDamage = this.getPrimaryDamage();
this.primaryExplanation = this.getOperatorExplanation(this.primaryDamage?.class_name || '');

console.log('Primary damage (cached):', this.primaryDamage);
console.log('Primary explanation (cached):', this.primaryExplanation);
    
    // Clear timeout and interval
    clearTimeout(timeoutId);
    clearInterval(progressInterval);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Detection completed in ${duration}s`);
    console.log('📊 Result:', this.detectionResult);

    this.processingProgress = 100;

    // Small delay before showing results
    setTimeout(() => {
      this.isProcessing = false;
      this.hasDetections = this.detectionResult!.success && this.detectionResult!.total_damages >= 0;
      
      if (this.hasDetections) {
        console.log(`✅ Found ${this.detectionResult!.total_damages} damage(s)`);
      } else {
        console.log('ℹ️ No damages detected');
      }
    }, 500);

  } catch (error: any) {
    clearTimeout(timeoutId);
    clearInterval(progressInterval);
    this.isProcessing = false;
    this.processingProgress = 0;
    
    console.error('❌ Detection error:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);

    if (error.status === 0) {
      this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
    } else if (error.status === 401) {
      this.errorMessage = 'Authentication failed. Please login again.';
      setTimeout(() => this.authService.logout(), 2000);
    } else if (error.status === 413) {
      this.errorMessage = 'Image file is too large. Please use a smaller image.';
    } else if (error.status === 500) {
      this.errorMessage = 'Server error. Please check backend logs.';
    } else if (error.name === 'TimeoutError') {
      this.errorMessage = 'Request timeout. Please try again.';
    } else {
      this.errorMessage = error.error?.detail || 'Failed to process image. Please try again.';
    }
  }
  }

  getDisplayImage(): string {
    if (!this.detectionResult) return this.uploadedImage || '';
    return this.detectionResult.annotated_image_url || this.uploadedImage || '';
  }

  getSeverityLabel(severity: string): string {
    if (severity === 'danger') return 'Severe';
    if (severity === 'warning') return 'Moderate';
    return 'Minor';
  }

  getSeverityClass(severity: string): string {
    if (severity === 'danger') return 'severe';
    if (severity === 'warning') return 'moderate';
    return 'minor';
  }

  getDamageTypeSummary() {
    if (!this.detectionResult?.detections) return [];
    
    const typeCounts = new Map<string, { count: number; color: string }>();
    
    this.detectionResult?.detections?.forEach(damage => {
      const current = typeCounts.get(damage.class_name) || { count: 0, color: damage.color };
      typeCounts.set(damage.class_name, { count: current.count + 1, color: damage.color });
    });

    return Array.from(typeCounts.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color
    }));
  }

  toggleBoxes() {
    this.showBoxes = !this.showBoxes;
  }

  toggleExplainability() {
    this.showExplainability = !this.showExplainability;
  }

  reset() {
    this.uploadedImage = null;
    this.selectedFile = null;
    this.hasDetections = false;
    this.isProcessing = false;
    this.processingProgress = 0;
    this.currentView = 'original';
    this.detectionResult = null;
    this.showExplainability = false;
    this.errorMessage = null;
  }
  

  downloadReport() {
    console.log('detectionResult:', this.detectionResult);
console.log('isBrowser:', this.isBrowser);
    if (!this.detectionResult || !this.isBrowser) return;
    
    const reportData = JSON.stringify(this.detectionResult, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-report-${this.detectionResult.tracking_code}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportData() {
    if (!this.detectionResult || !this.isBrowser) return;
    
    let csv = 'Type,Severity,Confidence,Dimensions\n';
    this.detectionResult?.detections?.forEach(damage => {
      csv += `${damage.class_name},${this.getSeverityLabel(damage.severity)},${(damage.score * 100).toFixed(1)},${damage.dimensions}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `damage-data-${this.detectionResult.tracking_code}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  getSeverityCount(severity: 'severe' | 'moderate' | 'minor'): number {
  return this.detectionResult?.severity_counts?.[severity] ?? 0;
}
getPrimaryDamage(): DetectedDamage | null {
  if (!this.detectionResult || !this.detectionResult.detections || this.detectionResult.detections.length === 0) return null;
  return this.detectionResult.detections.reduce((a, b) => a.score > b.score ? a : b);
}
getPrimaryConfidencePercent(): number {
  const primary = this.getPrimaryDamage();
  if (!primary) return 0;
  return Math.round(primary.score * 100);
}
getOperatorExplanation(damageType: string) {
    const normalize = (s: string) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normalize_key = normalize(damageType);
  // ensure we don't call ourselves recursively (was happening via a console.log)
  const explanations: Record<string, { what: string; why: string; cause: string; recommendation: string }> = {
    torn: {
      what: 'A noticeable tear or rip is present on the package.',
      why: 'Potential contents exposure or loss.',
      cause: 'Likely due to sharp objects or rough handling.',
      recommendation: 'Reject package. Take photos and document.'
    },
    wet: {
      what: 'Visible moisture or water staining is observed.',
      why: 'Package content may be water-damaged.',
      cause: 'Exposure to rain or liquid during transit.',
      recommendation: 'Reject if contents are affected. Document and inform sender.'
    },
    crushed: {
      what: 'Obvious structural deformation; package is crushed.',
      why: 'Contents could be broken or defective.',
      cause: 'Heavy weight or compression during handling.',
      recommendation: 'Reject package and photograph condition.'
    },
    stained: {
      what: 'Surface stains or discolorations are apparent.',
      why: 'Possible contamination of contents.',
      cause: 'Contact with chemicals/dirty surfaces.',
      recommendation: 'Inspect contents. Accept only if clean/untouched.'
    },
    hole: {
      what: 'Package has visible puncture or hole.',
      why: 'Possible theft or loss of contents.',
      cause: 'Piercing by an object, careless loading/unloading.',
      recommendation: 'Reject package due to security risk.'
    },
    scratched: {
      what: 'Surface scratches present.',
      why: 'Usually cosmetic, but still document.',
      cause: 'Rubbing/dragging on rough surfaces.',
      recommendation: 'Accept with note if contents are OK.'
    }
  };

  if (!damageType) {
    return {
      what: 'Not specified.',
      why: 'Not specified.',
      cause: 'Not specified.',
      recommendation: 'Inspect package further.'
    };
  }

  
  return explanations[normalize_key] ?? {
    what: 'Not specified.',
    why: 'Not specified.',
    cause: 'Not specified.',
    recommendation: 'Inspect package further.'
  };
}


downloadOperatorReport() {
  if (!this.isBrowser) return;

  const damage = this.getPrimaryDamage();
  const explain = this.getOperatorExplanation(damage?.class_name || '');
  const code = this.detectionResult?.tracking_code || `no-code-${Date.now()}`;

  const lines = [
    'Package Inspection Report',
    '=============================',
    `Tracking Code : ${code}`,
    'Inspector     : LOG-2025-001',
    '-----------------------------',
    `Damage Type   : ${damage?.class_name || '-'}`,
    `Confidence    : ${damage ? (damage.score * 100).toFixed(1) + '%' : '-'}`,
    '-----------------------------',
    `What happened : ${explain.what}`,
    `Why it matters: ${explain.why}`,
    `Likely cause  : ${explain.cause}`,
    `Recommendation: ${explain.recommendation}`,
    '-----------------------------',
    `Detected ${this.detectionResult?.total_damages ?? 0} damages.`,
    ''
  ];

  if (this.detectionResult?.detections?.length) {
    lines.push(...this.detectionResult.detections.map((d, i) => `  ${i + 1}. ${d.class_name} - ${(d.score * 100).toFixed(1)}%`));
  }

  lines.push('', '-----------------------------', 'End of Report.');

  const report = lines.join('\n');
  const blob = new Blob([report], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operator-report-${encodeURIComponent(code)}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

}