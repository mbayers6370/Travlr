import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message, MessageKind } from '../models/message';
import { TripData } from '../services/trip-data';

type MessageFilter = 'all' | 'unread' | MessageKind;

@Component({
  selector: 'app-messages',
  imports: [CommonModule, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit {
  messages: Message[] = [];
  activeFilter: MessageFilter = 'all';
  selectedMessageId: string | null = null;
  errorMessage = '';
  readStateError = '';

  constructor(private tripData: TripData) {}

  get filteredMessages(): Message[] {
    if (this.activeFilter === 'all') {
      return this.messages;
    }

    if (this.activeFilter === 'unread') {
      return this.messages.filter((message) => !message.isRead);
    }

    return this.messages.filter((message) => message.kind === this.activeFilter);
  }

  get unreadCount(): number {
    return this.messages.filter((message) => !message.isRead).length;
  }

  filterLabel(kind: MessageKind): string {
    return kind === 'trip' ? 'Trip inquiry' : kind === 'room' ? 'Room inquiry' : 'General message';
  }

  setFilter(filter: MessageFilter): void {
    this.activeFilter = filter;
    this.selectedMessageId = null;
  }

  isSelected(message: Message): boolean {
    return this.selectedMessageId === message._id;
  }

  messageSubject(message: Message): string {
    return message.subject || this.filterLabel(message.kind);
  }

  toggleMessage(message: Message): void {
    this.readStateError = '';
    this.selectedMessageId = this.isSelected(message) ? null : message._id;

    if (!message.isRead && this.selectedMessageId) {
      this.updateReadState(message, true);
    }
  }

  markUnread(message: Message): void {
    this.readStateError = '';
    this.updateReadState(message, false);
  }

  private updateReadState(message: Message, isRead: boolean): void {
    this.tripData.setMessageReadState(message._id, isRead).subscribe({
      next: (updatedMessage) => {
        this.messages = this.messages.map((currentMessage) =>
          currentMessage._id === updatedMessage._id ? updatedMessage : currentMessage
        );
      },
      error: (error) => this.readStateError = error.error?.message ?? 'Unable to update message status.'
    });
  }

  ngOnInit(): void {
    this.tripData.getMessages().subscribe({
      next: (messages) => this.messages = messages,
      error: (error) => this.errorMessage = error.error?.message ?? 'Unable to load messages.'
    });
  }
}
