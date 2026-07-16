import { Component, inject, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChatbotService } from '../../../core/services/chatbot.service';

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
  protected readonly chatbotService = inject(ChatbotService);
  
  protected readonly isOpen = this.chatbotService.isOpen;
  protected readonly messages = this.chatbotService.messages;
  protected readonly isTyping = this.chatbotService.isTyping;
  
  protected userInput = signal('');
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleChat() {
    this.chatbotService.toggleChat();
  }

  closeChat() {
    this.chatbotService.closeChat();
  }

  sendMessage() {
    const msg = this.userInput();
    if (!msg.trim()) return;
    
    this.chatbotService.sendMessage(msg);
    this.userInput.set(''); // Clear input
  }
  
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
