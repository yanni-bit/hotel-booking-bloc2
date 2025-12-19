import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Récupérer tous les hôtels
  getAllHotels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels`);
  }

  /**
 * Récupère un hôtel avec tous ses détails
 */
  getHotelDetails(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}`);
  }

  /**
   * Récupère les hôtels populaires d'une ville
   */
  getPopularHotels(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/popular/${city}`);
  }
}