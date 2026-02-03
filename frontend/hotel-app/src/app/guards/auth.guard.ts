// ============================================
// FICHIER : auth.guard.ts
// DESCRIPTION : Guard de protection des routes nécessitant une
//               authentification. Vérifie que l'utilisateur est
//               connecté avant d'autoriser l'accès.
//               Redirige vers la page de login avec sauvegarde
//               de l'URL demandée (returnUrl) en cas de refus.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : AuthService (vérification authentification),
//                     Router (redirection vers login)
// FONCTIONNALITÉS :
//   - Vérification de l'authentification de l'utilisateur
//   - Redirection vers /login si non connecté
//   - Sauvegarde de l'URL demandée via queryParams (returnUrl)
// ============================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard fonctionnel pour protéger les routes réservées aux utilisateurs connectés.
 * Utilise le pattern CanActivateFn (approche fonctionnelle Angular 15+).
 * Injecte AuthService et Router via la fonction inject().
 *
 * @param route - Snapshot de la route activée
 * @param state - Snapshot de l'état du routeur (contient l'URL demandée)
 * @returns {boolean} true si l'utilisateur est authentifié, false sinon
 */
export const authGuard: CanActivateFn = (route, state) => {
  /** Injection du service d'authentification */
  const authService = inject(AuthService);
  /** Injection du service de routage pour les redirections */
  const router = inject(Router);

  // --- Vérification : utilisateur connecté ---
  if (authService.isAuthenticated()) {
    return true; // Accès autorisé
  }

  // --- Accès refusé : redirection vers la page de connexion ---
  console.log('🔒 Accès refusé - Redirection vers /login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }, // Sauvegarde de l'URL demandée pour redirection post-login
  });
  return false;
};
