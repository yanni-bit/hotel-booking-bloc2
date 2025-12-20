import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HotelAdminService } from '../../services/admin-hotels';

@Component({
  selector: 'app-admin-hotels',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-hotels.html',
  styleUrl: './admin-hotels.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHotels implements OnInit {
  
  hotels: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  constructor(
    private hotelAdminService: HotelAdminService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadHotels();
  }
  
  loadHotels() {
    this.loading = true;
    
    this.hotelAdminService.getAll().subscribe({
      next: (response) => {
        console.log('✅ Hôtels:', response);
        this.hotels = response.data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  deleteHotel(hotel: any) {
    if (!confirm(`Voulez-vous vraiment supprimer l'hôtel "${hotel.nom_hotel}" ?`)) {
      return;
    }
    
    this.hotelAdminService.delete(hotel.id_hotel).subscribe({
      next: () => {
        alert('Hôtel supprimé avec succès');
        this.loadHotels(); // Recharger la liste
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }
}