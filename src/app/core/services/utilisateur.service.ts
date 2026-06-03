import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  getUtilisateurs(page: number = 0, size: number = 10, search?: string): Observable<{ content: Utilisateur[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Utilisateur[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  createUtilisateur(user: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, user);
  }

  updateUtilisateur(id: number, user: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, user);
  }

  deleteUtilisateur(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleActivation(id: number, active: boolean): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}/toggle-active`, { active });
  }
}
