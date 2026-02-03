// ============================================
// FICHIER : chambre.ts
// DESCRIPTION : Service de gestion des chambres d'hôtel.
//               Fournit les méthodes pour récupérer les chambres
//               d'un hôtel et les détails d'une chambre avec ses offres.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération des chambres d'un hôtel (getChambresByHotelId)
//   - Récupération d'une chambre avec toutes ses offres (getChambreWithOffers)
// API : http://localhost:3000/api
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la gestion des chambres.
 * Communique avec l'API backend pour récupérer les données
 * des chambres et leurs offres associées.
 */
@Injectable({
  providedIn: 'root',
})
export class ChambreService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les chambres d'un hôtel spécifique.
   * @param hotelId - Identifiant unique de l'hôtel
   * @returns {Observable<any>} Observable contenant la liste des chambres
   */
  getChambresByHotelId(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/chambres`);
  }

  /**
   * Récupère une chambre spécifique avec toutes ses offres associées.
   * @param chambreId - Identifiant unique de la chambre
   * @returns {Observable<any>} Observable contenant la chambre et ses offres
   */
  getChambreWithOffers(chambreId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chambres/${chambreId}`);
  }
}
