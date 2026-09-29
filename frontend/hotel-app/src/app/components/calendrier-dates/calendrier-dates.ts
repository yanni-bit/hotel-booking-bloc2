// ============================================================================
// FICHIER : calendrier-dates.ts
// DESCRIPTION : Calendrier de sélection des dates de séjour
// AUTEUR : Yannick
// ============================================================================
// Remplace les deux champs <input type="date"> du formulaire de réservation.
// Le champ natif accepte un minimum et un maximum, mais ne sait pas désactiver
// des dates isolées au milieu d'une période : c'est la raison d'être de ce
// composant.
//
// Il interroge GET /api/chambres/:id/disponibilites et grise les nuits déjà
// retenues, puis empêche de sélectionner une plage qui en contiendrait une.
//
// AUCUNE DÉPENDANCE EXTERNE : pas de bibliothèque de calendrier, pour ne pas
// introduire un paquet dont la compatibilité avec Angular 21 serait à vérifier.
//
// PIÈGE ÉVITÉ : toutes les dates sont manipulées en chaînes 'AAAA-MM-JJ'
// construites à partir de getFullYear/getMonth/getDate, jamais via
// toISOString(), qui convertit en UTC et décale d'un jour en heure d'hiver.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

/** Une case du calendrier */
interface Jour {
  /** Date au format 'AAAA-MM-JJ', chaîne vide pour une case de remplissage */
  iso: string;
  /** Numéro du jour dans le mois */
  numero: number;
  /** Case vide servant à aligner le premier jour sur le bon jour de semaine */
  vide: boolean;
  /** Antérieure à aujourd'hui */
  passe: boolean;
  /** Nuit déjà retenue par une autre réservation */
  occupe: boolean;
}

@Component({
  selector: 'app-calendrier-dates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendrier-dates.html',
  styleUrl: './calendrier-dates.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendrierDates implements OnChanges {
  // ==========================================================================
  // ENTRÉES ET SORTIES
  // ==========================================================================

  /** Chambre dont on veut connaître les disponibilités */
  @Input() idChambre: number | null = null;

  /** Date d'arrivée sélectionnée, format 'AAAA-MM-JJ' */
  @Input() checkIn: string = '';

  /** Date de départ sélectionnée, format 'AAAA-MM-JJ' */
  @Input() checkOut: string = '';

  /** Émis à chaque sélection complète ou partielle */
  @Output() datesChange = new EventEmitter<{
    checkIn: string;
    checkOut: string;
  }>();

  // ==========================================================================
  // ÉTAT INTERNE
  // ==========================================================================

  /** Nuits indisponibles, au format 'AAAA-MM-JJ' */
  nuitsOccupees = new Set<string>();

  /** Périodes brutes renvoyées par l'API, pour le récapitulatif textuel */
  periodes: any[] = [];

  /** Premier mois affiché */
  moisCourant: Date = new Date();

  /** Message affiché quand la plage choisie est impossible */
  message: string = '';

  /** Chargement en cours */
  chargement: boolean = false;

  /** Libellés des jours de semaine, du lundi au dimanche */
  joursSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    // On affiche par défaut le mois de la date d'arrivée si elle est connue,
    // sinon le mois en cours.
    this.moisCourant = new Date();
    this.moisCourant.setDate(1);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idChambre'] && this.idChambre) {
      this.chargerDisponibilites();
    }
    if (changes['checkIn'] && this.checkIn) {
      const d = this.depuisIso(this.checkIn);
      if (d) {
        this.moisCourant = new Date(d.getFullYear(), d.getMonth(), 1);
      }
    }
  }

  // ==========================================================================
  // CHARGEMENT DES DISPONIBILITÉS
  // ==========================================================================

  /**
   * Interroge l'API et construit l'ensemble des nuits indisponibles.
   *
   * Une réservation du 8 au 10 occupe les nuits du 8 et du 9. Le 10 reste
   * libre : c'est le jour du départ, un autre client peut arriver ce jour-là.
   * C'est la même règle que le contrôle de chevauchement côté serveur, qui
   * compare avec des inégalités strictes.
   */
  chargerDisponibilites() {
    if (!this.idChambre) return;

    this.chargement = true;
    this.http
      .get<any>(`http://localhost:3000/api/chambres/${this.idChambre}/disponibilites`)
      .subscribe({
        next: (reponse) => {
          this.periodes = reponse?.data?.periodes_occupees || [];
          this.nuitsOccupees = new Set<string>();

          for (const p of this.periodes) {
            let jour = this.depuisIso(p.check_in);
            const fin = this.depuisIso(p.check_out);
            if (!jour || !fin) continue;

            // On s'arrête avant la date de départ, qui reste disponible.
            while (jour < fin) {
              this.nuitsOccupees.add(this.versIso(jour));
              jour = this.ajouterJours(jour, 1);
            }
          }

          this.chargement = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement disponibilités:', err);
          this.chargement = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ==========================================================================
  // CONSTRUCTION DE LA GRILLE
  // ==========================================================================

  /**
   * Construit la grille d'un mois, cases de remplissage comprises.
   * @param decalage - 0 pour le mois courant, 1 pour le suivant
   * @returns {Jour[]} Cases du mois, alignées sur une semaine commençant lundi
   */
  grille(decalage: number): Jour[] {
    const base = new Date(
      this.moisCourant.getFullYear(),
      this.moisCourant.getMonth() + decalage,
      1,
    );

    // getDay() renvoie 0 pour dimanche : on ramène la semaine au lundi.
    const premierJourSemaine = (base.getDay() + 6) % 7;
    const nbJours = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

    const aujourdhui = this.versIso(new Date());
    const cases: Jour[] = [];

    for (let i = 0; i < premierJourSemaine; i++) {
      cases.push({ iso: '', numero: 0, vide: true, passe: false, occupe: false });
    }

    for (let n = 1; n <= nbJours; n++) {
      const d = new Date(base.getFullYear(), base.getMonth(), n);
      const iso = this.versIso(d);
      cases.push({
        iso,
        numero: n,
        vide: false,
        passe: iso < aujourdhui,
        occupe: this.nuitsOccupees.has(iso),
      });
    }

    return cases;
  }

  /**
   * Libellé du mois affiché.
   * @param decalage - 0 pour le mois courant, 1 pour le suivant
   * @returns {string} Par exemple « novembre 2026 »
   */
  libelleMois(decalage: number): string {
    const d = new Date(this.moisCourant.getFullYear(), this.moisCourant.getMonth() + decalage, 1);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  /** Affiche les deux mois précédents */
  moisPrecedent() {
    this.moisCourant = new Date(this.moisCourant.getFullYear(), this.moisCourant.getMonth() - 1, 1);
    this.cdr.markForCheck();
  }

  /** Affiche les deux mois suivants */
  moisSuivant() {
    this.moisCourant = new Date(this.moisCourant.getFullYear(), this.moisCourant.getMonth() + 1, 1);
    this.cdr.markForCheck();
  }

  // ==========================================================================
  // SÉLECTION
  // ==========================================================================

  /**
   * Traite le clic sur une case.
   *
   * Premier clic, ou clic après une sélection complète : nouvelle date
   * d'arrivée. Clic suivant : date de départ, si la plage ne contient aucune
   * nuit occupée.
   *
   * @param jour - Case cliquée
   */
  selectionner(jour: Jour) {
    if (jour.vide || jour.passe || jour.occupe) return;

    this.message = '';

    const rienOuComplet = !this.checkIn || (this.checkIn && this.checkOut);
    if (rienOuComplet || jour.iso <= this.checkIn) {
      this.checkIn = jour.iso;
      this.checkOut = '';
      this.emettre();
      return;
    }

    if (this.plageContientUneNuitOccupee(this.checkIn, jour.iso)) {
      this.message =
        'La période choisie contient des nuits déjà réservées. Choisissez un départ plus proche.';
      this.cdr.markForCheck();
      return;
    }

    this.checkOut = jour.iso;
    this.emettre();
  }

  /**
   * Vérifie qu'aucune nuit entre l'arrivée et le départ n'est déjà prise.
   * La nuit du départ n'est pas comptée : on ne dort pas ce soir-là.
   * @param debut - Date d'arrivée 'AAAA-MM-JJ'
   * @param fin - Date de départ 'AAAA-MM-JJ'
   * @returns {boolean} true si au moins une nuit est indisponible
   */
  plageContientUneNuitOccupee(debut: string, fin: string): boolean {
    let jour = this.depuisIso(debut);
    const borne = this.depuisIso(fin);
    if (!jour || !borne) return false;

    while (jour < borne) {
      if (this.nuitsOccupees.has(this.versIso(jour))) return true;
      jour = this.ajouterJours(jour, 1);
    }
    return false;
  }

  /** Émet les dates courantes vers le composant parent */
  private emettre() {
    this.datesChange.emit({ checkIn: this.checkIn, checkOut: this.checkOut });
    this.cdr.markForCheck();
  }

  /** Efface la sélection en cours */
  effacer() {
    this.checkIn = '';
    this.checkOut = '';
    this.message = '';
    this.emettre();
  }

  // ==========================================================================
  // ÉTAT D'UNE CASE, POUR L'AFFICHAGE
  // ==========================================================================

  /** La case est la date d'arrivée */
  estArrivee(jour: Jour): boolean {
    return !jour.vide && jour.iso === this.checkIn;
  }

  /** La case est la date de départ */
  estDepart(jour: Jour): boolean {
    return !jour.vide && jour.iso === this.checkOut;
  }

  /** La case est strictement comprise entre l'arrivée et le départ */
  estDansLaPlage(jour: Jour): boolean {
    if (jour.vide || !this.checkIn || !this.checkOut) return false;
    return jour.iso > this.checkIn && jour.iso < this.checkOut;
  }

  /** Libellé lisible d'une date, pour les infobulles et le récapitulatif */
  formatLisible(iso: string): string {
    const d = this.depuisIso(iso);
    if (!d) return '';
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // ==========================================================================
  // UTILITAIRES DE DATE
  //
  // Volontairement écrits à la main plutôt qu'avec toISOString() : cette
  // méthode convertit en UTC et renvoie la veille pour toute date créée en
  // heure locale à l'est de Greenwich.
  // ==========================================================================

  /** Convertit un objet Date en 'AAAA-MM-JJ' selon le fuseau local */
  versIso(d: Date): string {
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const jour = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mois}-${jour}`;
  }

  /** Convertit 'AAAA-MM-JJ' en objet Date local, ou null si la chaîne est vide */
  depuisIso(iso: string): Date | null {
    if (!iso) return null;
    const [a, m, j] = iso.split('-').map(Number);
    if (!a || !m || !j) return null;
    return new Date(a, m - 1, j);
  }

  /** Renvoie une nouvelle date décalée de n jours */
  ajouterJours(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }
}
