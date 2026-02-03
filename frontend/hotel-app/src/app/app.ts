// ============================================
// FICHIER : app.ts
// DESCRIPTION : Composant racine de l'application Angular "Book Your Travel".
//               Point d'entrée principal qui contient le Header, le Footer
//               et le RouterOutlet pour l'affichage dynamique des pages.
// AUTEUR : Yannick
// DATE : 2025
// COMPOSANTS IMPORTÉS : Header (barre de navigation),
//                       Footer (pied de page),
//                       RouterOutlet (affichage des routes)
// FONCTIONNALITÉS :
//   - Structure principale de l'application (header + contenu + footer)
//   - Affichage dynamique des pages via le routeur Angular
// ============================================

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

/**
 * Composant racine de l'application.
 * Encapsule le Header, le RouterOutlet (contenu dynamique) et le Footer.
 * Sélecteur : <app-root>
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /** Titre de l'application (Signal en lecture seule) */
  protected readonly title = signal('hotel-app');
}
