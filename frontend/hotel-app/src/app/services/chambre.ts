import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChambreService {
  
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Récupère les chambres d'un hôtel
   */
  getChambresByHotelId(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/chambres`);
  }

  /**
 * Récupère une chambre avec toutes ses offres
 */
getChambreWithOffers(chambreId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/chambres/${chambreId}`);
}
}