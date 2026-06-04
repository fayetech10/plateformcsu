import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemandePermission, NouvelleDemandePermission, StatutPermission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permissions`;

  creer(demande: NouvelleDemandePermission): Observable<DemandePermission> {
    return this.http.post<DemandePermission>(this.apiUrl, demande);
  }

  mesDemandes(): Observable<DemandePermission[]> {
    return this.http.get<DemandePermission[]>(`${this.apiUrl}/me`);
  }

  annuler(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /* Admin */
  toutes(statut?: StatutPermission): Observable<DemandePermission[]> {
    let params = new HttpParams();
    if (statut) params = params.set('statut', statut);
    return this.http.get<DemandePermission[]>(this.apiUrl, { params });
  }

  countAttente(): Observable<{ enAttente: number }> {
    return this.http.get<{ enAttente: number }>(`${this.apiUrl}/count-attente`);
  }

  approuver(id: number, commentaire?: string): Observable<DemandePermission> {
    return this.http.put<DemandePermission>(`${this.apiUrl}/${id}/approuver`, { commentaire: commentaire || '' });
  }

  refuser(id: number, commentaire?: string): Observable<DemandePermission> {
    return this.http.put<DemandePermission>(`${this.apiUrl}/${id}/refuser`, { commentaire: commentaire || '' });
  }
}
