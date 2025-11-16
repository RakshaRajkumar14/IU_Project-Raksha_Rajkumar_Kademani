// frontend/src/app/components/package-chat/package-chat.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Message } from '../../services/message.service';

@Component({
  selector: 'app-package-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container card">
      <h3>💬 Messages & Notes</h3>
      
      <div class="messages-list" #messagesList>
        <div *ngIf="messages.length === 0" class="empty-state">
          <p>No messages yet. Start a conversation about this package.</p>
        </div>
        
        <div *ngFor="let msg of messages" class="message-item">
          <div class="message-header">
            <span class="author">{{ msg.author }}</span>
            <span class="timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
          </div>
          <div class="message-content">{{ msg.message }}</div>
        </div>
      </div>

      <div class="message-input-container">
        <input 
          type="text" 
          [(ngModel)]="authorName" 
          placeholder="Your name"
          class="author-input"
          [disabled]="isLoading"
        />
        <div class="input-group">
          <textarea 
            [(ngModel)]="newMessage" 
            placeholder="Type a message..."
            class="message-input"
            (keydown.enter)="$event.preventDefault(); sendMessage()"
            [disabled]="isLoading"
            rows="2"
          ></textarea>
          <button 
            (click)="sendMessage()" 
            [disabled]="!canSend() || isLoading"
            class="send-btn"
          >
            {{ isLoading ? '⏳' : '📤' }} Send
          </button>
        </div>
        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 600px;
    }

    .chat-container h3 {
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 0.75rem;
    }

    .messages-list {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      min-height: 200px;
      max-height: 400px;
    }

    .empty-state {
      text-align: center;
      color: var(--gray-500);
      padding: 2rem;
    }

    .message-item {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: 8px;
      border-left: 3px solid var(--primary);
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .author {
      font-weight: 600;
      color: var(--primary);
    }

    .timestamp {
      color: var(--gray-500);
    }

    .message-content {
      color: var(--gray-700);
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .message-input-container {
      border-top: 1px solid var(--gray-200);
      padding-top: 1rem;
    }

    .author-input {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .message-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--gray-300);
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      min-height: 60px;
    }

    .message-input:focus,
    .author-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .send-btn {
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .send-btn:hover:not(:disabled) {
      background: var(--primary-dark, #4338ca);
      transform: translateY(-1px);
    }

    .send-btn:disabled {
      background: var(--gray-300);
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      color: var(--danger, #dc2626);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(220, 38, 38, 0.1);
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .input-group {
        flex-direction: column;
        align-items: stretch;
      }

      .send-btn {
        width: 100%;
      }
    }
  `]
})
export class PackageChatComponent implements OnInit {
  @Input() packageId!: number;
  
  messages: Message[] = [];
  newMessage: string = '';
  authorName: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    if (this.packageId) {
      this.loadMessages();
    }
  }

  loadMessages(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.messageService.getMessages(this.packageId).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.errorMessage = 'Failed to load messages. Database might not be configured.';
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.canSend()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.messageService.addMessage(this.packageId, this.authorName.trim(), this.newMessage.trim()).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.errorMessage = 'Failed to send message. Please try again.';
        this.isLoading = false;
      }
    });
  }

  canSend(): boolean {
    return this.authorName.trim().length > 0 && this.newMessage.trim().length > 0;
  }

  formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  private scrollToBottom(): void {
    const messagesList = document.querySelector('.messages-list');
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }
}
