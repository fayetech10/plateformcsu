import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Constat, CategorieConstat, StatutConstat, PrioriteConstat } from '../models/constat.model';

@Injectable({
  providedIn: 'root'
})
export class ConstatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/constats`;

  getConstats(page: number = 0, size: number = 10, statut?: StatutConstat, priorite?: PrioriteConstat, search?: string): Observable<{ content: Constat[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (statut) {
      params = params.set('statut', statut);
    }
    if (priorite) {
      params = params.set('priorite', priorite);
    }
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Constat[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getConstatById(id: number): Observable<Constat> {
    return this.http.get<Constat>(`${this.apiUrl}/${id}`);
  }

  createConstat(constat: Constat): Observable<Constat> {
    return this.http.post<Constat>(this.apiUrl, constat);
  }

  updateConstat(id: number, constat: Constat): Observable<Constat> {
    return this.http.put<Constat>(`${this.apiUrl}/${id}`, constat);
  }

  archiverConstat(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/archiver`, {});
  }

  uploadPiecesJointes(id: number, files: File[]): Observable<Constat> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    return this.http.post<Constat>(`${this.apiUrl}/${id}/attachments`, formData);
  }

  /* ── Categorie Constat ── */
  getCategories(actifOnly: boolean = false): Observable<CategorieConstat[]> {
    return this.http.get<CategorieConstat[]>(`${environment.apiUrl}/categories/constats`, {
      params: new HttpParams().set('actifOnly', actifOnly.toString())
    });
  }

  createCategorie(categorie: CategorieConstat): Observable<CategorieConstat> {
    return this.http.post<CategorieConstat>(`${environment.apiUrl}/categories/constats`, categorie);
  }

  updateCategorie(id: number, categorie: CategorieConstat): Observable<CategorieConstat> {
    return this.http.put<CategorieConstat>(`${environment.apiUrl}/categories/constats/${id}`, categorie);
  }
}
