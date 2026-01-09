import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  
  // Taux de change fixes (base EUR)
  private readonly rates: Record<CurrencyCode, CurrencyInfo> = {
    EUR: { code: 'EUR', symbol: '€', rate: 1 },
    USD: { code: 'USD', symbol: '$', rate: 1.08 },
    GBP: { code: 'GBP', symbol: '£', rate: 0.85 }
  };
  
  // Devise courante (BehaviorSubject pour réactivité)
  private currentCurrency$ = new BehaviorSubject<CurrencyCode>(this.loadCurrency());
  
  // Observable public
  currency$ = this.currentCurrency$.asObservable();
  
  constructor() {}
  
  // Charger la devise depuis localStorage
  private loadCurrency(): CurrencyCode {
    const saved = localStorage.getItem('currency') as CurrencyCode;
    return saved && this.rates[saved] ? saved : 'EUR';
  }
  
  // Obtenir la devise courante
  getCurrency(): CurrencyCode {
    return this.currentCurrency$.value;
  }
  
  // Changer la devise
  setCurrency(code: CurrencyCode): void {
    if (this.rates[code]) {
      localStorage.setItem('currency', code);
      this.currentCurrency$.next(code);
    }
  }
  
  // Obtenir les infos de la devise courante
  getCurrencyInfo(): CurrencyInfo {
    return this.rates[this.currentCurrency$.value];
  }
  
  // Convertir un prix EUR vers la devise courante
  convert(priceInEur: number): number {
    const rate = this.rates[this.currentCurrency$.value].rate;
    return Math.round(priceInEur * rate * 100) / 100;
  }
  
  // Formater un prix avec symbole
  format(priceInEur: number): string {
    const converted = this.convert(priceInEur);
    const info = this.getCurrencyInfo();
    
    // Format selon la devise
    if (info.code === 'EUR') {
      return `${converted.toFixed(2)} €`;
    } else if (info.code === 'USD') {
      return `$ ${converted.toFixed(2)}`;
    } else {
      return `£ ${converted.toFixed(2)}`;
    }
  }
}