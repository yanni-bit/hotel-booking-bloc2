// ============================================
// FICHIER : contact.service.ts
// DESCRIPTION : Service de gestion des messages de contact.
//               Permet l'envoi de messages par les visiteurs/utilisateurs
//               et la gestion complète des messages côté admin
//               (lecture, marquage lu/traité, suppression).
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API backend)
// FONCTIONNALITÉS :
//   - Envoi d'un message de contact (sendMessage)
//   - [ADMIN] Récupération de tous les messages (getAllMessages)
//   - [ADMIN] Récupération des messages non lus (getUnreadMessages)
//   - [ADMIN] Comptage des messages non lus (getUnreadCount)
//   - [ADMIN] Récupération d'un message par ID (getMessageById)
//   - [ADMIN] Marquage d'un message comme lu (markAsRead)
//   - [ADMIN] Marquage d'un message comme traité (markAsTreated)
//   - [ADMIN] Suppression d'un message (deleteMessage)
// API : http://localhost:3000/api/contact
// ============================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================================
// INTERFACES
// ============================================================================

/** Interface des données pour envoyer un message de contact */
export interface ContactMessage {
  /** Nom de l'expéditeur */
  nom: string;
  /** Email de l'expéditeur */
  email: string;
  /** Téléphone de l'expéditeur (optionnel) */
  telephone?: string;
  /** Sujet du message (liste prédéfinie) */
  sujet: 'reservation' | 'information' | 'reclamation' | 'autre';
  /** Contenu du message */
  message: string;
}

/** Interface de la réponse d'un message de contact (données complètes) */
export interface ContactMessageResponse {
  /** Identifiant unique du message */
  id_message: number;
  /** Nom de l'expéditeur */
  nom: string;
  /** Email de l'expéditeur */
  email: string;
  /** Téléphone de l'expéditeur (null si non renseigné) */
  telephone: string | null;
  /** Sujet du message */
  sujet: string;
  /** Contenu du message */
  message: string;
  /** Date d'envoi du message */
  date_envoi: string;
  /** Indicateur de lecture (0 = non lu, 1 = lu) */
  lu: number;
  /** Indicateur de traitement (0 = non traité, 1 = traité) */
  traite: number;
}

/** Interface générique pour les réponses API typées */
export interface ApiResponse<T> {
  /** Indicateur de succès de la requête */
  success: boolean;
  /** Message de retour (optionnel) */
  message?: string;
  /** Données retournées (optionnel) */
  data?: T;
}

// ============================================================================
// SERVICE CONTACT
// ============================================================================

/**
 * Service injectable pour la gestion des messages de contact.
 * Utilisé côté visiteur pour envoyer des messages,
 * et côté admin pour la gestion et le suivi des messages reçus.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  /** URL de base de l'API */
  private apiUrl = 'http://localhost:3000/api';

  /**
   * Constructeur : injection du client HTTP Angular.
   * @param http - Client HTTP pour les appels API
   */
  constructor(private http: HttpClient) {}

  // ============================================================================
  // MÉTHODE CÔTÉ CLIENT
  // ============================================================================

  /**
   * Envoie un message de contact via le formulaire public.
   * @param message - Données du message à envoyer
   * @returns {Observable<ApiResponse<{ id_message: number }>>} Observable avec l'ID du message créé
   */
  sendMessage(message: ContactMessage): Observable<ApiResponse<{ id_message: number }>> {
    return this.http.post<ApiResponse<{ id_message: number }>>(`${this.apiUrl}/contact`, message);
  }

  // ============================================================================
  // MÉTHODES ADMIN
  // ============================================================================

  /**
   * Récupère tous les messages de contact (ADMIN uniquement).
   * @returns {Observable<ApiResponse<ContactMessageResponse[]>>} Observable contenant tous les messages
   */
  getAllMessages(): Observable<ApiResponse<ContactMessageResponse[]>> {
    return this.http.get<ApiResponse<ContactMessageResponse[]>>(`${this.apiUrl}/contact/messages`);
  }

  /**
   * Récupère les messages non lus (ADMIN uniquement).
   * @returns {Observable<ApiResponse<ContactMessageResponse[]>>} Observable contenant les messages non lus
   */
  getUnreadMessages(): Observable<ApiResponse<ContactMessageResponse[]>> {
    return this.http.get<ApiResponse<ContactMessageResponse[]>>(
      `${this.apiUrl}/contact/messages/unread`,
    );
  }

  /**
   * Compte le nombre de messages non lus (ADMIN uniquement).
   * @returns {Observable<ApiResponse<{ unreadCount: number }>>} Observable contenant le compteur
   */
  getUnreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.http.get<ApiResponse<{ unreadCount: number }>>(
      `${this.apiUrl}/contact/messages/count`,
    );
  }

  /**
   * Récupère un message spécifique par son identifiant (ADMIN uniquement).
   * @param id - Identifiant du message
   * @returns {Observable<ApiResponse<ContactMessageResponse>>} Observable contenant le message
   */
  getMessageById(id: number): Observable<ApiResponse<ContactMessageResponse>> {
    return this.http.get<ApiResponse<ContactMessageResponse>>(
      `${this.apiUrl}/contact/messages/${id}`,
    );
  }

  /**
   * Marque un message comme lu (ADMIN uniquement).
   * @param id - Identifiant du message à marquer
   * @returns {Observable<ApiResponse<null>>} Observable contenant la réponse
   */
  markAsRead(id: number): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/contact/messages/${id}/read`, {});
  }

  /**
   * Marque un message comme traité (ADMIN uniquement).
   * @param id - Identifiant du message à marquer
   * @returns {Observable<ApiResponse<null>>} Observable contenant la réponse
   */
  markAsTreated(id: number): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/contact/messages/${id}/treated`, {});
  }

  /**
   * Supprime un message de contact (ADMIN uniquement).
   * @param id - Identifiant du message à supprimer
   * @returns {Observable<ApiResponse<null>>} Observable contenant la réponse
   */
  deleteMessage(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/contact/messages/${id}`);
  }
}
