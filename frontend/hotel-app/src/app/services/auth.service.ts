import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id_user: number;
      email: string;
      prenom: string;
      nom: string;
      role: string;
    }
  }
}

interface RegisterData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  // Signal pour l'état d'authentification
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<any>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un token existe au démarrage
    this.checkAuth();
  }

  /**
   * Vérifier l'authentification au démarrage
   */
  private checkAuth() {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
    }
  }

  /**
   * Inscription
   */
  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /**
   * Connexion
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            // Stocker le token et les infos utilisateur
            this.setToken(response.data.token);
            this.setUser(response.data.user);
            this.isAuthenticated.set(true);
            this.currentUser.set(response.data.user);
          }
        })
      );
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Récupérer le profil utilisateur depuis l'API
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /**
   * Stocker le token
   */
  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Stocker les infos utilisateur
   */
  private setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Récupérer les infos utilisateur
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  /**
   * Vérifier si l'utilisateur est hôtelier
   */
  isHotelier(): boolean {
    const user = this.currentUser();
    return user?.role === 'provider';
  }

  /**
  * Met à jour le profil utilisateur
  */
  updateProfile(userData: { prenom: string; nom: string; telephone?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, userData).pipe(
      tap((response: any) => { // ← AJOUTE ": any"
        if (response.success) {
          // Mettre à jour les infos en local
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              prenom: userData.prenom,
              nom: userData.nom
            };
            this.setUser(updatedUser);
            this.currentUser.set(updatedUser);
          }
        }
      })
    );
  }

  /**
   * Change le mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, { oldPassword, newPassword });
  }

  /**
 * Demande de réinitialisation de mot de passe
 */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}