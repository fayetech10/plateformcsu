import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BureauCsu } from '../models/bureau.model';

@Injectable({
  providedIn: 'root'
})
export class BureauService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bureaux`;

  getBureaux(page: number = 0, size: number = 10, search?: string): Observable<{ content: BureauCsu[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: BureauCsu[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  getAllBureaux(actifOnly: boolean = false): Observable<BureauCsu[]> {
    return this.http.get<BureauCsu[]>(`${this.apiUrl}/all`, {
      params: new HttpParams().set('actifOnly', actifOnly.toString())
    });
  }

  getBureauById(id: number): Observable<BureauCsu> {
    return this.http.get<BureauCsu>(`${this.apiUrl}/${id}`);
  }

  createBureau(bureau: BureauCsu): Observable<BureauCsu> {
    return this.http.post<BureauCsu>(this.apiUrl, bureau);
  }

  updateBureau(id: number, bureau: BureauCsu): Observable<BureauCsu> {
    return this.http.put<BureauCsu>(`${this.apiUrl}/${id}`, bureau);
  }

  deleteBureau(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
