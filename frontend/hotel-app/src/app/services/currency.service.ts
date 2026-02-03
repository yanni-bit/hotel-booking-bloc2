// ============================================
// FICHIER : currency.service.ts
// DESCRIPTION : Service de gestion des devises et conversion de prix.
//               Gère le changement de devise (EUR, USD, GBP) avec
//               des taux de change fixes (base EUR), la persistance
//               du choix dans le localStorage, et la réactivité via
//               BehaviorSubject pour notifier les composants abonnés.
// AUTEUR : Yannick
// DATE : 2025
// FONCTIONNALITÉS :
//   - Stockage et chargement de la devise depuis localStorage (loadCurrency)
//   - Récupération de la devise courante (getCurrency)
//   - Changement de devise avec persistance (setCurrency)
//   - Récupération des infos de la devise courante (getCurrencyInfo)
//   - Conversion d'un prix EUR vers la devise active (convert)
//   - Formatage d'un prix avec symbole de devise (format)
//   - Observable réactif pour notifier les changements (currency$)
// DEVISES SUPPORTÉES : EUR (€), USD ($), GBP (£)
// ============================================

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

/** Type des codes de devises supportés */
export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

/** Interface décrivant une devise avec son code, symbole et taux de change */
export interface CurrencyInfo {
  /** Code ISO de la devise */
  code: CurrencyCode;
  /** Symbole d'affichage (€, $, £) */
  symbol: string;
  /** Taux de change par rapport à l'EUR (base 1) */
  rate: number;
}

// ============================================================================
// SERVICE CURRENCY
// ============================================================================

/**
 * Service injectable pour la gestion multi-devises.
 * Les taux de change sont fixes (pas d'appel API externe).
 * La devise sélectionnée est persistée dans le localStorage
 * et diffusée via un BehaviorSubject pour la réactivité.
 */
@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  /** Taux de change fixes avec l'EUR comme devise de référence (rate: 1) */
  private readonly rates: Record<CurrencyCode, CurrencyInfo> = {
    EUR: { code: 'EUR', symbol: '€', rate: 1 },
    USD: { code: 'USD', symbol: '$', rate: 1.08 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.85 },
  };

  /** BehaviorSubject pour la devise courante (réactivité + valeur initiale) */
  private currentCurrency$ = new BehaviorSubject<CurrencyCode>(this.loadCurrency());

  /** Observable public pour s'abonner aux changements de devise */
  currency$ = this.currentCurrency$.asObservable();

  constructor() {}

  // ============================================================================
  // PERSISTANCE LOCALSTORAGE
  // ============================================================================

  /**
   * Charge la devise sauvegardée depuis le localStorage.
   * Retourne 'EUR' par défaut si aucune devise valide n'est trouvée.
   * @returns {CurrencyCode} Code de la devise sauvegardée ou 'EUR'
   */
  private loadCurrency(): CurrencyCode {
    const saved = localStorage.getItem('currency') as CurrencyCode;
    return saved && this.rates[saved] ? saved : 'EUR';
  }

  // ============================================================================
  // GETTERS / SETTERS
  // ============================================================================

  /**
   * Retourne le code de la devise actuellement sélectionnée.
   * @returns {CurrencyCode} Code de la devise courante
   */
  getCurrency(): CurrencyCode {
    return this.currentCurrency$.value;
  }

  /**
   * Change la devise active. Sauvegarde dans le localStorage
   * et notifie tous les abonnés via le BehaviorSubject.
   * @param code - Code de la nouvelle devise à appliquer
   */
  setCurrency(code: CurrencyCode): void {
    if (this.rates[code]) {
      localStorage.setItem('currency', code);
      this.currentCurrency$.next(code);
    }
  }

  /**
   * Retourne les informations complètes de la devise courante.
   * @returns {CurrencyInfo} Objet contenant code, symbole et taux
   */
  getCurrencyInfo(): CurrencyInfo {
    return this.rates[this.currentCurrency$.value];
  }

  // ============================================================================
  // CONVERSION ET FORMATAGE
  // ============================================================================

  /**
   * Convertit un prix en EUR vers la devise courante.
   * Arrondi à 2 décimales.
   * @param priceInEur - Prix en euros à convertir
   * @returns {number} Prix converti dans la devise courante
   */
  convert(priceInEur: number): number {
    const rate = this.rates[this.currentCurrency$.value].rate;
    return Math.round(priceInEur * rate * 100) / 100;
  }

  /**
   * Formate un prix en EUR avec conversion et symbole de la devise courante.
   * Adapte le placement du symbole selon la devise (€ après, $ et £ avant).
   * @param priceInEur - Prix en euros à formater
   * @returns {string} Prix formaté avec symbole (ex: "55.00 €", "$ 59.40")
   */
  format(priceInEur: number): string {
    const converted = this.convert(priceInEur);
    const info = this.getCurrencyInfo();

    // --- Formatage selon la convention de placement du symbole ---
    if (info.code === 'EUR') {
      return `${converted.toFixed(2)} €`;
    } else if (info.code === 'USD') {
      return `$ ${converted.toFixed(2)}`;
    } else {
      return `£ ${converted.toFixed(2)}`;
    }
  }
}
