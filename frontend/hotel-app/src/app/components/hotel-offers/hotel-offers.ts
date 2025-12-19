import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChambreService } from '../../services/chambre';

@Component({
  selector: 'app-hotel-offers',
  imports: [CommonModule, RouterLink],
  templateUrl: './hotel-offers.html',
  styleUrl: './hotel-offers.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelOffers implements OnInit {
  
  chambres: any[] = [];
  loading: boolean = true;
  error: string = '';
  hotelId: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private chambreService: ChambreService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // Récupérer l'ID de l'hôtel depuis l'URL parent
    this.hotelId = +this.route.parent?.snapshot.params['hotelId'];
    
    if (this.hotelId) {
      this.loadChambres();
    }
  }
  
  loadChambres() {
    this.loading = true;
    
    this.chambreService.getChambresByHotelId(this.hotelId).subscribe({
      next: (response) => {
        console.log('📦 Chambres:', response);
        this.chambres = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur chambres:', err);
        this.error = 'Erreur lors du chargement des chambres';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}