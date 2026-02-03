/**
 * ============================================================
 * FICHIER     : help-contact.ts
 * COMPOSANT   : HelpContact
 * DESCRIPTION : Widget sidebar d'aide et de contact. Affiche un
 *               message d'assistance avec le numéro de téléphone
 *               du support client. Composant statique sans logique,
 *               utilisé dans les sidebars des pages hôtel et
 *               réservation.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : Aucun
 * FONCTIONNALITÉS :
 *   - Affichage du texte d'aide traduit (i18n)
 *   - Affichage du numéro de support (1-555-555-5555)
 * ============================================================
 */

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-help-contact',
  imports: [TranslateModule],
  templateUrl: './help-contact.html',
  styleUrl: './help-contact.scss',
})
export class HelpContact {
  /** Composant statique — aucune logique métier */
}
