import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemandePermission, NouvelleDemandePermission, StatutPermission } from '../models/permission.model';
import { SKIP_LOADER } from '../interceptors/loading.interceptor';

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
    // Chargé en arrière-plan (le composant a son propre indicateur) → pas de loader global
    return this.http.get<DemandePermission[]>(`${this.apiUrl}/me`, { headers: SKIP_LOADER });
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
    // Polling périodique discret (navbar) → pas de loader global
    return this.http.get<{ enAttente: number }>(`${this.apiUrl}/count-attente`, { headers: SKIP_LOADER });
  }

  approuver(id: number, commentaire?: string): Observable<DemandePermission> {
    return this.http.put<DemandePermission>(`${this.apiUrl}/${id}/approuver`, { commentaire: commentaire || '' });
  }

  refuser(id: number, commentaire?: string): Observable<DemandePermission> {
    return this.http.put<DemandePermission>(`${this.apiUrl}/${id}/refuser`, { commentaire: commentaire || '' });
  }
}
