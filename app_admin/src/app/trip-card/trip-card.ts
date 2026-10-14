import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-trip-card',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.css',
})
export class TripCard {
  @Input({ required: true }) trip!: Trip;
  @Output() deleteRequested = new EventEmitter<Trip>();

  constructor(
    private router: Router,
    private tripData: TripData
  ) {}

  imageUrl(filename: string): string {
    return this.tripData.imageUrl(filename);
  }

  editTrip(): void {
    this.router.navigate(['/edit-trip', this.trip.code]);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.trip);
  }
}
