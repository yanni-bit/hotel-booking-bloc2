import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelAdminService {

  private apiUrl = 'http://localhost:3000/api/hotels';

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les hôtels
   */
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Récupère un hôtel par ID
   */
  getById(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${hotelId}`);
  }

  /**
   * Crée un nouvel hôtel
   */
  create(hotelData: any): Observable<any> {
    return this.http.post(this.apiUrl, hotelData);
  }

  /**
   * Met à jour un hôtel
   */
  update(hotelId: number, hotelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${hotelId}`, hotelData);
  }

  /**
   * Supprime un hôtel
   */
  delete(hotelId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${hotelId}`);
  }

  /**
 * Récupère les services d'un hôtel avec leurs prix (admin)
 */
  getHotelServices(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${hotelId}/services/admin`);
  }

  /**
   * Met à jour les prix des services d'un hôtel
   */
  updateHotelServices(hotelId: number, services: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${hotelId}/services`, { services });
  }
}