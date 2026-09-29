// ============================================================================
// FICHIER : confidentialite.ts
// DESCRIPTION : Page Politique de confidentialité
// AUTEUR : Yannick
// DATE : 2026
// ============================================================================
// Couvre le critère Cr 3.d.2 du référentiel : informer l'utilisateur du
// stockage, de l'utilisation et du cadre de partage de ses données
// personnelles.
//
// Page statique volontairement : le contenu décrit le traitement des données
// tel qu'il est réellement implémenté dans la base et dans l'API. Il n'a pas
// à être modifiable depuis l'administration, il doit suivre le code.
// ============================================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confidentialite',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './confidentialite.html',
  styleUrl: './confidentialite.scss',
})
export class Confidentialite {
  /** Date de dernière révision du document, affichée en en-tête */
  dateMiseAJour = '29 septembre 2026';
}
