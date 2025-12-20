import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour protéger les routes réservées aux administrateurs
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Vérifier si l'utilisateur est connecté ET admin
  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true; // Accès autorisé
  }
  
  // Non admin → redirection vers accueil
  console.log('🔒 Accès refusé - Réservé aux administrateurs');
  alert('Accès réservé aux administrateurs');
  router.navigate(['/']);
  return false;
};