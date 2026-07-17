import { Component, ChangeDetectionStrategy, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  time: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent implements AfterViewChecked {
  private http = inject(HttpClient);
  
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([
    { text: 'Hi there! 👋 I am your Luxe AI Assistant. How can I help you today?', sender: 'bot', time: new Date() }
  ]);
  newMessage = signal('');
  isTyping = signal(false);
  sessionId = 'session_' + Math.random().toString(36).substring(2, 9);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen.update(val => !val);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    // Add user message
    this.messages.update(msgs => [...msgs, { text, sender: 'user', time: new Date() }]);
    this.newMessage.set('');
    this.isTyping.set(true);

    // Call AI backend
    this.http.post<{response: string}>(`${environment.aiApiUrl}/chat/`, {
      message: text,
      session_id: this.sessionId
    }).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, { text: res.response, sender: 'bot', time: new Date() }]);
      },
      error: (err) => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, { text: 'Sorry, I am having trouble connecting to the server right now.', sender: 'bot', time: new Date() }]);
      }
    });
  }
}
