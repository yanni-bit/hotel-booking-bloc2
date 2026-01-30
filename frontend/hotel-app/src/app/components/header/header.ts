// ============================================================================
// FICHIER : header.component.ts
// DESCRIPTION : Composant Header avec logo, contact, recherche, navigation
//               et ruban latéral (compte, langue, devise)
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - AuthService : Gestion de l'authentification utilisateur
//   - TranslateService : Changement de langue (ngx-translate)
//   - CurrencyService : Changement de devise
// FONCTIONNALITÉS :
//   - Logo et lien accueil
//   - Bloc contact 24/7 avec téléphone
//   - Barre de recherche avec navigation vers /search
//   - Menu hamburger responsive
//   - Ruban latéral turquoise :
//     * Connexion/Déconnexion utilisateur
//     * Sélection de la langue (FR/EN/IT)
//     * Sélection de la devise (EUR/USD/GBP)
//   - Navigation principale (Home, Hotels, Contact)
// OPTIMISATION :
//   - ChangeDetectionStrategy.OnPush pour améliorer les performances
//   - Persistance langue/devise dans localStorage
// ============================================================================

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // ==========================================================================
  // PROPRIÉTÉS - MENU MOBILE
  // ==========================================================================

  /** État du menu hamburger (ouvert/fermé) */
  menuOpen = false;

  // ==========================================================================
  // PROPRIÉTÉS - RECHERCHE
  // ==========================================================================

  /** Texte saisi dans la barre de recherche */
  searchQuery: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - INTERNATIONALISATION (LANGUE)
  // ==========================================================================

  /** Code de la langue actuelle (fr, en, it) */
  currentLang: string = 'fr';

  /**
   * Langues disponibles dans l'application
   * @property {string} code - Code ISO de la langue
   * @property {string} label - Nom de la langue
   * @property {string} flag - Emoji drapeau
   */
  languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  // ==========================================================================
  // PROPRIÉTÉS - DEVISE
  // ==========================================================================

  /** Code de la devise actuelle (EUR, USD, GBP) */
  currentCurrency: string = 'EUR';

  /**
   * Devises disponibles dans l'application
   * @property {string} code - Code ISO de la devise
   * @property {string} symbol - Symbole monétaire
   * @property {string} label - Nom de la devise
   */
  currencies = [
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'GBP', symbol: '£', label: 'Pound' },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances et initialisation des préférences utilisateur
   * Charge la langue et la devise depuis localStorage
   */
  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private currencyService: CurrencyService,
  ) {
    // Charger la langue depuis localStorage ou utiliser 'fr' par défaut
    const savedLang = localStorage.getItem('language') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(savedLang);

    // Charger la devise depuis localStorage ou utiliser 'EUR' par défaut
    const savedCurrency = localStorage.getItem('currency') || 'EUR';
    this.currentCurrency = savedCurrency;
  }

  // ==========================================================================
  // MÉTHODES - MENU MOBILE
  // ==========================================================================

  /** Bascule l'état du menu hamburger (ouvert/fermé) */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // ==========================================================================
  // MÉTHODES - RECHERCHE
  // ==========================================================================

  /**
   * Lance la recherche et navigue vers la page de résultats
   * Utilise le queryParam 'q' pour transmettre la requête
   */
  onSearch() {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.searchQuery = ''; // Reset après recherche
      this.cdr.markForCheck();
    }
  }

  /**
   * Gère la touche Enter dans le champ de recherche
   * @param {KeyboardEvent} event - Événement clavier
   */
  onSearchKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  // ==========================================================================
  // MÉTHODES - LANGUE
  // ==========================================================================

  /**
   * Change la langue de l'application
   * Persiste le choix dans localStorage
   * @param {string} langCode - Code de la langue (fr, en, it)
   */
  switchLanguage(langCode: string) {
    this.currentLang = langCode;
    this.translate.use(langCode);
    localStorage.setItem('language', langCode);
    this.cdr.markForCheck();
  }

  /**
   * Retourne le label de la langue actuelle pour l'affichage
   * @returns {string} Label formaté (ex: "Français FR")
   */
  getCurrentLanguageLabel(): string {
    const lang = this.languages.find((l) => l.code === this.currentLang);
    return lang ? lang.label + ' ' + lang.code.toUpperCase() : 'Français FR';
  }

  // ==========================================================================
  // MÉTHODES - DEVISE
  // ==========================================================================

  /**
   * Change la devise de l'application
   * Utilise le CurrencyService pour propager le changement
   * @param {string} currencyCode - Code de la devise (EUR, USD, GBP)
   */
  switchCurrency(currencyCode: string) {
    this.currentCurrency = currencyCode;
    this.currencyService.setCurrency(currencyCode as CurrencyCode);
    this.cdr.markForCheck();
  }

  /**
   * Retourne le symbole de la devise actuelle pour l'affichage
   * @returns {string} Symbole formaté (ex: "€ EUR")
   */
  getCurrentCurrencySymbol(): string {
    const currency = this.currencies.find((c) => c.code === this.currentCurrency);
    return currency ? currency.symbol + ' ' + currency.code : '€ EUR';
  }

  // ==========================================================================
  // MÉTHODES - AUTHENTIFICATION
  // ==========================================================================

  /** Déconnecte l'utilisateur via AuthService */
  logout() {
    this.authService.logout();
  }
}
