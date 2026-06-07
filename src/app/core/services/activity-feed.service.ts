import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityEvent, ActivitySince } from '../models/activity-event.model';
import { SKIP_LOADER } from '../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ActivityFeedService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/activity`;

  /** Flux d'activité récent. Le polling utilise SKIP_LOADER pour ne pas afficher le loader global. */
  getFeed(limit: number = 40, type?: string, silent: boolean = false): Observable<ActivityEvent[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (type) params = params.set('type', type);
    return this.http.get<ActivityEvent[]>(`${this.apiUrl}/feed`, {
      params,
      headers: silent ? SKIP_LOADER : undefined
    });
  }

  /** Nombre d'événements depuis un horodatage (pour le badge de notification). */
  getSince(ts?: string | null): Observable<ActivitySince> {
    let params = new HttpParams();
    if (ts) params = params.set('ts', ts);
    return this.http.get<ActivitySince>(`${this.apiUrl}/since`, { params, headers: SKIP_LOADER });
  }
}
