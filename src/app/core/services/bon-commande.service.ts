import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BonCommande, StatutBon } from '../models/bon-commande.model';

@Injectable({
  providedIn: 'root'
})
export class BonCommandeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bons-commande`;

  getBons(page: number = 0, size: number = 10, search?: string): Observable<{ content: BonCommande[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: BonCommande[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getBonById(id: number): Observable<BonCommande> {
    return this.http.get<BonCommande>(`${this.apiUrl}/${id}`);
  }

  getBonsByPatient(patientId: number): Observable<BonCommande[]> {
    return this.http.get<BonCommande[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  createBon(bon: BonCommande): Observable<BonCommande> {
    return this.http.post<BonCommande>(this.apiUrl, bon);
  }

  updateBon(id: number, bon: BonCommande): Observable<BonCommande> {
    return this.http.put<BonCommande>(`${this.apiUrl}/${id}`, bon);
  }

  changerStatut(id: number, statut: StatutBon): Observable<BonCommande> {
    return this.http.put<BonCommande>(`${this.apiUrl}/${id}/statut`, null, {
      params: new HttpParams().set('statut', statut)
    });
  }

  deleteBon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
