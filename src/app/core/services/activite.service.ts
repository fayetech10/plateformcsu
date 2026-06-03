import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activite, CategorieActivite, TypeActivite } from '../models/activite.model';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activites`;

  getActivites(page: number = 0, size: number = 10, typeActivite?: TypeActivite, search?: string): Observable<{ content: Activite[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (typeActivite) {
      params = params.set('typeActivite', typeActivite);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Activite[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getActiviteById(id: number): Observable<Activite> {
    return this.http.get<Activite>(`${this.apiUrl}/${id}`);
  }

  createActivite(activite: Activite): Observable<Activite> {
    return this.http.post<Activite>(this.apiUrl, activite);
  }

  updateActivite(id: number, activite: Activite): Observable<Activite> {
    return this.http.put<Activite>(`${this.apiUrl}/${id}`, activite);
  }

  deleteActivite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /* ── Categorie Activite ── */
  getCategories(actifOnly: boolean = false): Observable<CategorieActivite[]> {
    return this.http.get<CategorieActivite[]>(`${environment.apiUrl}/categories/activites`, {
      params: new HttpParams().set('actifOnly', actifOnly.toString())
    });
  }

  createCategorie(categorie: CategorieActivite): Observable<CategorieActivite> {
    return this.http.post<CategorieActivite>(`${environment.apiUrl}/categories/activites`, categorie);
  }

  updateCategorie(id: number, categorie: CategorieActivite): Observable<CategorieActivite> {
    return this.http.put<CategorieActivite>(`${environment.apiUrl}/categories/activites/${id}`, categorie);
  }
}
