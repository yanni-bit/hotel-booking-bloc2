/**
 * ============================================================
 * FICHIER     : hotel-header.ts
 * COMPOSANT   : HotelHeader
 * DESCRIPTION : En-tête de la page de détail d'un hôtel. Affiche
 *               l'image principale de l'hôtel et son nom dans une
 *               carte Bootstrap. Reçoit les données hôtel du composant
 *               parent HotelDetail via @Input.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : Aucun
 * FONCTIONNALITÉS :
 *   - Affichage de l'image principale de l'hôtel
 *   - Affichage du nom de l'hôtel
 * ============================================================
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hotel-header',
  imports: [CommonModule],
  templateUrl: './hotel-header.html',
  styleUrl: './hotel-header.scss',
})
export class HotelHeader {
  /** Objet hôtel reçu du composant parent HotelDetail */
  @Input() hotel: any;
}
