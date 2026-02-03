// ============================================
// FICHIER : destination.ts
// DESCRIPTION : Service de gestion des destinations.
//               Fournit le comptage du nombre d'hôtels par destination
//               pour l'affichage sur la page d'accueil.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Récupération du nombre d'hôtels par destination (getDestinationsCount)
// API : http://localhost:3000/api/destinations
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service injectable pour la gestion des destinations.
 * Utilisé principalement par le composant Destinations
 * pour afficher les villes avec leur nombre d'hôtels.
 */
@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  /**
   * Récupère le nombre d'hôtels par destination depuis l'API.
   * @returns {Observable<any>} Observable contenant la liste des destinations avec comptage
   */
  getDestinationsCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/destinations`);
  }
}
