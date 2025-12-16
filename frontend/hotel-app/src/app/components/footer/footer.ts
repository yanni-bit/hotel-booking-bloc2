import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Pour la navigation interne
import { FormsModule } from '@angular/forms'; // Pour le formulaire de newsletter

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  newsletterEmail: string = ''; // Modèle pour le champ email

  // Structure des données de contact et de copyright
  contactInfo = {
    company: 'Book Your Travel',
    address: '1400 Pennsylvania Ave. Washington, DC',
    phone: '24/7 customer support: 1-555-555-5555',
    email: 'contact@bookyourtravel.com',
    copyright: "Copyright 2025 Réservation d'hôtel Formation Ilaria" // La correction de l'apostrophe est gérée ici
  };

  // Tableau des sections de liens (Support Client)
  linkSections = [
    {
      title: 'Customer Support', // Titre pour la colonne
      items: [
        { label: 'FAQ', routerLink: '/faq' },
        { label: 'Comment puis-je faire une réservation ?', routerLink: '/reservation-guide' },
        { label: 'Options de paiement', routerLink: '/payment-options' },
        { label: 'Conseils de réservation', routerLink: '/booking-tips' }
      ]
    }
  ];

  // Tableau des liens de réseaux sociaux (pour la colonne "Suivez-Nous")
  // Les 'iconClass' correspondent aux classes bi- de Bootstrap Icons que tu utilises.
  socialLinks = [
    { iconClass: 'bi bi-facebook', url: 'https://facebook.com', ariaLabel: 'Visitez notre page Facebook' },
    { iconClass: 'bi bi-youtube', url: 'https://youtube.com', ariaLabel: 'Visitez notre chaîne YouTube' },
    { iconClass: 'bi bi-linkedin', url: 'https://linkedin.com', ariaLabel: 'Visitez notre profil LinkedIn' },
    { iconClass: 'bi bi-twitter-x', url: 'https://twitter.com', ariaLabel: 'Suivez-nous sur Twitter' },
    { iconClass: 'bi bi-pinterest', url: 'https://pinterest.com', ariaLabel: 'Découvrez nos tableaux Pinterest' },
    { iconClass: 'bi bi-vimeo', url: 'https://vimeo.com', ariaLabel: 'Regardez nos vidéos Vimeo' }
  ];
  
  // Tableau des liens du bas de page (Copyright et liens légaux)
  bottomLinks = [
    { label: 'About us', routerLink: '/about' },
    { label: 'Contact', routerLink: '/contact' },
    { label: 'Partners', routerLink: '/partners' },
    { label: 'Customer service', routerLink: '/customer-service' },
    { label: 'FAQ', routerLink: '/faq' },
    { label: 'Careers', routerLink: '/careers' },
    { label: 'Terms &amp; Conditions', routerLink: '/terms' }
  ];

  // Logique de soumission de la newsletter
  subscribeToNewsletter(): void {
    if (this.newsletterEmail) {
      console.log('Inscription à la newsletter avec l\'email:', this.newsletterEmail);
      // Ici, le code pour appeler ton service d'API doit être ajouté
      alert(`Merci pour votre inscription (${this.newsletterEmail}) !`);
      this.newsletterEmail = ''; // Réinitialiser le champ
    } else {
      alert('Veuillez entrer une adresse email valide.');
    }
  }
}