import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false // Impure pour réagir aux changements de devise
})
export class CurrencyPipe implements PipeTransform, OnDestroy {
  
  private subscription: Subscription;
  private lastValue: number = 0;
  private lastResult: string = '';
  
  constructor(
    private currencyService: CurrencyService,
    private cdr: ChangeDetectorRef
  ) {
    // S'abonner aux changements de devise
    this.subscription = this.currencyService.currency$.subscribe(() => {
      this.lastResult = ''; // Reset pour forcer le recalcul
      this.cdr.markForCheck();
    });
  }
  
  transform(value: number | string | null | undefined): string {
    // Gérer les valeurs nulles/undefined
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    // Convertir en nombre si string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Vérifier si c'est un nombre valide
    if (isNaN(numValue)) {
      return '';
    }
    
    // Retourner le résultat formaté
    return this.currencyService.format(numValue);
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}