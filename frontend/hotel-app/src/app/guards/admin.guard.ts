// ============================================
// FICHIER : admin.guard.ts
// DESCRIPTION : Guard de protection des routes administrateur.
//               Vérifie que l'utilisateur est connecté ET possède
//               le rôle admin avant d'autoriser l'accès.
//               Redirige vers l'accueil en cas de refus.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : AuthService (vérification authentification et rôle),
//                     Router (redirection en cas de refus)
// FONCTIONNALITÉS :
//   - Vérification de l'authentification de l'utilisateur
//   - Vérification du rôle administrateur
//   - Redirection vers l'accueil si non autorisé
//   - Alerte utilisateur en cas d'accès refusé
// ============================================

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard fonctionnel pour protéger les routes réservées aux administrateurs.
 * Utilise le pattern CanActivateFn (approche fonctionnelle Angular 15+).
 * Injecte AuthService et Router via la fonction inject().
 *
 * @param route - Snapshot de la route activée
 * @param state - Snapshot de l'état du routeur (contient l'URL demandée)
 * @returns {boolean} true si l'utilisateur est admin, false sinon
 */
export const adminGuard: CanActivateFn = (route, state) => {
  /** Injection du service d'authentification */
  const authService = inject(AuthService);
  /** Injection du service de routage pour les redirections */
  const router = inject(Router);

  // --- Vérification : utilisateur connecté ET administrateur ---
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true; // Accès autorisé
  }

  // --- Accès refusé : redirection vers la page d'accueil ---
  console.log('🔒 Accès refusé - Réservé aux administrateurs');
  alert('Accès réservé aux administrateurs');
  router.navigate(['/']);
  return false;
};
