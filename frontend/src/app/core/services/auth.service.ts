import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

const TOKEN_KEY = 'ecommerce_token';
const USER_KEY = 'ecommerce_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  // ── Signals ──
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null && this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    this.initializeFromStorage();
  }

  /** Decode JWT payload without verifying signature (client-side only) */
  decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  /** On app start, restore session from localStorage */
  initializeFromStorage(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this._token.set(token);
        this._currentUser.set(user);
      } catch {
        this.clearStorage();
      }
    } else if (token) {
      // Recover user if only token is present
      const payload = this.decodeToken(token);
      if (payload?.id) {
        this._token.set(token);
        this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${payload.id}`).subscribe({
          next: (res) => {
            this._currentUser.set(res.data);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          },
          error: () => this.clearStorage()
        });
      } else {
        this.clearStorage();
      }
    }
  }

  /** Login: POST /users/login → get token → decode JWT → GET /users/:id */
  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/users/login`, credentials)
      .pipe(
        switchMap((res) => {
          const token = res.token;
          const payload = this.decodeToken(token);
          if (!payload?.id) {
            return throwError(() => new Error('Invalid token payload'));
          }
          this._token.set(token);
          localStorage.setItem(TOKEN_KEY, token);
          // Fetch full user profile
          return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${payload.id}`);
        }),
        tap((res) => {
          const user = res.data;
          this._currentUser.set(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }),
        switchMap((res) => of(res.data)),
        catchError((err) => {
          this.clearStorage();
          return throwError(() => err);
        }),
      );
  }

  /** Register: POST /users/register → auto-login */
  register(data: RegisterRequest): Observable<User> {
    // Never send role from public UI
    const { ...payload } = data;
    return this.http
      .post<ApiResponse<User>>(`${this.apiUrl}/users/register`, payload)
      .pipe(
        switchMap(() =>
          this.login({ email: data.email, password: data.password }),
        ),
      );
  }

  /** Logout: clear state and redirect */
  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  /** Get stored token for interceptor */
  getToken(): string | null {
    return this._token();
  }

  /** Update cached user (after profile edit) */
  updateCachedUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /** Forgot Password: POST /users/forgot-password */
  forgotPassword(email: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/users/forgot-password`, { email });
  }

  /** Reset Password: POST /users/reset-password */
  resetPassword(token: string, newPassword: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/users/reset-password`, { token, newPassword });
  }

  private clearStorage(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
