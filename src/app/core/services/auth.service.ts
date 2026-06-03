import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, ResetPasswordRequest } from '../models/auth.model';

interface DecodedToken {
  sub: string;
  role: string;
  nom: string;
  prenom: string;
  agent_id?: number;
  bureau_id?: number;
  structure_id?: number;
  bureauCsuNom?: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('csu_token');
      if (token && !this.isTokenExpired(token)) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const userResponse: LoginResponse = {
            token,
            username: decoded.sub,
            role: decoded.role,
            nom: decoded.nom,
            prenom: decoded.prenom,
            agent_id: decoded.agent_id,
            bureau_id: decoded.bureau_id,
            structure_id: decoded.structure_id,
            bureauCsuNom: decoded.bureauCsuNom
          };
          this.currentUserSubject.next(userResponse);
        } catch (e) {
          this.logout();
        }
      } else {
        this.logout();
      }
    }
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('csu_token');
    }
    return null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // FAKE AUTHENTICATION FOR DEVELOPMENT
    const fakePayload = {
      sub: credentials.username,
      role: credentials.username === 'admin' ? 'ADMIN' : 'AGENT',
      nom: 'Admin',
      prenom: 'Test',
      agent_id: credentials.username === 'admin' ? 999 : 101,
      bureau_id: credentials.username === 'admin' ? undefined : 1,
      structure_id: credentials.username === 'admin' ? undefined : 10,
      bureauCsuNom: 'Bureau Central',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 1 day validity
    };
    
    // Create a fake JWT token structure (header.payload.signature)
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                      btoa(JSON.stringify(fakePayload)) + 
                      '.fake_signature_for_dev';

    const response: LoginResponse = {
      token: fakeToken,
      username: fakePayload.sub,
      role: fakePayload.role,
      nom: fakePayload.nom,
      prenom: fakePayload.prenom,
      agent_id: fakePayload.agent_id,
      bureau_id: fakePayload.bureau_id,
      structure_id: fakePayload.structure_id,
      bureauCsuNom: fakePayload.bureauCsuNom
    };

    return of(response).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('csu_token', res.token);
        }
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('csu_token');
    }
    this.currentUserSubject.next(null);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, request);
  }

  isLoggedIn(): boolean {
    const token = this.token;
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(allowedRoles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }

  isAdmin(): boolean {
    return this.hasRole(['ADMIN']);
  }

  isSuperviseur(): boolean {
    return this.hasRole(['SUPERVISEUR']);
  }

  isAgent(): boolean {
    return this.hasRole(['AGENT']);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.exp) return false;
      const expirationDate = decoded.exp * 1000;
      return expirationDate < Date.now();
    } catch (e) {
      return true;
    }
  }
}
