import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Récupère les détails d'une offre pour la réservation
   */
  getOffreDetails(offreId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/offres/${offreId}`);
  }

  /**
   * Crée une nouvelle réservation
   */
  createReservation(reservationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, reservationData);
  }

  /**
 * Récupère les services additionnels d'un hôtel
 */
  getHotelServices(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/services`);
  }
}