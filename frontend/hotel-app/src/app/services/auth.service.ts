// ============================================
// FICHIER : auth.service.ts
// DESCRIPTION : Service central d'authentification et de gestion des utilisateurs.
//               Gère l'inscription, la connexion, la déconnexion, le stockage
//               du token JWT et des informations utilisateur dans le localStorage.
//               Utilise les Signals Angular pour l'état réactif d'authentification.
//               Inclut également les méthodes d'administration des utilisateurs
//               (CRUD, gestion des rôles, activation/désactivation).
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : HttpClient (requêtes HTTP vers l'API),
//                     Router (redirection après déconnexion)
// FONCTIONNALITÉS :
//   - Inscription d'un nouvel utilisateur (register)
//   - Connexion avec stockage token JWT + infos utilisateur (login)
//   - Déconnexion avec nettoyage localStorage et reset des signals (logout)
//   - Vérification automatique de l'authentification au démarrage (checkAuth)
//   - Récupération du profil utilisateur depuis l'API (getProfile)
//   - Mise à jour du profil utilisateur (updateProfile)
//   - Changement de mot de passe (changePassword)
//   - Demande de réinitialisation de mot de passe (forgotPassword)
//   - Réinitialisation de mot de passe avec token (resetPassword)
//   - Vérification des rôles : admin (isAdmin), hôtelier (isHotelier)
//   - [ADMIN] CRUD utilisateurs, gestion des rôles, activation/désactivation
// API : http://localhost:3000/api/auth
// ============================================

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// ============================================================================
// INTERFACES
// ============================================================================

/** Interface de la réponse de connexion retournée par l'API */
interface LoginResponse {
  /** Indicateur de succès de la requête */
  success: boolean;
  /** Message de retour (succès ou erreur) */
  message: string;
  /** Données retournées : token JWT et informations utilisateur */
  data: {
    token: string;
    user: {
      id_user: number;
      email: string;
      prenom: string;
      nom: string;
      role: string;
    };
  };
}

/** Interface des données d'inscription */
interface RegisterData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  telephone?: string;
}

// ============================================================================
// SERVICE D'AUTHENTIFICATION
// ============================================================================

/**
 * Service injectable principal pour l'authentification et la gestion des utilisateurs.
 * Utilise les Signals Angular pour un état réactif (isAuthenticated, currentUser).
 * Stocke le token JWT et les infos utilisateur dans le localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** URL de base de l'API d'authentification */
  private apiUrl = 'http://localhost:3000/api/auth';

  /** Signal réactif : état d'authentification (true si connecté) */
  isAuthenticated = signal<boolean>(false);
  /** Signal réactif : informations de l'utilisateur connecté (null si déconnecté) */
  currentUser = signal<any>(null);

  /**
   * Constructeur : injection des dépendances et vérification
   * de l'authentification existante au démarrage de l'application.
   * @param http - Client HTTP pour les appels API
   * @param router - Service de routage pour les redirections
   */
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Vérifier si un token existe au démarrage
    this.checkAuth();
  }

  // ============================================================================
  // VÉRIFICATION DE L'AUTHENTIFICATION
  // ============================================================================

  /**
   * Vérifie l'état d'authentification au démarrage de l'application.
   * Si un token et des infos utilisateur existent dans le localStorage,
   * met à jour les signals pour restaurer la session.
   */
  private checkAuth() {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
    }
  }

  // ============================================================================
  // INSCRIPTION / CONNEXION / DÉCONNEXION
  // ============================================================================

  /**
   * Inscrit un nouvel utilisateur via l'API.
   * @param data - Données d'inscription (email, password, prenom, nom, telephone)
   * @returns {Observable<any>} Observable contenant la réponse d'inscription
   */
  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /**
   * Connecte un utilisateur. En cas de succès, stocke le token JWT
   * et les infos utilisateur dans le localStorage, puis met à jour les signals.
   * @param email - Adresse email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   * @returns {Observable<LoginResponse>} Observable contenant la réponse de connexion
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        if (response.success) {
          // Stocker le token et les infos utilisateur dans le localStorage
          this.setToken(response.data.token);
          this.setUser(response.data.user);
          // Mettre à jour les signals réactifs
          this.isAuthenticated.set(true);
          this.currentUser.set(response.data.user);
        }
      }),
    );
  }

  /**
   * Déconnecte l'utilisateur : supprime le token et les infos du localStorage,
   * remet les signals à leur état initial, redirige vers l'accueil.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  // ============================================================================
  // PROFIL UTILISATEUR
  // ============================================================================

  /**
   * Récupère le profil de l'utilisateur connecté depuis l'API.
   * @returns {Observable<any>} Observable contenant les données du profil
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /**
   * Met à jour le profil de l'utilisateur connecté.
   * En cas de succès, synchronise les données locales (localStorage + signal).
   * @param userData - Nouvelles données du profil (prenom, nom, telephone)
   * @returns {Observable<any>} Observable contenant la réponse de mise à jour
   */
  updateProfile(userData: { prenom: string; nom: string; telephone?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, userData).pipe(
      tap((response: any) => {
        if (response.success) {
          // Mettre à jour les infos en local (localStorage + signal)
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              prenom: userData.prenom,
              nom: userData.nom,
            };
            this.setUser(updatedUser);
            this.currentUser.set(updatedUser);
          }
        }
      }),
    );
  }

  // ============================================================================
  // GESTION DU MOT DE PASSE
  // ============================================================================

  /**
   * Change le mot de passe de l'utilisateur connecté.
   * @param oldPassword - Ancien mot de passe
   * @param newPassword - Nouveau mot de passe
   * @returns {Observable<any>} Observable contenant la réponse
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, { oldPassword, newPassword });
  }

  /**
   * Envoie une demande de réinitialisation de mot de passe (email avec lien).
   * @param email - Adresse email de l'utilisateur
   * @returns {Observable<any>} Observable contenant la réponse
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Réinitialise le mot de passe avec un token de réinitialisation.
   * @param token - Token de réinitialisation reçu par email
   * @param newPassword - Nouveau mot de passe choisi
   * @returns {Observable<any>} Observable contenant la réponse
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  // ============================================================================
  // GESTION DU TOKEN ET DES INFOS UTILISATEUR (LOCALSTORAGE)
  // ============================================================================

  /**
   * Stocke le token JWT dans le localStorage.
   * @param token - Token JWT à stocker
   */
  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * Récupère le token JWT depuis le localStorage.
   * @returns {string | null} Token JWT ou null si absent
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Stocke les informations utilisateur dans le localStorage (JSON sérialisé).
   * @param user - Objet utilisateur à stocker
   */
  private setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Récupère les informations utilisateur depuis le localStorage.
   * @returns {any} Objet utilisateur désérialisé ou null si absent
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // ============================================================================
  // VÉRIFICATION DES RÔLES
  // ============================================================================

  /**
   * Vérifie si l'utilisateur connecté possède le rôle administrateur.
   * @returns {boolean} true si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  /**
   * Vérifie si l'utilisateur connecté possède le rôle hôtelier (provider).
   * @returns {boolean} true si l'utilisateur est hôtelier
   */
  isHotelier(): boolean {
    const user = this.currentUser();
    return user?.role === 'provider';
  }

  // ============================================================================
  // MÉTHODES ADMIN - GESTION DES UTILISATEURS
  // ============================================================================

  /**
   * Récupère la liste de tous les utilisateurs (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant le tableau des utilisateurs
   */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  /**
   * Récupère la liste de tous les rôles disponibles (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant le tableau des rôles
   */
  getAllRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  /**
   * Modifie le rôle d'un utilisateur (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur
   * @param roleId - Identifiant du nouveau rôle à attribuer
   * @returns {Observable<any>} Observable contenant la réponse
   */
  updateUserRole(userId: number, roleId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { id_role: roleId });
  }

  /**
   * Active ou désactive un compte utilisateur (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur
   * @param actif - true pour activer, false pour désactiver
   * @returns {Observable<any>} Observable contenant la réponse
   */
  toggleUserActive(userId: number, actif: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/toggle`, { actif });
  }

  /**
   * Supprime un compte utilisateur (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur à supprimer
   * @returns {Observable<any>} Observable contenant la réponse
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Compte le nombre total d'utilisateurs (ADMIN uniquement).
   * @returns {Observable<any>} Observable contenant le compteur
   */
  countUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/count`);
  }

  /**
   * Récupère un utilisateur spécifique par son identifiant (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur
   * @returns {Observable<any>} Observable contenant les données de l'utilisateur
   */
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Met à jour les informations d'un utilisateur (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur à modifier
   * @param userData - Nouvelles données de l'utilisateur
   * @returns {Observable<any>} Observable contenant la réponse
   */
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData);
  }

  /**
   * Récupère les réservations d'un utilisateur spécifique (ADMIN uniquement).
   * @param userId - Identifiant de l'utilisateur
   * @returns {Observable<any>} Observable contenant la liste des réservations
   */
  getUserReservations(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/reservations`);
  }
}
