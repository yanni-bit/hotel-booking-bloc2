import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';

@Component({
  selector: 'app-hotels-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './hotels-list.html',
  styleUrl: './hotels-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsList implements OnInit {
  
  ville: string = '';
  hotels: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  constructor(
  private route: ActivatedRoute,
  private hotelService: HotelService,
    private cdr: ChangeDetectorRef
) {}
  
  ngOnInit() {
    // Récupérer le paramètre ville depuis l'URL
    this.route.params.subscribe(params => {
      this.ville = params['ville'];
      console.log('🏙️ Ville sélectionnée:', this.ville);
      this.loadHotels();
    });
  }
  
  loadHotels() {
    this.loading = true;
    
    this.hotelService.getAllHotels().subscribe({
      next: (response) => {
        this.hotels = response.data.filter((hotel: any) => 
          hotel.ville_hotel === this.ville
        );
        
        this.loading = false;
        this.cdr.markForCheck();  // ← Utilise markForCheck au lieu de detectChanges
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
}
}