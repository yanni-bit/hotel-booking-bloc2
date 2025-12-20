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

  /**
   * Récupère les réservations d'un utilisateur
   */
  getUserReservations(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/user/${userId}`);
  }

  /**
 * Annule une réservation
 */
  cancelReservation(reservationId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservations/${reservationId}/cancel`, { userId });
  }

  /**
 * Récupère TOUTES les réservations (admin)
 */
getAllReservations(): Observable<any> {
  return this.http.get(`${this.apiUrl}/reservations/all`);
}

/**
 * Change le statut d'une réservation (admin)
 */
updateReservationStatus(reservationId: number, newStatusId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/reservations/${reservationId}/status`, { newStatusId });
}
}