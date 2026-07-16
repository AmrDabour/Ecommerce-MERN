import { Injectable, signal } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly _isOpen = signal(false);
  private readonly _messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  private readonly _isTyping = signal(false);

  readonly isOpen = this._isOpen.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly isTyping = this._isTyping.asReadonly();

  toggleChat() {
    this._isOpen.update((open) => !open);
  }

  closeChat() {
    this._isOpen.set(false);
  }

  async sendMessage(content: string) {
    if (!content.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    this._messages.update((msgs) => [...msgs, userMsg]);
    this._isTyping.set(true);

    // TODO: Replace with actual AI API call later
    try {
      const aiResponse = await this.mockAiApiCall(content);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      this._messages.update((msgs) => [...msgs, assistantMsg]);
    } catch (error) {
      console.error('AI API Error:', error);
      // Handle error visually if needed
    } finally {
      this._isTyping.set(false);
    }
  }

  // Placeholder operation API
  private mockAiApiCall(query: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`This is a placeholder response for: "${query}". You can connect your real AI API here later!`);
      }, 1500);
    });
  }
}
