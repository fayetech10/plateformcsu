import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PointageStatutJour, PointageLigne, PointagesJour, Coordonnees, PointageArriveeResponse, PositionResultat } from '../models/pointage.model';
import { SKIP_LOADER } from '../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pointages`;

  getMyToday(): Observable<PointageStatutJour> {
    // Rappel de pointage chargé en arrière-plan → pas de loader global
    return this.http.get<PointageStatutJour>(`${this.apiUrl}/me/today`, { headers: SKIP_LOADER });
  }

  pointerArrivee(coords?: Coordonnees): Observable<PointageArriveeResponse> {
    return this.http.post<PointageArriveeResponse>(`${this.apiUrl}/arrivee`, coords || {});
  }

  /**
   * Récupère la position GPS courante du navigateur, avec la cause d'échec
   * éventuelle (refus, indisponible, délai dépassé, non supporté).
   */
  obtenirPositionDetaillee(): Promise<PositionResultat> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({ coords: null, erreur: 'unsupported' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            precision: pos.coords.accuracy
          },
          erreur: null
        }),
        (err) => {
          let erreur: PositionResultat['erreur'] = 'unavailable';
          if (err.code === err.PERMISSION_DENIED) erreur = 'denied';
          else if (err.code === err.TIMEOUT) erreur = 'timeout';
          else if (err.code === err.POSITION_UNAVAILABLE) erreur = 'unavailable';
          resolve({ coords: null, erreur });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Récupère la position GPS courante du navigateur.
   * Renvoie null si refusée / indisponible.
   */
  async obtenirPosition(): Promise<Coordonnees | null> {
    const res = await this.obtenirPositionDetaillee();
    return res.coords;
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
