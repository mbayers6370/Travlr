import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripCard } from './trip-card';
import { Trip } from '../models/trip';

describe('TripCard', () => {
  let component: TripCard;
  let fixture: ComponentFixture<TripCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('trip', {
      code: 'TEST-TRIP',
      name: 'Test Trip',
      length: '1 night',
      start: '2026-01-01',
      resort: 'Test Resort',
      perPerson: 'From 1',
      image: 'Travel.jpg',
      description: 'Trip card test data.'
    } satisfies Trip);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request deletion for its trip', () => {
    const deleteRequested = vi.fn();
    component.deleteRequested.subscribe(deleteRequested);

    component.requestDelete();

    expect(deleteRequested).toHaveBeenCalledWith(component.trip);
  });
});
