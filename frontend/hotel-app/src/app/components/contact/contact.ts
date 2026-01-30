// ============================================================================
// FICHIER : contact.component.ts
// DESCRIPTION : Composant page Contact avec formulaire d'envoi de message
//               et informations de contact (téléphone, email, carte)
// AUTEUR : Yannick
// DATE : 2025
// ============================================================================
// SERVICES INJECTÉS :
//   - ContactService : Envoi des messages de contact à l'API
// FONCTIONNALITÉS :
//   - Formulaire de contact avec validation réactive (Critère C2.b)
//   - Champs : nom, email, téléphone, sujet, message
//   - Validation en temps réel avec feedback visuel
//   - Envoi du message via l'API
//   - Gestion des états de succès et d'erreur
// MODULES UTILISÉS :
//   - ReactiveFormsModule : Formulaires réactifs Angular
//   - FormBuilder : Construction du FormGroup
//   - Validators : Validateurs intégrés Angular
// ============================================================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService, ContactMessage } from '../../services/contact.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  // ==========================================================================
  // PROPRIÉTÉS - FORMULAIRE
  // ==========================================================================

  /**
   * FormGroup du formulaire de contact
   * Champs : name, email, phone, subject, message
   */
  contactForm: FormGroup;

  // ==========================================================================
  // PROPRIÉTÉS - ÉTATS
  // ==========================================================================

  /** Indicateur de soumission en cours */
  isSubmitting = false;

  /** Affichage du message de succès */
  showSuccess = false;

  /** Affichage du message d'erreur */
  showError = false;

  /** Message d'erreur détaillé */
  errorMessage = '';

  // ==========================================================================
  // CONSTRUCTEUR
  // ==========================================================================

  /**
   * Initialisation du formulaire avec validateurs
   * @param {FormBuilder} fb - Service de construction de formulaires
   * @param {ContactService} contactService - Service d'envoi de messages
   *
   * Validations appliquées (Critère C2.b) :
   * - name : obligatoire, minimum 2 caractères
   * - email : obligatoire, format email valide
   * - phone : optionnel
   * - subject : obligatoire
   * - message : obligatoire, minimum 10 caractères
   */
  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // ==========================================================================
  // ACCESSEURS (GETTERS)
  // ==========================================================================

  /**
   * Getter pour accéder facilement aux contrôles du formulaire
   * Utilisé dans le template pour la validation
   * @returns {FormGroup['controls']} Les contrôles du formulaire
   */
  get f() {
    return this.contactForm.controls;
  }

  // ==========================================================================
  // MÉTHODES - SOUMISSION DU FORMULAIRE
  // ==========================================================================

  /**
   * Soumission du formulaire de contact
   * - Marque tous les champs comme touchés (affiche les erreurs)
   * - Vérifie la validité du formulaire
   * - Prépare et envoie les données à l'API
   * - Gère les réponses succès/erreur
   */
  onSubmit(): void {
    // -------------------------------------------------------------------------
    // Marquer tous les champs comme touchés pour afficher les erreurs
    // -------------------------------------------------------------------------
    this.contactForm.markAllAsTouched();

    // Arrêter si le formulaire est invalide
    if (this.contactForm.invalid) {
      return;
    }

    // -------------------------------------------------------------------------
    // Initialisation de l'état de soumission
    // -------------------------------------------------------------------------
    this.isSubmitting = true;
    this.showSuccess = false;
    this.showError = false;

    // -------------------------------------------------------------------------
    // Préparer les données pour l'API
    // Mapping des noms de champs (front → back)
    // -------------------------------------------------------------------------
    const messageData: ContactMessage = {
      nom: this.contactForm.value.name,
      email: this.contactForm.value.email,
      telephone: this.contactForm.value.phone || undefined,
      sujet: this.contactForm.value.subject,
      message: this.contactForm.value.message,
    };

    // -------------------------------------------------------------------------
    // Appeler le service pour envoyer le message
    // -------------------------------------------------------------------------
    this.contactService.sendMessage(messageData).subscribe({
      // Succès de l'envoi
      next: (response) => {
        this.isSubmitting = false;

        if (response.success) {
          this.showSuccess = true;
          this.contactForm.reset();

          // Masquer le message de succès après 5 secondes
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        } else {
          // Réponse API avec success: false
          this.showError = true;
          this.errorMessage = response.message || 'Une erreur est survenue';
        }
      },
      // Erreur HTTP
      error: (error) => {
        console.error('Erreur envoi message:', error);
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage =
          error.error?.message || 'Une erreur est survenue. Veuillez réessayer plus tard.';

        // Masquer le message d'erreur après 5 secondes
        setTimeout(() => {
          this.showError = false;
        }, 5000);
      },
    });
  }
}
