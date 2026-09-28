// ============================================
// FICHIER : reservation.ts
// DESCRIPTION : Service de gestion des réservations.
//               Fournit les méthodes pour créer, consulter, annuler
//               des réservations côté client, ainsi que les méthodes
//               d'administration (liste complète, changement de statut).
//               Gère aussi la récupération des offres et services liés.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération des détails d'une offre (getOffreDetails)
//   - Création d'une réservation (createReservation)
//   - Récupération des services additionnels d'un hôtel (getHotelServices)
//   - Récupération des réservations d'un utilisateur (getUserReservations)
//   - Récupération d'une réservation par ID (getReservationById)
//   - Annulation d'une réservation (cancelReservation)
//   - Modification d'une réservation non payée (updateReservation)
//   - Récupération des services d'une réservation (getReservationServices)
//   - [ADMIN] Récupération de toutes les réservations (getAllReservations)
//   - [ADMIN] Changement de statut d'une réservation (updateReservationStatus)
// API : http://localhost:3000/api
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la gestion des réservations.
 * Utilisé côté client pour le processus de réservation complet
 * et côté admin pour le suivi et la gestion des statuts.
 */
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // OFFRES ET SERVICES
  // ============================================================================

  /**
   * Récupère les détails d'une offre pour préparer la réservation.
   * @param offreId - Identifiant de l'offre sélectionnée
   * @returns {Observable<any>} Observable contenant les détails de l'offre
   */
  getOffreDetails(offreId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/offres/${offreId}`);
  }

  /**
   * Récupère les services additionnels disponibles pour un hôtel.
   * @param hotelId - Identifiant de l'hôtel
   * @returns {Observable<any>} Observable contenant la liste des services
   */
  getHotelServices(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/services`);
  }

  /**
   * Récupère les services additionnels associés à une réservation.
   * @param reservationId - Identifiant de la réservation
   * @returns {Observable<any>} Observable contenant les services de la réservation
   */
  getReservationServices(reservationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/${reservationId}/services`);
  }

  // ============================================================================
  // RÉSERVATIONS CÔTÉ CLIENT
  // ============================================================================

  /**
   * Crée une nouvelle réservation.
   * @param reservationData - Données complètes de la réservation à créer
   * @returns {Observable<any>} Observable contenant la réponse de création
   */
  createReservation(reservationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, reservationData);
  }

  /**
   * Récupère toutes les réservations d'un utilisateur.
   * @param userId - Identifiant de l'utilisateur
   * @returns {Observable<any>} Observable contenant la liste des réservations
   */
  getUserReservations(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/user/${userId}`);
  }

  /**
   * Récupère une réservation spécifique par son ID.
   * Nécessite l'userId pour vérification de propriété côté backend.
   * @param reservationId - Identifiant de la réservation
   * @param userId - Identifiant de l'utilisateur (vérification de propriété)
   * @returns {Observable<any>} Observable contenant les détails de la réservation
   */
  getReservationById(reservationId: number, userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/${reservationId}?userId=${userId}`);
  }

  /**
   * Annule une réservation existante.
   * @param reservationId - Identifiant de la réservation à annuler
   * @param userId - Identifiant de l'utilisateur (vérification de propriété)
   * @returns {Observable<any>} Observable contenant la réponse d'annulation
   */
  cancelReservation(reservationId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservations/${reservationId}/cancel`, { userId });
  }

  /**
   * Modifie les dates et le nombre de voyageurs d'une réservation non payée.
   * Le serveur revérifie la propriété, le statut, la disponibilité de la
   * chambre, puis recalcule le total depuis l'offre : les valeurs envoyées
   * ici expriment un souhait, elles ne fixent aucun montant.
   * @param reservationId - Identifiant de la réservation à modifier
   * @param userId - Identifiant de l'utilisateur (vérification de propriété)
   * @param data - Nouvelles dates et nombre de voyageurs
   * @returns {Observable<any>} Observable contenant la réservation mise à jour
   */
  updateReservation(reservationId: number, userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservations/${reservationId}`, { userId, ...data });
  }

  // ============================================================================
  // MÉTHODES ADMIN
  // ============================================================================

  /**
   * Récupère toutes les réservations de la plateforme (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant toutes les réservations
   */
  getAllReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservations/all`);
  }

  /**
   * Change le statut d'une réservation (ADMIN uniquement).
   * @param reservationId - Identifiant de la réservation
   * @param newStatusId - Identifiant du nouveau statut à appliquer
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  updateReservationStatus(reservationId: number, newStatusId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservations/${reservationId}/status`, { newStatusId });
  }
}
