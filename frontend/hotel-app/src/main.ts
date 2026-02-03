// ============================================
// FICHIER : main.ts
// DESCRIPTION : Point d'entrée de l'application Angular.
//               Bootstrap le composant racine App avec la configuration
//               définie dans appConfig (routeur, HTTP, traduction).
// AUTEUR : Yannick
// DATE : 2025
// FONCTIONNALITÉS :
//   - Initialisation de l'application Angular (bootstrapApplication)
//   - Chargement du composant racine App
//   - Application de la configuration globale (appConfig)
//   - Gestion des erreurs de démarrage (console.error)
// ============================================

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Démarrage de l'application Angular.
 * Bootstrap le composant App avec la configuration appConfig
 * qui inclut le routeur, le client HTTP avec intercepteur JWT,
 * et le module de traduction ngx-translate.
 */
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
