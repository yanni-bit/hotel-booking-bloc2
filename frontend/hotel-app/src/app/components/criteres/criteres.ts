// ============================================================================
// FICHIER : criteres.component.ts
// DESCRIPTION : Composant affichant les 8 critères de sélection des hôtels
//               Cartes informatives présentant les engagements de l'entreprise
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// FONCTIONNALITÉS :
//   - Affichage de 8 cartes de critères avec titres et descriptions
//   - Contenu internationalisé via ngx-translate (clés i18n)
//   - Données définies en dur dans le composant
// UTILISATION :
//   - Utilisé sur la page d'accueil (section informative)
//   - Présente les engagements qualité de Book Your Travel
// ============================================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-criteres',
  imports: [CommonModule, TranslateModule],
  templateUrl: './criteres.html',
  styleUrl: './criteres.scss',
})
export class Criteres {
  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES DES CRITÈRES
  // ==========================================================================

  /**
   * Liste des 8 critères de sélection
   * Chaque critère contient :
   * @property {number} id - Identifiant unique du critère
   * @property {string} titleKey - Clé de traduction pour le titre
   * @property {string} textKey - Clé de traduction pour le texte descriptif
   *
   * Les traductions sont gérées dans les fichiers i18n (fr.json, en.json)
   * Le texte supporte le HTML via [innerHTML] dans le template
   */
  criteres = [
    { id: 1, titleKey: 'criteres.hotel.title', textKey: 'criteres.hotel.text' },
    { id: 2, titleKey: 'criteres.descriptions.title', textKey: 'criteres.descriptions.text' },
    { id: 3, titleKey: 'criteres.knowledge.title', textKey: 'criteres.knowledge.text' },
    { id: 4, titleKey: 'criteres.service.title', textKey: 'criteres.service.text' },
    { id: 5, titleKey: 'criteres.price.title', textKey: 'criteres.price.text' },
    { id: 6, titleKey: 'criteres.secure.title', textKey: 'criteres.secure.text' },
    { id: 7, titleKey: 'criteres.benefits.title', textKey: 'criteres.benefits.text' },
    { id: 8, titleKey: 'criteres.questions.title', textKey: 'criteres.questions.text' },
  ];
}
