import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/signin`, credentials)
      .pipe(
        tap(response => {
          // Since the backend doesn't return a token, we'll use a simple flag
          // In a real JWT implementation, the backend would return a token
          this.setAuthData('dummy-token', response);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/signup`, userData);
  }

  logout(): void {
    this.clearAuthData();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.userType === 'admin';
  }

  isStudent(): boolean {
    const user = this.currentUserSubject.value;
    return user?.userType === 'student';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setAuthData(token: string, authResponse: AuthResponse): void {
    // Map AuthResponse to User interface
    const user: User = {
      id: authResponse.studentId || 0, // Use studentId if available, otherwise 0
      username: authResponse.username,
      email: authResponse.studentInfo?.email || '',
      firstName: authResponse.studentInfo?.firstName || '',
      lastName: authResponse.studentInfo?.lastName || '',
      phoneNumber: authResponse.studentInfo?.phoneNumber || '',
      userType: authResponse.userType,
      status: 'approved', // Assuming approved if login is successful
      studentId: authResponse.studentId,
      studentInfo: authResponse.studentInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
