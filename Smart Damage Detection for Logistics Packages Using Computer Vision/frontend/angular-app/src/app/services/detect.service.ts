import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // ensure service is global
})
export class DetectService {
  private http = inject(HttpClient); // standalone-friendly injection

  detect(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', '/api/detect', formData, {
      reportProgress: true,
    });
    return this.http.request(req);
  }
}
