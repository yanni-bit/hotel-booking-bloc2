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
  getAllServices(idCategorie?: number | null): Observable<any> {
    // Le paramètre est facultatif : sans lui, l'API renvoie tous les services.
    const params = idCategorie ? `?categorie=${idCategorie}` : '';
    return this.http.get(`${this.apiUrl}/admin${params}`);
  }

  /**
   * Récupère le catalogue public filtré par catégorie.
   * @param idCategorie - Identifiant de catégorie, facultatif
   * @returns {Observable<any>} Services actifs, filtrés si une catégorie est fournie
   */
  getPublicServices(idCategorie?: number | null): Observable<any> {
    const params = idCategorie ? `?categorie=${idCategorie}` : '';
    return this.http.get(`${this.apiUrl}${params}`);
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

  // ==========================================================================
  // CATÉGORIES DE SERVICES
  //
  // Une catégorie regroupe des services par nature (Restauration, Transport...).
  // À ne pas confondre avec type_service, qui est le mode de tarification et
  // pilote le calcul des prix.
  // ==========================================================================

  /**
   * Récupère les catégories actives, pour les listes déroulantes et les filtres.
   * @returns {Observable<any>} Catégories triées par ordre d'affichage
   */
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  /**
   * Récupère toutes les catégories avec le nombre de services rattachés (ADMIN).
   * @returns {Observable<any>} Catégories, actives ou non
   */
  getCategoriesAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/admin`);
  }

  /**
   * Crée une catégorie (ADMIN).
   * @param data - Libellé, ordre d'affichage et activité
   * @returns {Observable<any>} Réponse contenant l'identifiant créé
   */
  createCategorie(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, data);
  }

  /**
   * Modifie une catégorie (ADMIN). Le code technique n'est pas modifiable.
   * @param idCategorie - Identifiant de la catégorie
   * @param data - Nouvelles valeurs
   * @returns {Observable<any>} Réponse de l'API
   */
  updateCategorie(idCategorie: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${idCategorie}`, data);
  }

  /**
   * Supprime une catégorie (ADMIN).
   * L'API répond 409 si des services y sont rattachés.
   * @param idCategorie - Identifiant de la catégorie
   * @returns {Observable<any>} Réponse de l'API
   */
  deleteCategorie(idCategorie: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${idCategorie}`);
  }
}
