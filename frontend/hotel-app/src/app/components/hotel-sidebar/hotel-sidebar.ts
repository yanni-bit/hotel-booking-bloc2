/**
 * ============================================================
 * FICHIER     : hotel-sidebar.ts
 * COMPOSANT   : HotelSidebar
 * DESCRIPTION : Barre de navigation latérale (onglets) de la page
 *               de détail d'un hôtel. Affiche les liens vers les
 *               différentes sections (Description, Offres, Équipements,
 *               Avis, Localisation) sous forme de nav-pills verticales.
 *               Utilise RouterLinkActive pour mettre en surbrillance
 *               l'onglet actif selon la route enfant courante.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : Aucun
 * FONCTIONNALITÉS :
 *   - Navigation par onglets vers les routes enfants de l'hôtel
 *   - Mise en surbrillance automatique de l'onglet actif
 *   - Traduction des labels via ngx-translate
 * ============================================================
 */

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hotel-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './hotel-sidebar.html',
  styleUrl: './hotel-sidebar.scss',
})
export class HotelSidebar {}
