import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';
import { tap } from 'rxjs/operators';
import { RapportSummary } from '../models/rapport-summary.model';
import { SKIP_LOADER } from '../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rapports`;

  /** Synthèse JSON des indicateurs de la période (aperçu à l'écran). */
  getSummary(startDate: string, endDate: string, bureauCsuId?: number, agentId?: number): Observable<RapportSummary> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    if (bureauCsuId) params = params.set('bureau_id', bureauCsuId.toString());
    if (agentId) params = params.set('created_by', agentId.toString());

    return this.http.get<RapportSummary>(`${this.apiUrl}/summary`, { params, headers: SKIP_LOADER });
  }

  downloadPdf(startDate: string, endDate: string, bureauCsuId?: number, structureId?: number, agentId?: number): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (bureauCsuId) params = params.set('bureau_id', bureauCsuId.toString());
    if (structureId) params = params.set('structure_id', structureId.toString());
    if (agentId) params = params.set('created_by', agentId.toString());

    return this.http.get(`${this.apiUrl}/pdf`, {
      params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        saveAs(blob, `rapport_csu_${startDate}_${endDate}.pdf`);
      })
    );
  }

  downloadExcel(startDate: string, endDate: string, bureauCsuId?: number, structureId?: number, agentId?: number): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (bureauCsuId) params = params.set('bureau_id', bureauCsuId.toString());
    if (structureId) params = params.set('structure_id', structureId.toString());
    if (agentId) params = params.set('created_by', agentId.toString());

    return this.http.get(`${this.apiUrl}/excel`, {
      params,
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        saveAs(blob, `rapport_csu_${startDate}_${endDate}.xlsx`);
      })
    );
  }
}
