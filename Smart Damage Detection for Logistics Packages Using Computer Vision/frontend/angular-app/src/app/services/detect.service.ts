// frontend/src/app/services/detect.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent,HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DetectService {
  private API = 'http://127.0.0.1:8000/api/detect';
  private EXPLAIN_GRADCAM = 'http://127.0.0.1:8000/api/explain/gradcam';
  constructor(private http: HttpClient) {}

  detect(file: File, trackingCode?: string): Observable<HttpEvent<any>> {
    const fd = new FormData();
    fd.append('file', file);
    if (trackingCode) fd.append('tracking_code', trackingCode);
    return this.http.post<any>(this.API, fd, { reportProgress: true, observe: 'events' });
  }

  explainGradcam(file: File, targetClass?: number) {
    const fd = new FormData();
    fd.append('file', file);
    if (typeof targetClass === 'number') fd.append('target_class', String(targetClass));
    return this.http.post(this.EXPLAIN_GRADCAM, fd, { responseType: 'blob' });
  }

  explainSaliency(file: File, targetClass?: number) {
    const fd = new FormData();
    fd.append('file', file);
    if (typeof targetClass === 'number') fd.append('target_class', String(targetClass));
    return this.http.post('http://127.0.0.1:8000/api/explain/saliency', fd, { responseType: 'blob' });
  }
}
