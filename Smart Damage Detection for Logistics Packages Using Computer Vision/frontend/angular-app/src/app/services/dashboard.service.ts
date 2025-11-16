/**
 * Dashboard Service
 * Author: RakshaRajkumar14
 * Date: 2025-11-16 14:37:47 UTC
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_packages_today: number;
  total_damages_today: number;
  most_common_damage: string;
  damage_rate: number;
  recent_detections: Array<{
    id: string;
    damageType: string;
    damageClass: string;
    timestamp: string;
    confidence: number;
    status: string;
    predictionCount?: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getHealthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}