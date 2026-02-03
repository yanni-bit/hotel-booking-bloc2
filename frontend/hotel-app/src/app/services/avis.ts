// ============================================
// FICHIER : avis.ts
// DESCRIPTION : Service de gestion des avis utilisateurs sur les hôtels.
//               Fournit les opérations CRUD pour les avis côté client
//               (création, modification) et côté admin (liste complète,
//               avis récents, comptage, suppression).
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération des avis d'un hôtel (getAvisByHotelId)
//   - Création d'un avis par un utilisateur connecté (createAvis)
//   - Modification d'un avis par son propriétaire (updateAvis)
//   - [ADMIN] Récupération de tous les avis (getAllAvis)
//   - [ADMIN] Récupération des avis récents (getRecentAvis)
//   - [ADMIN] Comptage des nouveaux avis (countNewAvis)
//   - [ADMIN] Suppression d'un avis (deleteAvis)
// API : http://localhost:3000/api
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================================
// INTERFACES
// ============================================================================

/** Interface représentant un avis complet (avec données de jointure) */
export interface AvisResponse {
  /** Identifiant unique de l'avis */
  id_avis: number;
  /** Identifiant de l'hôtel concerné */
  id_hotel: number;
  /** Identifiant de l'utilisateur ayant posté l'avis (optionnel) */
  id_user?: number;
  /** Pseudo affiché publiquement */
  pseudo_user: string;
  /** Note attribuée à l'hôtel */
  note: number;
  /** Titre de l'avis (optionnel) */
  titre_avis?: string;
  /** Contenu du commentaire */
  commentaire: string;
  /** Date de publication de l'avis */
  date_avis: string;
  /** Date formatée pour l'affichage (optionnel) */
  date_formatted?: string;
  /** Pays d'origine du voyageur (optionnel) */
  pays_origine?: string;
  /** Type de voyageur (solo, couple, famille, etc.) */
  type_voyageur: string;
  /** Langue de l'avis (optionnel) */
  langue?: string;
  // --- Données de jointure ---
  /** Nom de l'hôtel (jointure) */
  nom_hotel?: string;
  /** Ville de l'hôtel (jointure) */
  ville_hotel?: string;
  /** Prénom de l'utilisateur (jointure) */
  prenom_user?: string;
  /** Nom de l'utilisateur (jointure) */
  nom_user?: string;
  /** Email de l'utilisateur (jointure) */
  email_user?: string;
}

/** Interface des données pour créer un avis */
export interface CreateAvisData {
  id_hotel: number;
  id_user: number;
  pseudo_user: string;
  note: number;
  titre_avis?: string;
  commentaire: string;
  type_voyageur?: string;
  pays_origine?: string;
  langue?: string;
}

/** Interface des données pour modifier un avis */
export interface UpdateAvisData {
  id_user: number;
  note: number;
  titre_avis?: string;
  commentaire: string;
  type_voyageur?: string;
  pays_origine?: string;
}

// ============================================================================
// SERVICE AVIS
// ============================================================================

/**
 * Service injectable pour la gestion des avis sur les hôtels.
 * Utilisé côté client pour poster/modifier des avis,
 * et côté admin pour la modération et les statistiques.
 */
@Injectable({
  providedIn: 'root',
})
export class AvisService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // MÉTHODES CÔTÉ CLIENT
  // ============================================================================

  /**
   * Récupère tous les avis d'un hôtel spécifique.
   * @param hotelId - Identifiant de l'hôtel
   * @returns {Observable<any>} Observable contenant la liste des avis
   */
  getAvisByHotelId(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/avis`);
  }

  /**
   * Crée un nouvel avis (utilisateur connecté uniquement).
   * @param avisData - Données de l'avis à créer
   * @returns {Observable<any>} Observable contenant la réponse de création
   */
  createAvis(avisData: CreateAvisData): Observable<any> {
    return this.http.post(`${this.apiUrl}/avis`, avisData);
  }

  /**
   * Met à jour un avis existant (propriétaire de l'avis uniquement).
   * @param avisId - Identifiant de l'avis à modifier
   * @param avisData - Nouvelles données de l'avis
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  updateAvis(avisId: number, avisData: UpdateAvisData): Observable<any> {
    return this.http.put(`${this.apiUrl}/avis/${avisId}`, avisData);
  }

  // ============================================================================
  // MÉTHODES ADMIN
  // ============================================================================

  /**
   * Récupère la liste complète de tous les avis (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant tous les avis
   */
  getAllAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis`);
  }

  /**
   * Récupère les avis les plus récents (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant les avis récents
   */
  getRecentAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/recent`);
  }

  /**
   * Compte le nombre de nouveaux avis (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant le compteur
   */
  countNewAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/count`);
  }

  /**
   * Supprime un avis (ADMIN uniquement).
   * @param avisId - Identifiant de l'avis à supprimer
   * @returns {Observable<any>} Observable contenant la réponse de suppression
   */
  deleteAvis(avisId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/avis/${avisId}`);
  }
}
