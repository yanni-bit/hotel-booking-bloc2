/**
 * ============================================================
 * FICHIER     : why-book.ts
 * COMPOSANT   : WhyBook
 * DESCRIPTION : Widget sidebar "Why Book with us?" présentant
 *               les avantages de réserver via la plateforme.
 *               Composant statique sans logique, affichant trois
 *               arguments commerciaux traduits (i18n) : tarifs bas,
 *               large sélection, support permanent.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : Aucun
 * FONCTIONNALITÉS :
 *   - Affichage de 3 blocs d'arguments traduits (i18n)
 *   - Low rates / Largest selection / We're always here
 * ============================================================
 */

import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-why-book',
  imports: [TranslateModule],
  templateUrl: './why-book.html',
  styleUrl: './why-book.scss',
})
export class WhyBook {
  /** Composant statique — aucune logique métier */
}
