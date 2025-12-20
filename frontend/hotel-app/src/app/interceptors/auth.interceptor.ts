import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  // Cloner la requête et ajouter le token si disponible
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Gérer les erreurs 401 (non autorisé)
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token invalide ou expiré - déconnecter l'utilisateur
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};