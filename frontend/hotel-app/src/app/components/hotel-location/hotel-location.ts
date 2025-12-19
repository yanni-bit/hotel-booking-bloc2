import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import * as L from 'leaflet';

@Component({
  selector: 'app-hotel-location',
  imports: [CommonModule],
  templateUrl: './hotel-location.html',
  styleUrl: './hotel-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelLocation implements OnInit, AfterViewInit {
  
  hotel: any = null;
  loading: boolean = true;
  private map: any;
  
  // Coordonnées approximatives des villes
  private cityCoordinates: any = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'St Petersburg': { lat: 59.9343, lng: 30.3351 },
    'Prague': { lat: 50.0755, lng: 14.4378 },
    'Tahiti': { lat: -17.6509, lng: -149.4260 },
    'Zanzibar': { lat: -6.1659, lng: 39.2026 },
    'Maldives': { lat: 3.2028, lng: 73.2207 },
    'Cancun': { lat: 21.1619, lng: -86.8515 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Bali': { lat: -8.4095, lng: 115.1889 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 }
  };
  
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
  
  ngAfterViewInit() {
    // La carte sera initialisée après le chargement de l'hôtel
  }
  
  loadHotel(hotelId: number) {
  this.hotelService.getHotelDetails(hotelId).subscribe({
    next: (response) => {
      this.hotel = response.data;
      this.loading = false;
      this.cdr.markForCheck();
      
      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        const mapElement = document.getElementById('map');
        if (mapElement) {
          console.log('✅ Élément carte trouvé, initialisation...');
          this.initMap();
        } else {
          console.error('❌ Élément #map introuvable !');
        }
      }, 200);
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.loading = false;
      this.cdr.markForCheck();
    }
  });
}
  
  private initMap(): void {
    // Récupérer les coordonnées de la ville
    const coords = this.cityCoordinates[this.hotel.ville_hotel] || { lat: 48.8566, lng: 2.3522 };
    
    // Initialiser la carte
    this.map = L.map('map').setView([coords.lat, coords.lng], 13);
    
    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
    
    // Créer une icône personnalisée
    const customIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    // Ajouter un marqueur
    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(this.map);
    
    // Ajouter un popup
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${this.hotel.nom_hotel}</strong><br>
        <small>${this.hotel.ville_hotel}, ${this.hotel.pays_hotel}</small>
      </div>
    `).openPopup();
  }
}