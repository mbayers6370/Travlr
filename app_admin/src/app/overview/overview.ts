import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';
import { Message } from '../models/message';
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview implements OnInit {
  trips: Trip[] = [];
  messages: Message[] = [];
  errorMessage = '';

  constructor(private tripData: TripData) {}

  get resortCount(): number {
    return new Set(this.trips.map((trip) => trip.resort)).size;
  }

  get totalNights(): number {
    return this.trips.reduce((total, trip) => total + (Number.parseInt(trip.length, 10) || 0), 0);
  }

  get nextTrip(): Trip | undefined {
    return [...this.trips].sort((first, second) =>
      new Date(first.start).getTime() - new Date(second.start).getTime()
    )[0];
  }

  get unreadMessageCount(): number {
    return this.messages.filter((message) => !message.isRead).length;
  }

  get latestMessage(): Message | undefined {
    return [...this.messages].sort((first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    )[0];
  }

  messageSubject(message: Message): string {
    return message.subject || (message.kind === 'trip' ? 'Trip inquiry' : message.kind === 'room' ? 'Room inquiry' : 'Contact message');
  }

  imageUrl(filename: string): string {
    return this.tripData.imageUrl(filename);
  }

  ngOnInit(): void {
    this.tripData.getTrips().subscribe({
      next: (trips) => this.trips = trips,
      error: (error) => this.errorMessage = error.error?.message ?? 'Unable to load overview.'
    });

    this.tripData.getMessages().subscribe({
      next: (messages) => this.messages = messages,
      error: () => this.messages = []
    });
  }
}
