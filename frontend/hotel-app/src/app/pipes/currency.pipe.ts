// ============================================
// FICHIER : currency.pipe.ts
// DESCRIPTION : Pipe personnalisé Angular pour le formatage dynamique
//               des montants selon la devise sélectionnée par l'utilisateur.
//               Pipe impure (pure: false) qui réagit en temps réel
//               aux changements de devise via un abonnement au CurrencyService.
// AUTEUR : Yannick
// DATE : 2025
// SERVICES UTILISÉS : CurrencyService (conversion et formatage des montants),
//                     ChangeDetectorRef (forcer la détection de changements)
// FONCTIONNALITÉS :
//   - Formatage des montants selon la devise active
//   - Réactivité automatique aux changements de devise (pipe impure)
//   - Gestion des valeurs nulles, undefined et chaînes vides
//   - Conversion automatique des valeurs string en number
//   - Validation des valeurs numériques (protection contre NaN)
//   - Désabonnement propre à la destruction du pipe (OnDestroy)
// ============================================

import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import { Subscription } from 'rxjs';

/**
 * Pipe personnalisé pour l'affichage des prix dans la devise choisie.
 * Utilisé dans les templates avec la syntaxe : {{ montant | appCurrency }}
 * Impure (pure: false) pour se mettre à jour automatiquement
 * lorsque l'utilisateur change de devise.
 */
@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false, // Impure pour réagir aux changements de devise
})
export class CurrencyPipe implements PipeTransform, OnDestroy {
  /** Abonnement aux changements de devise pour désabonnement propre */
  private subscription: Subscription;
  /** Dernière valeur numérique traitée (cache) */
  private lastValue: number = 0;
  /** Dernier résultat formaté (cache) */
  private lastResult: string = '';

  /**
   * Constructeur : injection des dépendances et abonnement
   * aux changements de devise pour forcer le recalcul.
   * @param currencyService - Service de gestion et formatage des devises
   * @param cdr - Référence au détecteur de changements Angular
   */
  constructor(
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef,
  ) {
    // --- Abonnement aux changements de devise ---
    this.subscription = this.currencyService.currency$.subscribe(() => {
      this.lastResult = ''; // Reset du cache pour forcer le recalcul
      this.cdr.markForCheck(); // Signaler à Angular de re-vérifier la vue
    });
  }

  /**
   * Méthode de transformation appelée par Angular à chaque évaluation du pipe.
   * Convertit et formate la valeur selon la devise active.
   * @param value - Montant à formater (number, string, null ou undefined)
   * @returns {string} Montant formaté avec symbole de devise, ou chaîne vide si invalide
   */
  transform(value: number | string | null | undefined): string {
    // --- Gestion des valeurs nulles/undefined/vides ---
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // --- Conversion en nombre si la valeur est une chaîne ---
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // --- Validation : vérification que la valeur est un nombre valide ---
    if (isNaN(numValue)) {
      return '';
    }

    // --- Formatage du montant via le CurrencyService ---
    return this.currencyService.format(numValue);
  }

  /**
   * Nettoyage à la destruction du pipe.
   * Désabonnement pour éviter les fuites mémoire.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
