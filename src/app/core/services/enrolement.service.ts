import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enrolement, StatutEnrolement, EnrolementRequest } from '../models/enrolement.model';

@Injectable({
  providedIn: 'root'
})
export class EnrolementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/enrolements`;

  getEnrolements(page: number = 0, size: number = 10, statut?: StatutEnrolement, search?: string): Observable<{ content: Enrolement[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (statut) {
      params = params.set('statut', statut);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Enrolement[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getEnrolementById(id: number): Observable<Enrolement> {
    return this.http.get<Enrolement>(`${this.apiUrl}/${id}`);
  }

  createEnrolement(enrolement: EnrolementRequest): Observable<Enrolement> {
    return this.http.post<Enrolement>(this.apiUrl, enrolement);
  }

  updateEnrolement(id: number, enrolement: Enrolement): Observable<Enrolement> {
    return this.http.put<Enrolement>(`${this.apiUrl}/${id}`, enrolement);
  }

  updateStatus(id: number, statut: StatutEnrolement, observations?: string): Observable<Enrolement> {
    return this.http.put<Enrolement>(`${this.apiUrl}/${id}/status`, { statut, observations });
  }

  /** Relance la synchronisation de l'enrôlement vers KoboToolbox (Form 1, adhésion familiale). */
  syncKobo(id: number): Observable<Enrolement> {
    return this.http.post<Enrolement>(`${this.apiUrl}/${id}/sync-kobo`, {});
  }

  /** Envoie les personnes à charge vers le formulaire "Rajout de personnes à charge" (Form 2). */
  syncKoboRajout(id: number): Observable<Enrolement> {
    return this.http.post<Enrolement>(`${this.apiUrl}/${id}/sync-kobo-rajout`, {});
  }
}
