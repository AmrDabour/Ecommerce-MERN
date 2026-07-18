import { Injectable, signal, computed, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  sender: 'User' | 'Agent';
  text: string;
  timestamp: Date;
}

export interface ChatRoom {
  _id: string;
  sessionId: string;
  user?: any;
  messages: ChatMessage[];
  status: 'Active' | 'Closed';
  unreadCountAdmin: number;
  unreadCountUser: number;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LiveChatService {
  private socket: Socket;
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  // State signals
  public readonly isConnected = signal(false);
  public readonly messages = signal<ChatMessage[]>([]);
  public readonly sessionId = signal<string>('');
  
  // Admin specific signals
  public readonly activeRooms = signal<ChatRoom[]>([]);
  public readonly adminUnreadCount = computed(() => {
    return this.activeRooms().reduce((acc, room) => acc + room.unreadCountAdmin, 0);
  });

  constructor() {
    this.socket = io(environment.apiUrl.replace('/api', ''), {
      autoConnect: false // Connect manually when needed
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      this.isConnected.set(true);
      if (this.sessionId()) {
        this.socket.emit('join_room', { sessionId: this.sessionId(), userId: this.auth.currentUser()?._id });
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
    });

    this.socket.on('receive_message', (msg: ChatMessage) => {
      this.messages.update(msgs => [...msgs, msg]);
    });

    // Admin listeners
    this.socket.on('admin_new_room', (room: ChatRoom) => {
      if (this.auth.isAdmin()) {
        this.activeRooms.update(rooms => {
          const exists = rooms.find(r => r.sessionId === room.sessionId);
          if (!exists) return [room, ...rooms];
          return rooms;
        });
      }
    });

    this.socket.on('admin_receive_message', (data: { sessionId: string, message: ChatMessage }) => {
      if (this.auth.isAdmin()) {
        this.activeRooms.update(rooms => {
          const roomIndex = rooms.findIndex(r => r.sessionId === data.sessionId);
          if (roomIndex !== -1) {
            const updatedRooms = [...rooms];
            updatedRooms[roomIndex].messages.push(data.message);
            updatedRooms[roomIndex].unreadCountAdmin += 1;
            updatedRooms[roomIndex].updatedAt = new Date();
            // Move to top
            const [room] = updatedRooms.splice(roomIndex, 1);
            return [room, ...updatedRooms];
          }
          return rooms;
        });
        
        // If the admin is currently viewing this room, mark as read
        if (this.sessionId() === data.sessionId) {
          this.markAdminRead(data.sessionId);
        }
      }
    });
  }

  // Common methods
  connectToRoom(sessionId: string) {
    this.sessionId.set(sessionId);
    if (!this.socket.connected) {
      this.socket.connect();
    } else {
      this.socket.emit('join_room', { sessionId, userId: this.auth.currentUser()?._id });
    }
  }

  disconnect() {
    this.socket.disconnect();
    this.sessionId.set('');
    this.messages.set([]);
  }

  // User methods
  sendMessageToAdmin(text: string) {
    if (!this.sessionId()) return;
    this.socket.emit('send_message_to_admin', { sessionId: this.sessionId(), text });
  }

  markUserRead() {
    if (!this.sessionId()) return;
    this.socket.emit('user_mark_read', { sessionId: this.sessionId() });
  }

  // Admin methods
  sendMessageToUser(sessionId: string, text: string) {
    this.socket.emit('send_message_to_user', { sessionId, text });
  }

  markAdminRead(sessionId: string) {
    this.socket.emit('admin_mark_read', { sessionId });
    // Optimistically update local count
    this.activeRooms.update(rooms => 
      rooms.map(r => r.sessionId === sessionId ? { ...r, unreadCountAdmin: 0 } : r)
    );
  }

  // REST API Methods
  loadChatHistory(sessionId: string) {
    return this.http.get<{messages: ChatMessage[], status: string, unreadCountUser: number, unreadCountAdmin: number}>(
      `${environment.apiUrl}/live-chat/${sessionId}`
    ).subscribe({
      next: (res) => {
        this.messages.set(res.messages || []);
      },
      error: (err) => console.error('Failed to load chat history', err)
    });
  }

  loadActiveRooms() {
    return this.http.get<{rooms: ChatRoom[]}>(`${environment.apiUrl}/live-chat/rooms`).subscribe({
      next: (res) => {
        this.activeRooms.set(res.rooms || []);
      },
      error: (err) => console.error('Failed to load active rooms', err)
    });
  }
}
