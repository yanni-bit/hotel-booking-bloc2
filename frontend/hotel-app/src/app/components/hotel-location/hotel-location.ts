/**
 * ============================================================
 * FICHIER     : hotel-location.ts
 * COMPOSANT   : HotelLocation
 * DESCRIPTION : Onglet "Localisation" de la page de détail d'un hôtel.
 *               Affiche une carte interactive Leaflet/OpenStreetMap avec
 *               un marqueur positionné sur la ville de l'hôtel, ainsi que
 *               les informations d'adresse, de contact et les infos
 *               pratiques (check-in, check-out, paiement).
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : HotelService (chargement des détails hôtel)
 *               ActivatedRoute (récupération de l'ID hôtel depuis la route parente)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * LIBRAIRIES  : Leaflet (carte interactive OpenStreetMap)
 * FONCTIONNALITÉS :
 *   - Chargement des données hôtel via l'ID de la route parente
 *   - Affichage d'une carte Leaflet centrée sur la ville de l'hôtel
 *   - Marqueur personnalisé avec popup (nom + ville + pays)
 *   - Affichage de l'adresse et des coordonnées de contact
 *   - Informations pratiques (horaires check-in/out, paiement)
 *   - Correspondance ville → coordonnées GPS via dictionnaire interne
 * ============================================================
 */

import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel';
import * as L from 'leaflet';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-location',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-location.html',
  styleUrl: './hotel-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelLocation implements OnInit, AfterViewInit {
  /** Objet contenant toutes les données de l'hôtel */
  hotel: any = null;

  /** Indicateur d'état de chargement des données */
  loading: boolean = true;

  /** Instance de la carte Leaflet */
  private map: any;

  /**
   * Dictionnaire de correspondance ville → coordonnées GPS
   * Utilisé pour positionner la carte sur la ville de l'hôtel
   * Fallback sur Paris si la ville n'est pas référencée
   */
  private cityCoordinates: any = {
    Paris: { lat: 48.8566, lng: 2.3522 },
    Amsterdam: { lat: 52.3676, lng: 4.9041 },
    'St Petersburg': { lat: 59.9343, lng: 30.3351 },
    Prague: { lat: 50.0755, lng: 14.4378 },
    Tahiti: { lat: -17.6509, lng: -149.426 },
    Zanzibar: { lat: -6.1659, lng: 39.2026 },
    Maldives: { lat: 3.2028, lng: 73.2207 },
    Cancun: { lat: 21.1619, lng: -86.8515 },
    Dubai: { lat: 25.2048, lng: 55.2708 },
    Bali: { lat: -8.4095, lng: 115.1889 },
    'New York': { lat: 40.7128, lng: -74.006 },
    Tokyo: { lat: 35.6762, lng: 139.6503 },
  };

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation du composant
   * Récupère l'ID hôtel depuis les paramètres de la route parente
   * et déclenche le chargement des données
   */
  ngOnInit() {
    const hotelId = +this.route.parent?.snapshot.params['hotelId'];

    if (hotelId) {
      this.loadHotel(hotelId);
    }
  }

  /**
   * Hook appelé après l'initialisation de la vue
   * La carte Leaflet est initialisée dans loadHotel() via setTimeout
   * pour s'assurer que le DOM est prêt
   */
  ngAfterViewInit() {
    // La carte sera initialisée après le chargement de l'hôtel
  }

  /**
   * Charge les détails de l'hôtel depuis l'API
   * Une fois les données reçues, attend 200ms pour que le DOM se mette à jour
   * puis initialise la carte Leaflet
   * @param hotelId - Identifiant unique de l'hôtel
   */
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
      },
    });
  }

  /**
   * Initialise la carte interactive Leaflet
   * - Centre la carte sur les coordonnées de la ville de l'hôtel
   * - Ajoute la couche de tuiles OpenStreetMap
   * - Place un marqueur personnalisé rouge avec popup
   */
  private initMap(): void {
    // Récupérer les coordonnées de la ville (fallback Paris)
    const coords = this.cityCoordinates[this.hotel.ville_hotel] || { lat: 48.8566, lng: 2.3522 };

    // Initialiser la carte
    this.map = L.map('map').setView([coords.lat, coords.lng], 13);

    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Créer une icône personnalisée rouge
    const customIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Ajouter un marqueur avec popup contenant le nom et la localisation
    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(this.map);

    marker
      .bindPopup(
        `
      <div style="text-align: center;">
        <strong>${this.hotel.nom_hotel}</strong><br>
        <small>${this.hotel.ville_hotel}, ${this.hotel.pays_hotel}</small>
      </div>
    `,
      )
      .openPopup();
  }
}
