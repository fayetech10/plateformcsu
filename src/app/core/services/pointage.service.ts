import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PointageStatutJour, PointageLigne, PointagesJour, Coordonnees, PointageArriveeResponse } from '../models/pointage.model';

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pointages`;

  getMyToday(): Observable<PointageStatutJour> {
    return this.http.get<PointageStatutJour>(`${this.apiUrl}/me/today`);
  }

  pointerArrivee(coords?: Coordonnees): Observable<PointageArriveeResponse> {
    return this.http.post<PointageArriveeResponse>(`${this.apiUrl}/arrivee`, coords || {});
  }

  /**
   * Récupère la position GPS courante du navigateur.
   * Renvoie null si refusée / indisponible (le pointage se fera sans contrôle).
   */
  obtenirPosition(): Promise<Coordonnees | null> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          precision: pos.coords.accuracy
        }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  pointerDepart(coords?: Coordonnees): Observable<PointageArriveeResponse & { heureDepart: string }> {
    return this.http.post<PointageArriveeResponse & { heureDepart: string }>(`${this.apiUrl}/depart`, coords || {});
  }

  getMyHistory(): Observable<PointageLigne[]> {
    return this.http.get<PointageLigne[]>(`${this.apiUrl}/me`);
  }

  getPointagesJour(date?: string): Observable<PointagesJour> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<PointagesJour>(`${this.apiUrl}/jour`, { params });
  }

  getHistorique(debut?: string, fin?: string): Observable<PointageLigne[]> {
    let params = new HttpParams();
    if (debut) params = params.set('debut', debut);
    if (fin) params = params.set('fin', fin);
    return this.http.get<PointageLigne[]>(`${this.apiUrl}/historique`, { params });
  }
}
