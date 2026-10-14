import { Routes } from '@angular/router';
import { AddTrip } from './add-trip/add-trip';
import { EditTrip } from './edit-trip/edit-trip';
import { Overview } from './overview/overview';
import { Messages } from './messages/messages';
import { TripListing } from './trip-listing/trip-listing';

export const routes: Routes = [
  { path: '', component: TripListing, pathMatch: 'full' },
  { path: 'overview', component: Overview },
  { path: 'messages', component: Messages },
  { path: 'add-trip', component: AddTrip },
  { path: 'edit-trip/:tripCode', component: EditTrip },
  { path: '**', redirectTo: '' }
];
