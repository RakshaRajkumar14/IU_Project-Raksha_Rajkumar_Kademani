import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
    {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload.component').then(m => m.UploadComponent)
  },
  {
    path: 'queue',
    loadComponent: () => import('./pages/inspection/inspection.component').then(m => m.InspectionQueueComponent)
  },
  {
    path: 'package/:id',
    loadComponent: () => import('./pages/package-detail/package-detail.component').then(m => m.PackageDetailComponent)
  },
  {
    path: 'model-insights',
    loadComponent: () => import('./pages/model-insights/model-insights.component').then(m => m.ModelInsightsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  }
];
