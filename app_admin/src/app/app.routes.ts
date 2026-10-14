import { Routes } from '@angular/router';
import { AddTrip } from './add-trip/add-trip';
import { EditTrip } from './edit-trip/edit-trip';
import { Overview } from './overview/overview';
import { Messages } from './messages/messages';
import { TripListing } from './trip-listing/trip-listing';
import { Login } from './login/login';
import { adminGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: TripListing, pathMatch: 'full', canActivate: [adminGuard] },
  { path: 'overview', component: Overview, canActivate: [adminGuard] },
  { path: 'messages', component: Messages, canActivate: [adminGuard] },
  { path: 'add-trip', component: AddTrip, canActivate: [adminGuard] },
  { path: 'edit-trip/:tripCode', component: EditTrip, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
