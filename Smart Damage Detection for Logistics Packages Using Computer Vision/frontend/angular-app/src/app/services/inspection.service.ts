import { Injectable, signal } from '@angular/core';
import { Inspection } from '../models/inspection.model';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private inspectionsSignal = signal<Inspection[]>([
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
      damageType: 'Torn seal',
      confidence: 92.5,
      status: 'pending',
      timestamp: new Date('2024-01-15T10:30:00'),
      overlayType: 'none',
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
      damageType: 'Crushed corner',
      confidence: 87.3,
      status: 'approved',
      timestamp: new Date('2024-01-15T09:15:00'),
      reviewer: 'John Doe',
      overlayType: 'none',
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
      damageType: 'Water damage',
      confidence: 95.8,
      status: 'flagged',
      timestamp: new Date('2024-01-15T08:45:00'),
      reviewer: 'Jane Smith',
      overlayType: 'none',
    },
  ]);

  inspections = this.inspectionsSignal.asReadonly();

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
