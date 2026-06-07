import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pharmacie } from '../models/pharmacie.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacieService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pharmacies`;

  getPharmacies(page: number = 0, size: number = 10, search?: string): Observable<{ content: Pharmacie[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Pharmacie[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  /** Liste complète (non paginée) — pour la cartographie. */
  getAllPharmacies(): Observable<Pharmacie[]> {
    return this.http.get<Pharmacie[]>(`${this.apiUrl}/all`);
  }

  getPharmacieById(id: number): Observable<Pharmacie> {
    return this.http.get<Pharmacie>(`${this.apiUrl}/${id}`);
  }

  createPharmacie(pharmacie: Pharmacie): Observable<Pharmacie> {
    return this.http.post<Pharmacie>(this.apiUrl, pharmacie);
  }

  updatePharmacie(id: number, pharmacie: Pharmacie): Observable<Pharmacie> {
    return this.http.put<Pharmacie>(`${this.apiUrl}/${id}`, pharmacie);
  }

  deletePharmacie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
