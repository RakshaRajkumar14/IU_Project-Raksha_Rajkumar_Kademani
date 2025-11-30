import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inspection } from '../models/inspection.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private apiUrl = 'http://localhost:8000/api';
  private inspectionsSignal = signal<Inspection[]>([]);
  private refreshInterval: any;

  inspections = this.inspectionsSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadInspections();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadInspections();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private loadInspections(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('⚠️  No auth token found, skipping inspections load');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}/dashboard/stats`, { headers }).subscribe({
      next: (stats) => {
        const inspections: Inspection[] = stats.recent_detections.map((detection: any) => ({
          id: detection.id,
          imageUrl: '',
          damageType: detection.damageType,
          confidence: detection.confidence,
          status: detection.status === 'damaged' ? 'pending' : 'approved',
          timestamp: new Date(detection.timestamp),
          overlayType: 'none' as const
        }));
        
        this.inspectionsSignal.set(inspections);
        console.log('✅ Inspections loaded:', inspections.length);
      },
      error: (err) => {
        console.error('❌ Failed to load inspections:', err);
      }
    });
  }

  refreshInspections(): void {
    console.log('🔄 Manually refreshing inspections...');
    this.loadInspections();
  }

  addInspection(inspection: Inspection) {
    this.inspectionsSignal.update(inspections => [inspection, ...inspections]);
  }

  updateInspectionStatus(id: string, status: Inspection['status']) {
    this.inspectionsSignal.update(inspections =>
      inspections.map(inspection =>
        inspection.id === id ? { ...inspection, status } : inspection
      )
    );
  }

  updateInspectionOverlay(id: string, overlayType: Inspection['overlayType']) {
    this.inspectionsSignal.update(inspections =>
      inspections.map(inspection =>
        inspection.id === id ? { ...inspection, overlayType } : inspection
      )
    );
  }
}
