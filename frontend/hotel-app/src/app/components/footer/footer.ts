// ============================================================================
// FICHIER : footer.component.ts
// DESCRIPTION : Composant Footer affichant les informations de contact,
//               liens de support, réseaux sociaux et formulaire newsletter
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// FONCTIONNALITÉS :
//   - Affichage des coordonnées de l'entreprise
//   - Liens vers les pages de support client
//   - Icônes des réseaux sociaux avec liens externes
//   - Formulaire d'inscription à la newsletter
//   - Liens légaux en bas de page (About, Contact, Terms, etc.)
// MODULES UTILISÉS :
//   - FormsModule : Binding du formulaire newsletter (ngModel)
//   - RouterLink : Navigation interne
//   - TranslateModule : Internationalisation
// ============================================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Pour la navigation interne
import { FormsModule } from '@angular/forms'; // Pour le formulaire de newsletter
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  // ==========================================================================
  // PROPRIÉTÉS - FORMULAIRE NEWSLETTER
  // ==========================================================================

  /** Email saisi dans le formulaire de newsletter */
  newsletterEmail: string = '';

  // ==========================================================================
  // PROPRIÉTÉS - DONNÉES DE CONTACT
  // ==========================================================================

  /**
   * Informations de contact de l'entreprise
   * Utilisées dans la colonne "Contact" du footer
   */
  contactInfo = {
    company: 'Book Your Travel',
    address: '1400 Pennsylvania Ave. Washington, DC',
    phone: '24/7 customer support: 1-555-555-5555',
    email: 'contact@bookyourtravel.com',
    copyright: "Copyright 2025 Réservation d'hôtel Formation Ilaria",
  };

  // ==========================================================================
  // PROPRIÉTÉS - LIENS DE SUPPORT
  // ==========================================================================

  /**
   * Sections de liens pour le support client
   * Chaque section contient un titre et une liste d'items
   * @property {string} label - Texte affiché du lien
   * @property {string} routerLink - Route interne Angular
   */
  linkSections = [
    {
      title: 'Customer Support',
      items: [
        { label: 'FAQ', routerLink: '/faq' },
        { label: 'Comment puis-je faire une réservation ?', routerLink: '/reservation-guide' },
        { label: 'Options de paiement', routerLink: '/payment-options' },
        { label: 'Conseils de réservation', routerLink: '/booking-tips' },
      ],
    },
  ];

  // ==========================================================================
  // PROPRIÉTÉS - RÉSEAUX SOCIAUX
  // ==========================================================================

  /**
   * Liens vers les réseaux sociaux
   * Affichés sous forme d'icônes Bootstrap Icons
   * @property {string} iconClass - Classe CSS Bootstrap Icons (bi-xxx)
   * @property {string} url - URL externe du réseau social
   * @property {string} ariaLabel - Description pour l'accessibilité
   */
  socialLinks = [
    {
      iconClass: 'bi bi-facebook',
      url: 'https://facebook.com',
      ariaLabel: 'Visitez notre page Facebook',
    },
    {
      iconClass: 'bi bi-youtube',
      url: 'https://youtube.com',
      ariaLabel: 'Visitez notre chaîne YouTube',
    },
    {
      iconClass: 'bi bi-linkedin',
      url: 'https://linkedin.com',
      ariaLabel: 'Visitez notre profil LinkedIn',
    },
    {
      iconClass: 'bi bi-twitter-x',
      url: 'https://twitter.com',
      ariaLabel: 'Suivez-nous sur Twitter',
    },
    {
      iconClass: 'bi bi-pinterest',
      url: 'https://pinterest.com',
      ariaLabel: 'Découvrez nos tableaux Pinterest',
    },
    { iconClass: 'bi bi-vimeo', url: 'https://vimeo.com', ariaLabel: 'Regardez nos vidéos Vimeo' },
  ];

  // ==========================================================================
  // PROPRIÉTÉS - LIENS LÉGAUX (BAS DE PAGE)
  // ==========================================================================

  /**
   * Liens affichés dans le bas de page (copyright)
   * Navigation vers les pages légales et informatives
   */
  bottomLinks = [
    { label: 'About us', routerLink: '/about' },
    { label: 'Contact', routerLink: '/contact' },
    { label: 'Partners', routerLink: '/partners' },
    { label: 'Customer service', routerLink: '/customer-service' },
    { label: 'FAQ', routerLink: '/faq' },
    { label: 'Careers', routerLink: '/careers' },
    { label: 'Terms &amp; Conditions', routerLink: '/terms' },
  ];

  // ==========================================================================
  // MÉTHODES - NEWSLETTER
  // ==========================================================================

  /**
   * Inscription à la newsletter
   * Valide l'email et simule l'envoi (à connecter à une API)
   * Réinitialise le champ après soumission
   */
  subscribeToNewsletter(): void {
    if (this.newsletterEmail) {
      console.log("Inscription à la newsletter avec l'email:", this.newsletterEmail);
      // TODO: Appeler le service d'API pour l'inscription
      alert(`Merci pour votre inscription (${this.newsletterEmail}) !`);
      this.newsletterEmail = ''; // Réinitialiser le champ
    } else {
      alert('Veuillez entrer une adresse email valide.');
    }
  }
}
