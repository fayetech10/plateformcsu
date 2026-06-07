import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LettreGarantie, EmissionLettre } from '../models/lettre-garantie.model';

@Injectable({
  providedIn: 'root'
})
export class LettreGarantieService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lettres-garantie`;

  /** Lettres d'un patient (les plus récentes d'abord). */
  getByPatient(patientId: number): Observable<LettreGarantie[]> {
    return this.http.get<LettreGarantie[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  /** Lettre actuellement valide (204 → null). */
  getActive(patientId: number): Observable<LettreGarantie | null> {
    return this.http.get<LettreGarantie | null>(`${this.apiUrl}/patient/${patientId}/active`);
  }

  getById(id: number): Observable<LettreGarantie> {
    return this.http.get<LettreGarantie>(`${this.apiUrl}/${id}`);
  }

  /** Émet une lettre (ou réutilise la lettre valide existante). */
  emettre(patientId: number): Observable<EmissionLettre> {
    return this.http.post<EmissionLettre>(`${this.apiUrl}/emettre`, null, {
      params: new HttpParams().set('patientId', patientId.toString())
    });
  }
}
