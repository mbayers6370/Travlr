import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthenticatedUser } from '../models/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Authentication {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiOrigin}/api`;
  private readonly tokenKey = 'travlr-admin-token';
  private readonly userKey = 'travlr-admin-user';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  token(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token && this.isTokenCurrent(token) ? token : null;
  }

  isAuthenticated(): boolean {
    if (this.token()) return true;
    this.clearSession();
    return false;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.user()?.role === 'admin';
  }

  user(): AuthenticatedUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      return null;
    }
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private isTokenCurrent(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (!payload) return false;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(atob(base64)) as { exp?: number };
      return typeof data.exp === 'number' && data.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
