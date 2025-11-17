/**
 * Authentication Service - Complete Fix
 * Author: RakshaRajkumar14
 * Date: 2025-11-17 10:06:52 UTC
 * Fixed: localStorage safety checks, proper error handling
 */

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
  full_name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private apiUrl = 'http://localhost:8000/api';
  private isBrowser: boolean;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    console.log('🔧 AuthService initialized');
    console.log('📍 API URL:', this.apiUrl);
    console.log('🌐 Is Browser:', this.isBrowser);
    
    // Load current user if token exists
    if (this.isBrowser) {
      const user = this.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(user);
        console.log('✅ User loaded from storage:', user.username);
      }
    }
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Attempting login for:', username);
    
    // Create OAuth2 form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, 
      formData.toString(), 
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ).pipe(
      timeout(10000), // 10 second timeout
      tap(response => {
        console.log('✅ Login successful:', response);
        
        if (response.access_token && response.user) {
          this.setToken(response.access_token);
          this.setCurrentUser(response.user);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        console.error('🚨 Login error caught:', error);
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('👋 Logging out...');
    
    this.removeToken();
    this.removeCurrentUser();
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    const hasToken = !!token;
    
    console.log('🔍 Is logged in check:', hasToken);
    return hasToken;
  }

  /**
   * Get current user info from backend
   */
  getCurrentUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        console.log('✅ User details fetched:', user);
        this.setCurrentUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('❌ Failed to fetch user details:', error);
        return throwError(() => error);
      })
    );
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Get authentication token from localStorage
   */
  getToken(): string | null {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error reading token:', error);
      return null;
    }
  }

  /**
   * Save authentication token to localStorage
   */
  setToken(token: string): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      console.warn('⚠️ localStorage not available');
      return;
    }
    
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ Token saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving token:', error);
    }
  }

  /**
   * Remove authentication token from localStorage
   */
  removeToken(): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('🗑️ Token removed from localStorage');
    } catch (error) {
      console.error('❌ Error removing token:', error);
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('❌ Error reading user from localStorage:', error);
      return null;
    }
  }

  /**
   * Save current user to localStorage
   */
  setCurrentUser(user: User): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      console.warn('⚠️ localStorage not available');
      return;
    }
    
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('✅ User saved to localStorage:', user.username);
    } catch (error) {
      console.error('❌ Error saving user:', error);
    }
  }

  /**
   * Remove current user from localStorage
   */
  removeCurrentUser(): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(this.USER_KEY);
      console.log('🗑️ User removed from localStorage');
    } catch (error) {
      console.error('❌ Error removing user:', error);
    }
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): void {
    console.error('🔥 HTTP Error Details:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });
    
    if (error.status === 0) {
      console.error('❌ Network error - Backend might be offline');
      console.error('   Check: http://localhost:8000/api/health');
    } else if (error.status === 401) {
      console.error('🔒 Authentication failed - Invalid credentials');
    } else if (error.status === 422) {
      console.error('⚠️ Validation error - Check request format');
      if (error.error && error.error.detail) {
        console.error('   Details:', error.error.detail);
      }
    } else if (error.status === 500) {
      console.error('⚠️ Server error');
    } else {
      console.error('⚠️ Unknown error:', error.status);
    }
  }
}