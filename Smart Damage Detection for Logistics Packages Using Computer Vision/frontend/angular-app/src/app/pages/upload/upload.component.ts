import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Dashboard3DBackgroundComponent } from '../dashboard/ddashboard-3d-background.component';

interface DetectedDamage {
  id: number;
  type: string;
  severity: 'Severe' | 'Moderate' | 'Minor';
  confidence: number;
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
                <div class="severity-number">{{ detectionResult?.severity_counts.severe || 0 }}</div>
                <div class="severity-label">Severe</div>
              </div>
              <div class="severity-card moderate">
                <div class="severity-number">{{ detectionResult?.severity_counts.moderate || 0 }}</div>
                <div class="severity-label">Moderate</div>
              </div>
              <div class="severity-card minor">
                <div class="severity-number">{{ detectionResult?.severity_counts.minor || 0 }}</div>
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
                  <div class="summary-number">{{ detectionResult?.severity_counts.severe || 0 }}</div>
                  <div class="summary-label">Severe</div>
                </div>
              </div>
              <div class="summary-card moderate">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <div class="summary-info">
                  <div class="summary-number">{{ detectionResult?.severity_counts.moderate || 0 }}</div>
                  <div class="summary-label">Moderate</div>
                </div>
              </div>
              <div class="summary-card minor">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <div class="summary-info">
                  <div class="summary-number">{{ detectionResult?.severity_counts.minor || 0 }}</div>
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
  styles: [`
    .upload-container {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .glass-effect {
      background: rgba(10, 25, 41, 0.7) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
    }

    /* Control Panel */
    .control-panel {
      padding: 1.5rem;
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .panel-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .panel-title svg {
      color: #00ffff;
    }

    .controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .control-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      border: 1px solid rgba(0, 255, 255, 0.3);
      background: rgba(0, 255, 255, 0.05);
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-btn:hover {
      background: rgba(0, 255, 255, 0.15);
      border-color: rgba(0, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
    }

    .control-btn.danger-badge {
      background: rgba(255, 77, 109, 0.15);
      border-color: rgba(255, 77, 109, 0.3);
      color: #ff6b9d;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    /* Image Display */
    .image-display {
      border-radius: 16px;
      overflow: hidden;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 1.5rem;
      flex-direction: column;
    }

    .upload-zone {
      text-align: center;
      padding: 4rem 2rem;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }

    .upload-zone:hover {
      transform: scale(1.02);
    }

    .upload-icon {
      margin: 0 auto 1.5rem;
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed rgba(0, 255, 255, 0.3);
    }

    .upload-icon svg {
      color: #00ffff;
    }

    .upload-zone h3 {
      font-size: 1.5rem;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .upload-zone p {
      color: rgba(0, 255, 255, 0.6);
      margin: 0 0 1.5rem 0;
    }

    .upload-button {
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      color: #0a0e27;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
    }

    .upload-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(0, 255, 255, 0.5);
    }

    /* Processing Loader */
    .processing-loader {
      text-align: center;
      padding: 4rem 2rem;
    }

    .ai-scanner {
      width: 200px;
      height: 200px;
      margin: 0 auto 2rem;
      border: 3px solid rgba(0, 255, 255, 0.3);
      border-radius: 50%;
      position: relative;
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .scan-line {
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #00ffff, transparent);
      position: absolute;
      top: 50%;
      left: 0;
      animation: scan 1.5s ease-in-out infinite;
    }

    @keyframes scan {
      0%, 100% { top: 20%; }
      50% { top: 80%; }
    }

    .processing-loader h3 {
      font-size: 1.5rem;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .processing-loader p {
      color: rgba(0, 255, 255, 0.7);
      margin: 0 0 2rem 0;
    }

    .progress-bar {
      width: 100%;
      max-width: 400px;
      height: 6px;
      background: rgba(0, 255, 255, 0.1);
      border-radius: 3px;
      margin: 0 auto;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #00ff88);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    /* View Tabs */
    .view-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      width: 100%;
    }

    .tab-btn {
      padding: 0.5rem 1.5rem;
      background: transparent;
      border: 1px solid rgba(0, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .tab-btn:hover {
      background: rgba(0, 255, 255, 0.1);
      color: #ffffff;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      color: #0a0e27;
      border-color: transparent;
      font-weight: 600;
    }

    .detection-badge {
      position: absolute;
      top: 5rem;
      left: 1.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 77, 109, 0.95);
      color: white;
      border-radius: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 20px rgba(255, 77, 109, 0.4);
      z-index: 10;
    }

    .package-image {
      width: 100%;
      height: auto;
      max-height: 500px;
      object-fit: contain;
    }

    /* Explainability Section */
    .explainability-section {
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-title svg {
      color: #00ffff;
    }

    .explainability-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .explainability-card {
      background: rgba(0, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .explainability-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 255, 255, 0.2);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon.gradcam {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    }

    .card-icon.shap {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    }

    .card-icon svg {
      color: white;
    }

    .explainability-card h4 {
      font-size: 1.1rem;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .explainability-card p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .view-btn {
      padding: 0.625rem 1.5rem;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid rgba(0, 255, 255, 0.3);
      color: #00ffff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .view-btn:hover {
      background: rgba(0, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    /* Assessment Section */
    .assessment-section {
      padding: 2rem;
      border-radius: 16px;
    }

    .assessment-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .assessment-title svg {
      color: #00ffff;
    }

    .rejection-alert {
      background: rgba(255, 77, 109, 0.15);
      border: 1px solid rgba(255, 77, 109, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .rejection-alert svg {
      color: #ff4d6d;
      flex-shrink: 0;
    }

    .rejection-alert h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #ff6b9d;
      margin: 0 0 0.25rem 0;
    }

    .rejection-alert p {
      font-size: 0.9rem;
      color: rgba(255, 107, 157, 0.8);
      margin: 0;
    }

    .severity-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .severity-card {
      padding: 1.25rem;
      border-radius: 12px;
      text-align: center;
    }

    .severity-card.severe {
      background: rgba(255, 77, 109, 0.15);
      border: 1px solid rgba(255, 77, 109, 0.3);
    }

    .severity-card.moderate {
      background: rgba(255, 165, 0, 0.15);
      border: 1px solid rgba(255, 165, 0, 0.3);
    }

    .severity-card.minor {
      background: rgba(0, 255, 136, 0.15);
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    .severity-number {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .severity-card.severe .severity-number { color: #ff4d6d; }
    .severity-card.moderate .severity-number { color: #ffa500; }
    .severity-card.minor .severity-number { color: #00ff88; }

    .severity-label {
      font-size: 0.85rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .severity-card.severe .severity-label { color: #ff6b9d; }
    .severity-card.moderate .severity-label { color: #ffa500; }
    .severity-card.minor .severity-label { color: #00ff88; }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-btn {
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 255, 0.3);
      background: rgba(0, 255, 255, 0.05);
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #00ffff 0%, #00ff88 100%);
      color: #0a0e27;
      border-color: transparent;
      font-weight: 600;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 255, 255, 0.2);
    }

    .action-btn.primary:hover {
      box-shadow: 0 6px 30px rgba(0, 255, 255, 0.4);
    }

    /* Analysis Section */
    .analysis-section {
      position: sticky;
      top: 2rem;
      max-height: calc(100vh - 4rem);
      overflow-y: auto;
    }

    .analysis-card {
      padding: 2rem;
      border-radius: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .damage-count {
      padding: 0.375rem 0.875rem;
      background: rgba(255, 77, 109, 0.2);
      color: #ff6b9d;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      padding: 1rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .summary-card.severe {
      background: rgba(255, 77, 109, 0.15);
      border: 1px solid rgba(255, 77, 109, 0.3);
    }

    .summary-card.moderate {
      background: rgba(255, 165, 0, 0.15);
      border: 1px solid rgba(255, 165, 0, 0.3);
    }

    .summary-card.minor {
      background: rgba(0, 255, 136, 0.15);
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    .summary-card svg {
      flex-shrink: 0;
    }

    .summary-card.severe svg { color: #ff4d6d; }
    .summary-card.moderate svg { color: #ffa500; }
    .summary-card.minor svg { color: #00ff88; }

    .summary-number {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .summary-card.severe .summary-number { color: #ff4d6d; }
    .summary-card.moderate .summary-number { color: #ffa500; }
    .summary-card.minor .summary-number { color: #00ff88; }

    .summary-label {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-top: 0.25rem;
    }

    .summary-card.severe .summary-label { color: #ff6b9d; }
    .summary-card.moderate .summary-label { color: #ffa500; }
    .summary-card.minor .summary-label { color: #00ff88; }

    .damages-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .damages-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .damages-sort {
      font-size: 0.8rem;
      color: rgba(0, 255, 255, 0.6);
    }

    .damages-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .damage-item {
      padding: 1rem;
      background: rgba(0, 255, 255, 0.03);
      border: 1px solid rgba(0, 255, 255, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .damage-item:hover {
      background: rgba(0, 255, 255, 0.08);
      border-color: rgba(0, 255, 255, 0.3);
    }

    .damage-info {
      display: flex;
      gap: 0.875rem;
      margin-bottom: 0.875rem;
    }

    .damage-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      flex-shrink: 0;
    }

    .damage-details {
      flex: 1;
    }

    .damage-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.375rem;
    }

    .severity-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .severity-badge.severe {
      background: rgba(255, 77, 109, 0.2);
      color: #ff6b9d;
    }

    .severity-badge.moderate {
      background: rgba(255, 165, 0, 0.2);
      color: #ffa500;
    }

    .severity-badge.minor {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }

    .damage-stats {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .confidence-bar {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .damage-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .analysis-section {
        position: static;
        max-height: none;
      }
    }

    @media (max-width: 768px) {
      .upload-container {
        padding: 1rem;
      }

      .severity-grid,
      .summary-cards,
      .explainability-cards {
        grid-template-columns: 1fr;
      }
    }

    /* Scrollbar */
    .analysis-section::-webkit-scrollbar {
      width: 5px;
    }

    .analysis-section::-webkit-scrollbar-track {
      background: transparent;
    }

    .analysis-section::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 255, 0.3);
      border-radius: 3px;
    }
  `]
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
      this.detectionResult = await this.http.post<DetectionResponse>(
        `${this.apiUrl}/detect`,
        formData
      ).toPromise() as DetectionResponse;

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