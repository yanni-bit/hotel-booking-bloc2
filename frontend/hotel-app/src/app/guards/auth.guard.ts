import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour protéger les routes réservées aux utilisateurs connectés
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Vérifier si l'utilisateur est connecté
  if (authService.isAuthenticated()) {
    return true; // Accès autorisé
  }
  
  // Non connecté → redirection vers login
  console.log('🔒 Accès refusé - Redirection vers /login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url } // Sauvegarder l'URL demandée
  });
  return false;
};