import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-amenities',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-amenities.html',
  styleUrl: './hotel-amenities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelAmenities implements OnInit {
  
  hotel: any = null;
  loading: boolean = true;
  
  // Équipements généraux
  amenities = [
    { icon: 'bi-wifi', name: 'Wi-Fi gratuit', category: 'general' },
    { icon: 'bi-p-circle', name: 'Parking', category: 'general' },
    { icon: 'bi-wind', name: 'Climatisation', category: 'general' },
    { icon: 'bi-cup-hot', name: 'Restaurant', category: 'general' },
    { icon: 'bi-cup-straw', name: 'Bar', category: 'general' },
    { icon: 'bi-water', name: 'Piscine', category: 'sport' },
    { icon: 'bi-heart-pulse', name: 'Spa & Bien-être', category: 'sport' },
    { icon: 'bi-dumbbell', name: 'Salle de sport', category: 'sport' },
    { icon: 'bi-tree', name: 'Jardin', category: 'general' },
    { icon: 'bi-door-open', name: 'Réception 24h/24', category: 'service' },
    { icon: 'bi-luggage', name: 'Bagagerie', category: 'service' },
    { icon: 'bi-shield-check', name: 'Coffre-fort', category: 'service' },
    { icon: 'bi-translate', name: 'Personnel multilingue', category: 'service' },
    { icon: 'bi-elevator', name: 'Ascenseur', category: 'general' },
    { icon: 'bi-newspaper', name: 'Journaux', category: 'service' },
    { icon: 'bi-basket', name: 'Service d\'étage', category: 'service' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    const hotelId = +this.route.parent?.snapshot.params['hotelId'];
    
    if (hotelId) {
      this.loadHotel(hotelId);
    }
  }
  
  loadHotel(hotelId: number) {
    this.hotelService.getHotelDetails(hotelId).subscribe({
      next: (response) => {
        this.hotel = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  getAmenitiesByCategory(category: string) {
    return this.amenities.filter(a => a.category === category);
  }
}