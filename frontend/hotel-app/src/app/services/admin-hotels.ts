// ============================================
// FICHIER : admin-hotels.ts
// DESCRIPTION : Service d'administration des hôtels.
//               Fournit les opérations CRUD complètes pour la gestion
//               des hôtels côté admin, ainsi que la gestion des services
//               associés à chaque hôtel (récupération et mise à jour des prix).
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération de tous les hôtels (getAll)
//   - Récupération d'un hôtel par ID (getById)
//   - Création d'un nouvel hôtel (create)
//   - Mise à jour d'un hôtel existant (update)
//   - Suppression d'un hôtel (delete)
//   - Récupération des services d'un hôtel avec prix (getHotelServices)
//   - Mise à jour des prix des services d'un hôtel (updateHotelServices)
// API : http://localhost:3000/api/hotels
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la gestion administrative des hôtels.
 * Communique avec l'API backend pour les opérations CRUD
 * et la gestion des services associés aux hôtels.
 */
@Injectable({
  providedIn: 'root',
})
export class HotelAdminService {
  /** URL de base de l'API pour les hôtels */
  private apiUrl = 'http://localhost:3000/api/hotels';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // CRUD HÔTELS
  // ============================================================================

  /**
   * Récupère la liste complète de tous les hôtels.
   * @returns {Observable<any>} Observable contenant le tableau des hôtels
   */
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  /**
   * Récupère un hôtel spécifique par son identifiant.
   * @param hotelId - Identifiant unique de l'hôtel
   * @returns {Observable<any>} Observable contenant les données de l'hôtel
   */
  getById(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${hotelId}`);
  }

  /**
   * Crée un nouvel hôtel dans la base de données.
   * @param hotelData - Données du nouvel hôtel à créer
   * @returns {Observable<any>} Observable contenant la réponse de création
   */
  create(hotelData: any): Observable<any> {
    return this.http.post(this.apiUrl, hotelData);
  }

  /**
   * Met à jour les informations d'un hôtel existant.
   * @param hotelId - Identifiant unique de l'hôtel à modifier
   * @param hotelData - Nouvelles données de l'hôtel
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  update(hotelId: number, hotelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${hotelId}`, hotelData);
  }

  /**
   * Supprime un hôtel de la base de données.
   * @param hotelId - Identifiant unique de l'hôtel à supprimer
   * @returns {Observable<any>} Observable contenant la réponse de suppression
   */
  delete(hotelId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${hotelId}`);
  }

  // ============================================================================
  // GESTION DES SERVICES D'UN HÔTEL
  // ============================================================================

  /**
   * Récupère les services associés à un hôtel avec leurs prix (vue admin).
   * @param hotelId - Identifiant unique de l'hôtel
   * @returns {Observable<any>} Observable contenant la liste des services et prix
   */
  getHotelServices(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${hotelId}/services/admin`);
  }

  /**
   * Met à jour les prix des services associés à un hôtel.
   * @param hotelId - Identifiant unique de l'hôtel
   * @param services - Tableau des services avec leurs nouveaux prix
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  updateHotelServices(hotelId: number, services: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${hotelId}/services`, { services });
  }
}
