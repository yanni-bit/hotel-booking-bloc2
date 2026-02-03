// ============================================
// FICHIER : service.ts
// DESCRIPTION : Service d'administration des services additionnels (spa,
//               petit-déjeuner, parking, etc.) proposés par les hôtels.
//               Fournit les opérations CRUD complètes ainsi que
//               l'activation/désactivation d'un service.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération de tous les services incluant les inactifs (getAllServices)
//   - Récupération d'un service par ID (getServiceById)
//   - Création d'un nouveau service (createService)
//   - Mise à jour d'un service existant (updateService)
//   - Suppression d'un service (deleteService)
//   - Activation/désactivation d'un service (toggleServiceStatus)
// API : http://localhost:3000/api/services
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la gestion administrative des services additionnels.
 * Communique avec l'API backend pour les opérations CRUD
 * et le contrôle de l'état actif/inactif des services.
 */
@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  /** URL de base de l'API pour les services */
  private apiUrl = 'http://localhost:3000/api/services';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // CRUD SERVICES
  // ============================================================================

  /**
   * Récupère tous les services (ADMIN - inclut les services inactifs).
   * @returns {Observable<any>} Observable contenant la liste complète des services
   */
  getAllServices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  /**
   * Récupère un service spécifique par son identifiant.
   * @param serviceId - Identifiant unique du service
   * @returns {Observable<any>} Observable contenant les données du service
   */
  getServiceById(serviceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${serviceId}`);
  }

  /**
   * Crée un nouveau service additionnel.
   * @param serviceData - Données du service à créer
   * @returns {Observable<any>} Observable contenant la réponse de création
   */
  createService(serviceData: any): Observable<any> {
    return this.http.post(this.apiUrl, serviceData);
  }

  /**
   * Met à jour un service existant.
   * @param serviceId - Identifiant unique du service à modifier
   * @param serviceData - Nouvelles données du service
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  updateService(serviceId: number, serviceData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${serviceId}`, serviceData);
  }

  /**
   * Supprime un service.
   * @param serviceId - Identifiant unique du service à supprimer
   * @returns {Observable<any>} Observable contenant la réponse de suppression
   */
  deleteService(serviceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${serviceId}`);
  }

  // ============================================================================
  // ACTIVATION / DÉSACTIVATION
  // ============================================================================

  /**
   * Active ou désactive un service (PATCH partiel).
   * @param serviceId - Identifiant unique du service
   * @param actif - 1 pour activer, 0 pour désactiver
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  toggleServiceStatus(serviceId: number, actif: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${serviceId}/toggle`, { actif });
  }
}
