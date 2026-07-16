import { Component, inject, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss'],
  animations: [
    trigger('bubbleAnimation', [
      state('void', style({ transform: 'scale(0) translateY(20px)', opacity: 0 })),
      state('*', style({ transform: 'scale(1) translateY(0)', opacity: 1 })),
      transition('void => *', animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)')),
      transition('* => void', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('chatWindowAnimation', [
      state('void', style({ transform: 'scale(0.9) translateY(20px)', opacity: 0, transformOrigin: 'bottom right' })),
      state('*', style({ transform: 'scale(1) translateY(0)', opacity: 1, transformOrigin: 'bottom right' })),
      transition('void => *', animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)')),
      transition('* => void', animate('250ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ])
  ]
})
export class ChatbotComponent implements AfterViewChecked {
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi! I'm your AI shopping assistant. How can I help you today?"
  }]);
  newMessage = signal('');
  isTyping = signal(false);

  private readonly chatService = inject(ChatService);
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  closeChat() {
    this.isOpen.set(false);
  }

  sendMessage() {
    const userMsg = this.newMessage();
    if (!userMsg.trim()) return;
    
    this.messages.update(msgs => [...msgs, { role: 'user', content: userMsg }]);
    this.newMessage.set('');
    this.isTyping.set(true);

    // Send to backend
    this.chatService.sendMessage(userMsg).subscribe({
      next: (res) => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: res.reply
        }]);
      },
      error: () => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later."
        }]);
      }
    });
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
