// ============================================
// FICHIER : auth.interceptor.ts
// DESCRIPTION : Intercepteur HTTP fonctionnel qui attache automatiquement
//               le token JWT (Bearer) à chaque requête sortante.
//               Gère également les erreurs 401 (token invalide ou expiré)
//               en déconnectant l'utilisateur et en le redirigeant vers /login.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : AuthService (récupération du token, déconnexion),
//                     Router (redirection en cas d'erreur 401)
// FONCTIONNALITÉS :
//   - Injection automatique du header Authorization (Bearer token)
//   - Clonage de la requête originale pour y ajouter le token
//   - Interception des erreurs HTTP 401 (non autorisé)
//   - Déconnexion automatique et redirection vers /login si 401
//   - Propagation des autres erreurs HTTP sans modification
// ============================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Intercepteur HTTP fonctionnel (approche Angular 15+).
 * S'exécute automatiquement sur chaque requête HTTP sortante.
 * Ajoute le token JWT dans le header Authorization si disponible,
 * et gère les réponses 401 en forçant la déconnexion.
 *
 * @param req - Requête HTTP originale
 * @param next - Handler pour passer la requête au prochain intercepteur ou au backend
 * @returns {Observable<HttpEvent<unknown>>} Observable de la réponse HTTP avec gestion d'erreur
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /** Injection du service d'authentification pour accéder au token */
  const authService = inject(AuthService);
  /** Injection du routeur pour redirection en cas d'erreur 401 */
  const router = inject(Router);
  /** Récupération du token JWT depuis le service d'authentification */
  const token = authService.getToken();

  // --- Clonage de la requête avec ajout du header Authorization si token présent ---
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // --- Envoi de la requête et gestion des erreurs 401 ---
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token invalide ou expiré → déconnexion et redirection vers login
        authService.logout();
        router.navigate(['/login']);
      }
      // Propagation de l'erreur pour traitement par les composants appelants
      return throwError(() => error);
    }),
  );
};
