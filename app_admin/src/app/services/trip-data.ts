import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../models/trip';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class TripData {
  private apiOrigin = 'http://localhost:3000';
  private apiUrl = `${this.apiOrigin}/api/trips`;

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiOrigin}/api/messages`);
  }

  setMessageReadState(messageId: string, isRead: boolean): Observable<Message> {
    return this.http.patch<Message>(`${this.apiOrigin}/api/messages/${encodeURIComponent(messageId)}/read`, { isRead });
  }

  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${encodeURIComponent(tripCode)}`);
  }

  addTrip(formData: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, formData);
  }

  updateTrip(tripCode: string, formData: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${encodeURIComponent(tripCode)}`, formData);
  }

  deleteTrip(tripCode: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${encodeURIComponent(tripCode)}`);
  }

  uploadTripImage(image: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<{ filename: string }>(`${this.apiUrl}/upload`, formData);
  }

  imageUrl(filename: string): string {
    return `${this.apiOrigin}/images/${encodeURIComponent(filename)}`;
  }
}
