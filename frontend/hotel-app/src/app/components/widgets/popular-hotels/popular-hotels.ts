import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HotelService } from '../../../services/hotel';
import { CurrencyPipe } from '../../../pipes/currency.pipe';

@Component({
  selector: 'app-popular-hotels',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './popular-hotels.html',
  styleUrl: './popular-hotels.scss'
})
export class PopularHotels implements OnInit, OnChanges {
  @Input() country: string = '';
  @Input() excludeHotelId: number = 0;

  hotels: any[] = [];
  loading: boolean = false;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadPopularHotels();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['country'] || changes['excludeHotelId']) {
      this.loadPopularHotels();
    }
  }

  loadPopularHotels(): void {
    if (!this.country) return;

    this.loading = true;
    this.hotelService.getPopularHotelsByCountry(this.country, this.excludeHotelId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.hotels = response.data;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement hôtels populaires:', err);
        this.loading = false;
      }
    });
  }

  // Générer les étoiles
  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}