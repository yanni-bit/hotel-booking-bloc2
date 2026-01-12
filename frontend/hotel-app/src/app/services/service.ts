import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  
  private apiUrl = 'http://localhost:3000/api/services';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Récupère tous les services (admin - inclut inactifs)
   */
  getAllServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }
  
  /**
   * Récupère un service par son ID
   */
  getServiceById(serviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${serviceId}`);
  }
  
  /**
   * Crée un nouveau service
   */
  createService(serviceData: any): Observable<any> {
    return this.http.post(this.apiUrl, serviceData);
  }
  
  /**
   * Met à jour un service
   */
  updateService(serviceId: number, serviceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${serviceId}`, serviceData);
  }
  
  /**
   * Supprime un service
   */
  deleteService(serviceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${serviceId}`);
  }
  
  /**
   * Active/Désactive un service
   */
  toggleServiceStatus(serviceId: number, actif: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${serviceId}/toggle`, { actif });
  }
}