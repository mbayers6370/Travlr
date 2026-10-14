import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TripListing } from './trip-listing';
import { Trip } from '../models/trip';
import { TripData } from '../services/trip-data';
import { Router } from '@angular/router';

describe('TripListing', () => {
  let component: TripListing;
  let fixture: ComponentFixture<TripListing>;
  const tripData = {
    getTrips: vi.fn(),
    deleteTrip: vi.fn()
  };
  const router = { navigate: vi.fn() };
  const trip: Trip = {
    code: 'TEST-TRIP',
    name: 'Test Trip',
    length: '1 night',
    start: '2026-01-01',
    resort: 'Test Resort',
    perPerson: 'From 1',
    image: 'Travel.jpg',
    description: 'Trip listing test data.'
  };

  beforeEach(async () => {
    tripData.getTrips.mockReturnValue(of([]));
    tripData.deleteTrip.mockReturnValue(of({ message: 'Trip deleted' }));

    await TestBed.configureTestingModule({
      imports: [TripListing],
      providers: [
        { provide: TripData, useValue: tripData },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not delete a trip when the dialog is cancelled', () => {
    component.trips = [trip];
    component.openDeleteDialog(trip);

    component.closeDeleteDialog();

    expect(tripData.deleteTrip).not.toHaveBeenCalled();
    expect(component.trips).toEqual([trip]);
    expect(component.tripToDelete).toBeNull();
  });

  it('should remove a trip from the listing after a confirmed delete', () => {
    component.trips = [trip];
    component.openDeleteDialog(trip);

    component.confirmDelete();

    expect(tripData.deleteTrip).toHaveBeenCalledWith(trip.code);
    expect(component.trips).toEqual([]);
    expect(component.tripToDelete).toBeNull();
  });
});
