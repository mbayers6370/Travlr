import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripCard } from '../trip-card/trip-card';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-listing',
  imports: [CommonModule, TripCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
})
export class TripListing implements OnInit {
  trips: Trip[] = [];
  tripToDelete: Trip | null = null;
  deleteErrorMessage = '';

  constructor(
    private tripData: TripData,
    private router: Router
  ) {}

  addTrip(): void {
    this.router.navigate(['/add-trip']);
  }

  openDeleteDialog(trip: Trip): void {
    this.tripToDelete = trip;
    this.deleteErrorMessage = '';
  }

  closeDeleteDialog(): void {
    this.tripToDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDelete(): void {
    if (!this.tripToDelete) {
      return;
    }

    const trip = this.tripToDelete;

    this.tripData.deleteTrip(trip.code).subscribe({
      next: () => {
        this.trips = this.trips.filter((currentTrip) => currentTrip.code !== trip.code);
        this.closeDeleteDialog();
      },
      error: (error) => {
        this.deleteErrorMessage = error.error?.message ?? 'Unable to delete this trip.';
      }
    });
  }

  ngOnInit(): void {
    this.tripData.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
      },
      error: (error) => {
        console.error('Unable to load trips:', error);
      }
    });
  }
}
