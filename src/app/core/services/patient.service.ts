import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/patients`;

  getPatients(page: number = 0, size: number = 10, search?: string): Observable<{ content: Patient[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<{ content: Patient[], totalElements: number, totalPages: number }>(this.apiUrl, { params });
  }

  searchPatients(criteria: any, page: number = 0, size: number = 10): Observable<{ content: Patient[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    Object.keys(criteria).forEach(key => {
      if (criteria[key] !== null && criteria[key] !== undefined && criteria[key] !== '') {
        params = params.set(key, criteria[key]);
      }
    });

    return this.http.get<{ content: Patient[], totalElements: number, totalPages: number }>(`${this.apiUrl}/search`, { params });
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
