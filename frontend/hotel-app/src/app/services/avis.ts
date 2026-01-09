import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour un avis
export interface AvisResponse {
  id_avis: number;
  id_hotel: number;
  id_user?: number;
  pseudo_user: string;
  note: number;
  titre_avis?: string;
  commentaire: string;
  date_avis: string;
  date_formatted?: string;
  pays_origine?: string;
  type_voyageur: string;
  langue?: string;
  // Jointures
  nom_hotel?: string;
  ville_hotel?: string;
  prenom_user?: string;
  nom_user?: string;
  email_user?: string;
}

// Interface pour créer un avis
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

// Interface pour modifier un avis
export interface UpdateAvisData {
  id_user: number;
  note: number;
  titre_avis?: string;
  commentaire: string;
  type_voyageur?: string;
  pays_origine?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  /**
   * Récupère les avis d'un hôtel
   */
  getAvisByHotelId(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hotels/${hotelId}/avis`);
  }
  
  /**
   * Créer un nouvel avis (utilisateur connecté)
   */
  createAvis(avisData: CreateAvisData): Observable<any> {
    return this.http.post(`${this.apiUrl}/avis`, avisData);
  }
  
  /**
   * Récupère tous les avis (admin)
   */
  getAllAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis`);
  }
  
  /**
   * Récupère les avis récents (admin)
   */
  getRecentAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/recent`);
  }
  
  /**
   * Compte les nouveaux avis (admin)
   */
  countNewAvis(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avis/count`);
  }
  
  /**
   * Supprime un avis (admin)
   */
  deleteAvis(avisId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/avis/${avisId}`);
  }

  /**
   * Met à jour un avis (utilisateur propriétaire)
   */
  updateAvis(avisId: number, avisData: UpdateAvisData): Observable<any> {
    return this.http.put(`${this.apiUrl}/avis/${avisId}`, avisData);
  }
}