import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-description',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-description.html',
  styleUrl: './hotel-description.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelDescription implements OnInit {
  
  hotel: any = null;
  loading: boolean = true;
  
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
        this.cdr.markForCheck();  // ← AJOUTE CETTE LIGNE
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
        this.cdr.markForCheck();  // ← AJOUTE CETTE LIGNE
      }
    });
  }
}