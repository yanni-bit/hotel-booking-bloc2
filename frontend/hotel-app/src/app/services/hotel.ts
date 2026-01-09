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

  /**
 * Récupère les hôtels populaires d'un pays (exclut l'hôtel courant)
 */
  getPopularHotelsByCountry(country: string, excludeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/popular-by-country/${encodeURIComponent(country)}?exclude=${excludeId}`);
  }

  /**
 * Récupère l'offre du jour d'un pays (meilleur rapport qualité/prix)
 */
  getDealOfDay(country: string, excludeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/deal-of-day/${encodeURIComponent(country)}?exclude=${excludeId}`);
  }

  // Récupérer les villes disponibles
  getCities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cities`);
  }

  // Recherche full-text hôtels avec pagination
  searchHotels(query: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}`);
  }
}