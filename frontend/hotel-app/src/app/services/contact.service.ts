// ============================================================================
// CONTACT.SERVICE.TS - SERVICE ANGULAR POUR LES MESSAGES DE CONTACT
// ============================================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactMessage {
  nom: string;
  email: string;
  telephone?: string;
  sujet: 'reservation' | 'information' | 'reclamation' | 'autre';
  message: string;
}

export interface ContactMessageResponse {
  id_message: number;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string;
  message: string;
  date_envoi: string;
  lu: number;
  traite: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Envoyer un message de contact
   */
  sendMessage(message: ContactMessage): Observable<ApiResponse<{ id_message: number }>> {
    return this.http.post<ApiResponse<{ id_message: number }>>(
      `${this.apiUrl}/contact`,
      message
    );
  }

  /**
   * Récupérer tous les messages (admin)
   */
  getAllMessages(): Observable<ApiResponse<ContactMessageResponse[]>> {
    return this.http.get<ApiResponse<ContactMessageResponse[]>>(
      `${this.apiUrl}/contact/messages`
    );
  }

  /**
   * Récupérer les messages non lus (admin)
   */
  getUnreadMessages(): Observable<ApiResponse<ContactMessageResponse[]>> {
    return this.http.get<ApiResponse<ContactMessageResponse[]>>(
      `${this.apiUrl}/contact/messages/unread`
    );
  }

  /**
   * Compter les messages non lus (admin)
   */
  getUnreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.http.get<ApiResponse<{ unreadCount: number }>>(
      `${this.apiUrl}/contact/messages/count`
    );
  }

  /**
   * Récupérer un message par ID (admin)
   */
  getMessageById(id: number): Observable<ApiResponse<ContactMessageResponse>> {
    return this.http.get<ApiResponse<ContactMessageResponse>>(
      `${this.apiUrl}/contact/messages/${id}`
    );
  }

  /**
   * Marquer un message comme lu (admin)
   */
  markAsRead(id: number): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.apiUrl}/contact/messages/${id}/read`,
      {}
    );
  }

  /**
   * Marquer un message comme traité (admin)
   */
  markAsTreated(id: number): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.apiUrl}/contact/messages/${id}/treated`,
      {}
    );
  }

  /**
   * Supprimer un message (admin)
   */
  deleteMessage(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.apiUrl}/contact/messages/${id}`
    );
  }
}