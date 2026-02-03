/**
 * ============================================================
 * FICHIER     : hotel-info-card.ts
 * COMPOSANT   : HotelInfoCard
 * DESCRIPTION : Widget sidebar affichant un résumé compact d'un
 *               hôtel : nom, étoiles, localisation, note moyenne
 *               et description tronquée. Composant de présentation
 *               recevant les données via @Input depuis le parent.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : Aucun
 * INPUTS      :
 *   - hotel : objet hôtel complet (nom, étoiles, ville, pays,
 *             note_moyenne, description)
 * FONCTIONNALITÉS :
 *   - Affichage nom + étoiles générées dynamiquement
 *   - Localisation (ville, pays) + note moyenne sur 10
 *   - Description tronquée à 150 caractères (pipe slice)
 * ============================================================
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-info-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hotel-info-card.html',
  styleUrl: './hotel-info-card.scss',
})
export class HotelInfoCard {
  /** Objet hôtel reçu du composant parent (nom, étoiles, ville, pays, note, description) */
  @Input() hotel: any;
}
