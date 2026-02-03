// ============================================
// FICHIER : hotel.ts
// DESCRIPTION : Service principal de gestion des hôtels côté client.
//               Fournit les méthodes de récupération des hôtels,
//               détails, hôtels populaires, offre du jour,
//               villes disponibles et recherche full-text avec pagination.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération de tous les hôtels (getAllHotels)
//   - Récupération des détails d'un hôtel (getHotelDetails)
//   - Récupération des hôtels populaires par ville (getPopularHotels)
//   - Récupération des hôtels populaires par pays (getPopularHotelsByCountry)
//   - Récupération de l'offre du jour par pays (getDealOfDay)
//   - Récupération des villes disponibles (getCities)
//   - Recherche full-text avec pagination (searchHotels)
// API : http://localhost:3000/api
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la consultation des hôtels côté client.
 * Communique avec l'API backend pour la récupération des données,
 * la recherche et les recommandations d'hôtels.
 */
@Injectable({
  providedIn: 'root',
})
export class HotelService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // RÉCUPÉRATION DES HÔTELS
  // ============================================================================

  /**
   * Récupère la liste complète de tous les hôtels.
   * @returns {Observable<any>} Observable contenant le tableau des hôtels
   */
  getAllHotels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels`);
  }

  /**
   * Récupère un hôtel avec tous ses détails (description, tags, avis, etc.).
   * @param hotelId - Identifiant unique de l'hôtel
   * @returns {Observable<any>} Observable contenant les détails complets de l'hôtel
   */
  getHotelDetails(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}`);
  }

  // ============================================================================
  // HÔTELS POPULAIRES ET OFFRE DU JOUR
  // ============================================================================

  /**
   * Récupère les hôtels populaires d'une ville.
   * @param city - Nom de la ville
   * @returns {Observable<any>} Observable contenant les hôtels populaires
   */
  getPopularHotels(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/popular/${city}`);
  }

  /**
   * Récupère les hôtels populaires d'un pays en excluant l'hôtel courant.
   * Utilisé dans la sidebar de la page détail hôtel.
   * @param country - Nom du pays
   * @param excludeId - ID de l'hôtel à exclure des résultats
   * @returns {Observable<any>} Observable contenant les hôtels populaires du pays
   */
  getPopularHotelsByCountry(country: string, excludeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/hotels/popular-by-country/${encodeURIComponent(country)}?exclude=${excludeId}`,
    );
  }

  /**
   * Récupère l'offre du jour d'un pays (meilleur rapport qualité/prix).
   * Exclut l'hôtel courant des résultats.
   * @param country - Nom du pays
   * @param excludeId - ID de l'hôtel à exclure
   * @returns {Observable<any>} Observable contenant l'offre du jour
   */
  getDealOfDay(country: string, excludeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/hotels/deal-of-day/${encodeURIComponent(country)}?exclude=${excludeId}`,
    );
  }

  // ============================================================================
  // VILLES ET RECHERCHE
  // ============================================================================

  /**
   * Récupère la liste des villes disponibles (pour le formulaire de recherche).
   * @returns {Observable<any>} Observable contenant la liste des villes
   */
  getCities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cities`);
  }

  /**
   * Recherche full-text d'hôtels avec pagination.
   * @param query - Terme de recherche saisi par l'utilisateur
   * @param page - Numéro de page (défaut : 1)
   * @returns {Observable<any>} Observable contenant les résultats paginés
   */
  searchHotels(query: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?q=${encodeURIComponent(query)}&page=${page}`);
  }
}
