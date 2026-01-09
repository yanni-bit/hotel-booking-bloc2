import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  
  // État du menu (ouvert/fermé)
  menuOpen = false;
  
  // Recherche
  searchQuery: string = '';
  
  // Langue actuelle
  currentLang: string = 'fr';
  
  // Langues disponibles
  languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' }
  ];
  
  // Devise actuelle
  currentCurrency: string = 'EUR';
  
  // Devises disponibles
  currencies = [
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'GBP', symbol: '£', label: 'Pound' }
  ];
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    // Charger la langue depuis localStorage ou utiliser 'fr' par défaut
    const savedLang = localStorage.getItem('language') || 'fr';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
    
    // Charger la devise depuis localStorage ou utiliser 'EUR' par défaut
    const savedCurrency = localStorage.getItem('currency') || 'EUR';
    this.currentCurrency = savedCurrency;
  }
  
  // Toggle du menu hamburger
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  // Recherche avec Enter ou clic loupe
  onSearch() {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.searchQuery = ''; // Reset après recherche
      this.cdr.markForCheck();
    }
  }
  
  // Recherche sur touche Enter
  onSearchKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
  
  // Changer de langue
  switchLanguage(langCode: string) {
    this.currentLang = langCode;
    this.translate.use(langCode);
    localStorage.setItem('language', langCode);
    this.cdr.markForCheck();
  }
  
  // Obtenir le label de la langue actuelle
  getCurrentLanguageLabel(): string {
    const lang = this.languages.find(l => l.code === this.currentLang);
    return lang ? lang.flag + ' ' + lang.code.toUpperCase() : 'FR';
  }
  
  // Changer de devise
  switchCurrency(currencyCode: string) {
    this.currentCurrency = currencyCode;
    localStorage.setItem('currency', currencyCode);
    // Émettre un événement pour que les autres composants soient notifiés
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currencyCode }));
    this.cdr.markForCheck();
  }
  
  // Obtenir le symbole de la devise actuelle
  getCurrentCurrencySymbol(): string {
    const currency = this.currencies.find(c => c.code === this.currentCurrency);
    return currency ? currency.symbol + ' ' + currency.code : '€ EUR';
  }
  
  // Déconnexion
  logout() {
    this.authService.logout();
  }
}