import { Component, OnInit, inject, ChangeDetectionStrategy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveChatService, ChatRoom } from '../../../core/services/live-chat.service';

@Component({
  selector: 'app-admin-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-live-chat.html',
  styleUrl: './admin-live-chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLiveChatComponent implements OnInit, AfterViewChecked {
  readonly liveChat = inject(LiveChatService);
  
  selectedRoomId = signal<string>('');
  newMessage = signal('');
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngOnInit() {
    this.liveChat.loadActiveRooms();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectRoom(sessionId: string) {
    this.selectedRoomId.set(sessionId);
    this.liveChat.connectToRoom(sessionId);
    this.liveChat.loadChatHistory(sessionId);
    this.liveChat.markAdminRead(sessionId);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text || !this.selectedRoomId()) return;

    this.liveChat.sendMessageToUser(this.selectedRoomId(), text);
    this.newMessage.set('');
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
