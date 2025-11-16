// frontend/src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number;
  package_id?: number;
  author: string;
  message: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private API_BASE = 'http://127.0.0.1:8000/api/packages';
  
  constructor(private http: HttpClient) {}

  getMessages(packageId: number): Observable<{ messages: Message[] }> {
    return this.http.get<{ messages: Message[] }>(`${this.API_BASE}/${packageId}/messages`);
  }

  addMessage(packageId: number, author: string, message: string): Observable<Message> {
    return this.http.post<Message>(`${this.API_BASE}/${packageId}/messages`, {
      author,
      message
    });
  }
}
