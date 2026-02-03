// ============================================
// FICHIER : app.config.ts
// DESCRIPTION : Configuration principale de l'application Angular.
//               Définit les providers globaux : routeur, client HTTP
//               avec intercepteur JWT, et module de traduction
//               ngx-translate avec loader personnalisé chargeant
//               les fichiers JSON depuis /assets/i18n/.
// AUTEUR : Yannick
// DATE : 2025
// PROVIDERS CONFIGURÉS :
//   - provideRouter : Configuration du routeur avec les routes de l'application
//   - provideHttpClient : Client HTTP avec intercepteur authInterceptor (JWT)
//   - TranslateModule : Traduction multilingue (ngx-translate, langue par défaut : fr)
// FONCTIONNALITÉS :
//   - Injection globale du routeur Angular
//   - Interception automatique des requêtes HTTP (ajout token JWT)
//   - Chargement dynamique des traductions depuis /assets/i18n/{lang}.json
//   - Gestion des erreurs de chargement de traductions (fallback objet vide)
// ============================================

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

// --- ngx-translate : module de traduction multilingue ---
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Loader personnalisé pour ngx-translate.
 * Charge les fichiers de traduction JSON depuis /assets/i18n/{lang}.json.
 * En cas d'erreur de chargement, retourne un objet vide pour éviter le crash.
 */
class CustomTranslateLoader implements TranslateLoader {
  /**
   * @param http - Client HTTP pour charger les fichiers JSON de traduction
   */
  constructor(private http: HttpClient) {}

  /**
   * Charge le fichier de traduction pour la langue demandée.
   * @param lang - Code de la langue (ex: 'fr', 'en')
   * @returns {Observable<any>} Observable contenant les traductions ou objet vide en cas d'erreur
   */
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`).pipe(
      catchError((err) => {
        console.error('Erreur chargement traduction:', err);
        return of({}); // Retourne un objet vide en cas d'erreur
      }),
    );
  }
}

/** Configuration principale de l'application Angular */
export const appConfig: ApplicationConfig = {
  providers: [
    // --- Routeur Angular avec les routes de l'application ---
    provideRouter(routes),
    // --- Client HTTP avec intercepteur d'authentification JWT ---
    provideHttpClient(withInterceptors([authInterceptor])),
    // --- Configuration ngx-translate (traduction multilingue) ---
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'fr', // Langue de secours
        defaultLanguage: 'fr', // Langue par défaut
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
          deps: [HttpClient],
        },
      }),
    ),
  ],
};
