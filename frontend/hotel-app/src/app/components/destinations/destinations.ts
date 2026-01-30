// ============================================================================
// FICHIER : destinations.component.ts
// DESCRIPTION : Composant affichant les 12 destinations populaires
//               Cartes avec image, informations et lien vers les hôtels
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - DestinationService : Récupération du nombre d'hôtels par destination
// FONCTIONNALITÉS :
//   - Affichage de 12 cartes de destinations avec image et overlay
//   - Chargement dynamique du nombre d'hôtels depuis l'API
//   - Badges promotionnels (PROMO, NOUVEAU)
//   - Navigation vers la page des hôtels de la destination
//   - Conversion des prix via le pipe CurrencyPipe
// OPTIMISATION :
//   - ChangeDetectionStrategy.OnPush pour améliorer les performances
//   - Mise à jour immutable des données (nouveau tableau)
// ============================================================================

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DestinationService } from '../../services/destination';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '../../pipes/currency.pipe';

// =============================================================================
// INTERFACE - STRUCTURE D'UNE DESTINATION
// =============================================================================

/**
 * Interface définissant la structure d'une destination
 * @property {number} id - Identifiant unique
 * @property {string} title - Nom de la ville
 * @property {string} pays - Nom du pays
 * @property {string} nombrehotels - Nombre d'hôtels (string pour affichage)
 * @property {number} prix - Prix de départ
 * @property {string} image - Chemin de l'image
 * @property {string} badge - Texte du badge (PROMO, NOUVEAU, vide)
 * @property {string} badgeColor - Couleur du badge (hex)
 */
interface Destination {
  id: number;
  title: string;
  pays: string;
  nombrehotels: string;
  prix: number;
  image: string;
  badge: string;
  badgeColor: string;
}

@Component({
  selector: 'app-destinations',
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyPipe],
  templateUrl: './destinations.html',
  styleUrl: './destinations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Destinations implements OnInit {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES DES DESTINATIONS
  // ==========================================================================

  /**
   * Liste des 12 destinations populaires
   * Le nombre d'hôtels est initialisé à '0' et mis à jour via l'API
   * Certaines destinations ont un badge (PROMO, NOUVEAU)
   */
  destinations: Destination[] = [
    {
      id: 1,
      title: 'Paris',
      pays: 'France',
      nombrehotels: '0',
      prix: 190,
      image: 'images/paris.jpg',
      badge: 'PROMO',
      badgeColor: '#5fc8c2',
    },
    {
      id: 2,
      title: 'Amsterdam',
      pays: 'Netherlands',
      nombrehotels: '0',
      prix: 180,
      image: 'images/amsterdam.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 3,
      title: 'St Petersburg',
      pays: 'Russia',
      nombrehotels: '0',
      prix: 180,
      image: 'images/saint-petersburg.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 4,
      title: 'Prague',
      pays: 'Czech Republic',
      nombrehotels: '0',
      prix: 190,
      image: 'images/prague.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 5,
      title: 'Tahiti',
      pays: 'French Polynesia',
      nombrehotels: '0',
      prix: 1190,
      image: 'images/offre-4.jpg',
      badge: 'NOUVEAU',
      badgeColor: '#5fc8c2',
    },
    {
      id: 6,
      title: 'Zanzibar',
      pays: 'Tanzania',
      nombrehotels: '0',
      prix: 1180,
      image: 'images/zanzibar.webp',
      badge: '',
      badgeColor: '',
    },
    {
      id: 7,
      title: 'Maldives',
      pays: 'Maldives',
      nombrehotels: '0',
      prix: 2320,
      image: 'images/maldives.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 8,
      title: 'Cancun',
      pays: 'Mexico',
      nombrehotels: '0',
      prix: 1590,
      image: 'images/cancun.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 9,
      title: 'Dubai',
      pays: 'United Arab Emirates',
      nombrehotels: '0',
      prix: 310,
      image: 'images/dubai.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 10,
      title: 'Bali',
      pays: 'Indonesia',
      nombrehotels: '0',
      prix: 1680,
      image: 'images/bali.jpg',
      badge: '',
      badgeColor: '',
    },
    {
      id: 11,
      title: 'New York',
      pays: 'United States',
      nombrehotels: '0',
      prix: 760,
      image: 'images/new-york.webp',
      badge: '',
      badgeColor: '',
    },
    {
      id: 12,
      title: 'Tokyo',
      pays: 'Japan',
      nombrehotels: '0',
      prix: 980,
      image: 'images/tokyo.jpg',
      badge: '',
      badgeColor: '',
    },
  ];

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Injection des dépendances
   * @param {DestinationService} destinationService - Service des destinations
   * @param {ChangeDetectorRef} cdr - Référence pour déclencher la détection de changements
   */
  constructor(
    private destinationService: DestinationService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================================================
  // CYCLE DE VIE
  // ==========================================================================

  /**
   * Initialisation du composant
   * Charge le nombre d'hôtels par destination depuis l'API
   */
  ngOnInit() {
    this.loadDestinationsCount();
  }

  // ==========================================================================
  // MÉTHODES - CHARGEMENT DES DONNÉES
  // ==========================================================================

  /**
   * Charge le nombre d'hôtels pour chaque destination depuis l'API
   * Met à jour le tableau de manière immutable pour respecter OnPush
   *
   * Processus :
   * 1. Appel API via DestinationService
   * 2. Mapping des données API avec les destinations locales
   * 3. Création d'un nouveau tableau (immutabilité)
   * 4. Déclenchement manuel de la détection de changements
   */
  loadDestinationsCount() {
    this.destinationService.getDestinationsCount().subscribe({
      next: (response) => {
        console.log('📊 Données destinations API:', response);

        if (response.success && response.data) {
          // Créer un NOUVEAU tableau (immutabilité pour OnPush)
          this.destinations = this.destinations.map((dest) => {
            // Trouver la destination correspondante dans l'API
            const apiDest = response.data.find((api: any) => {
              // Correspondance par nom de ville
              return api.ville_hotel === dest.title;
            });

            // Si trouvé, retourner un NOUVEL objet avec le nombre mis à jour
            if (apiDest) {
              console.log(`✅ ${dest.title}: ${apiDest.nombre_hotels} hôtels`);
              return {
                ...dest,
                nombrehotels: apiDest.nombre_hotels.toString(),
              };
            }

            // Sinon retourner l'objet inchangé
            return dest;
          });

          // Forcer Angular à détecter le changement (OnPush)
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des destinations:', err);
      },
    });
  }
}
