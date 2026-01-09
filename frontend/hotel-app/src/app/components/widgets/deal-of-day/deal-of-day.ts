import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HotelService } from '../../../services/hotel';
import { CurrencyPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-deal-of-day',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './deal-of-day.html',
  styleUrl: './deal-of-day.scss'
})
export class DealOfDay implements OnInit, OnChanges {
  @Input() country: string = '';
  @Input() excludeHotelId: number = 0;

  hotel: any = null;
  loading: boolean = false;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadDealOfDay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] || changes['excludeHotelId']) {
      this.loadDealOfDay();
    }
  }

  loadDealOfDay(): void {
    if (!this.country) return;

    this.loading = true;
    this.hotelService.getDealOfDay(this.country, this.excludeHotelId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hotel = response.data;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement offre du jour:', err);
        this.loading = false;
      }
    });
  }

  // Générer les étoiles
  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}