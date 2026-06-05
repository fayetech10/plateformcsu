import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboardStats, BureauDetail, AdminAgentStats, AdminGeoStats, PonctualiteStats, BureauCarte } from '../models/admin-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/stats`);
  }

  getBureauDetail(id: number): Observable<BureauDetail> {
    return this.http.get<BureauDetail>(`${this.apiUrl}/bureaux/${id}`);
  }

  getStatsAgents(): Observable<AdminAgentStats> {
    return this.http.get<AdminAgentStats>(`${this.apiUrl}/stats-agents`);
  }

  getStatsGeo(): Observable<AdminGeoStats> {
    return this.http.get<AdminGeoStats>(`${this.apiUrl}/stats-geo`);
  }

  getStatsPonctualite(): Observable<PonctualiteStats> {
    return this.http.get<PonctualiteStats>(`${this.apiUrl}/stats-ponctualite`);
  }

  getBureauxCarte(): Observable<BureauCarte[]> {
    return this.http.get<BureauCarte[]>(`${this.apiUrl}/bureaux-carte`);
  }
}
