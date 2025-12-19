import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { HotelHeader } from '../hotel-header/hotel-header';
import { HotelSidebar } from '../hotel-sidebar/hotel-sidebar';
import { HotelInfoCard } from '../widgets/hotel-info-card/hotel-info-card';
import { WhyBook } from '../widgets/why-book/why-book';
import { PopularHotels } from '../widgets/popular-hotels/popular-hotels';
import { DealOfDay } from '../widgets/deal-of-day/deal-of-day';
import { HelpContact } from '../widgets/help-contact/help-contact';

@Component({
  selector: 'app-hotel-detail',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    HotelHeader,
    HotelSidebar,
    HotelInfoCard,
    WhyBook,
    PopularHotels,
    DealOfDay,
    HelpContact
  ],
  templateUrl: './hotel-detail.html',
  styleUrl: './hotel-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelDetail implements OnInit {
  
  hotelId: number = 0;
  ville: string = '';
  hotel: any = null;
  loading: boolean = true;
  error: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.hotelId = +params['hotelId'];
      this.ville = params['ville'];
      console.log('🏨 Hôtel ID:', this.hotelId, '| Ville:', this.ville);
      this.loadHotel();
    });
  }
  
  loadHotel() {
    this.loading = true;
    
    this.hotelService.getHotelDetails(this.hotelId).subscribe({
      next: (response) => {
        console.log('📊 Données hôtel:', response);
        this.hotel = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement de l\'hôtel';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}