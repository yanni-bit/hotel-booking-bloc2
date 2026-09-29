// ============================================================================
// FICHIER : provider.guard.ts
// DESCRIPTION : Garde de route de l'espace prestataire
// AUTEUR : Yannick
// ============================================================================
// Protège /prestataire. Accepte le rôle `provider` et le rôle `admin` : un
// administrateur doit pouvoir consulter cet espace sans changer de compte.
//
// C'est une garde d'interface, pas une sécurité. Elle évite d'afficher un
// écran vide à quelqu'un qui n'a rien à y faire, mais la protection réelle est
// côté serveur : requireProvider() dans backend/utils/auth.js refuse la
// requête, et le filtrage par établissement se fait en base.
// ============================================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Garde fonctionnelle de l'espace prestataire.
 * @param route - Snapshot de la route activée
 * @param state - Snapshot de l'état du routeur
 * @returns {boolean} true si l'accès est autorisé
 */
export const providerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && (authService.isHotelier() || authService.isAdmin())) {
    return true;
  }

  // Non connecté : on renvoie vers la connexion en mémorisant la destination.
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Connecté mais sans le rôle : retour à l'accueil.
  router.navigate(['/']);
  return false;
};
