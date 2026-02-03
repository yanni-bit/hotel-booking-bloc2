/**
 * ============================================================
 * FICHIER     : register.ts
 * COMPOSANT   : Register
 * DESCRIPTION : Page d'inscription de l'application. Formulaire de
 *               création de compte avec validation côté client :
 *               champs obligatoires, format email (regex), longueur
 *               mot de passe (≥6), correspondance confirmation.
 *               Après inscription réussie, redirige vers la page
 *               de connexion après un délai de 2 secondes.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (inscription utilisateur)
 *               Router (redirection vers /login après succès)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * FONCTIONNALITÉS :
 *   - Formulaire : prénom*, nom*, email*, téléphone, mot de passe*, confirmation*
 *   - Validation email par expression régulière
 *   - Validation mot de passe ≥ 6 caractères + correspondance
 *   - Gestion erreur HTTP 409 (email déjà utilisé)
 *   - Message de succès + redirection automatique vers /login (2s)
 * ============================================================
 */

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  /** Adresse email saisie */
  email: string = '';

  /** Mot de passe saisi */
  password: string = '';

  /** Confirmation du mot de passe */
  confirmPassword: string = '';

  /** Prénom de l'utilisateur (obligatoire) */
  prenom: string = '';

  /** Nom de l'utilisateur (obligatoire) */
  nom: string = '';

  /** Numéro de téléphone (optionnel) */
  telephone: string = '';

  /** Message d'erreur affiché en cas d'échec */
  errorMessage: string = '';

  /** Message de succès après inscription réussie */
  successMessage: string = '';

  /** Indicateur de chargement pendant l'appel API */
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Soumission du formulaire d'inscription
   * Validations séquentielles :
   *   1. Champs obligatoires renseignés
   *   2. Format email valide (regex)
   *   3. Mot de passe ≥ 6 caractères
   *   4. Correspondance mot de passe / confirmation
   * En cas de succès : message + redirection vers /login après 2s
   * En cas d'erreur 409 : email déjà utilisé
   */
  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation des champs obligatoires
    if (!this.email || !this.password || !this.prenom || !this.nom) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      this.cdr.markForCheck();
      return;
    }

    // Validation format email par expression régulière
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer un email valide';
      this.cdr.markForCheck();
      return;
    }

    // Validation longueur mot de passe (minimum 6 caractères)
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.cdr.markForCheck();
      return;
    }

    // Vérification correspondance mot de passe / confirmation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;

    // Construction de l'objet d'inscription (téléphone optionnel)
    const registerData = {
      email: this.email,
      password: this.password,
      prenom: this.prenom,
      nom: this.nom,
      telephone: this.telephone || undefined,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response);
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';
        this.cdr.markForCheck();

        // Redirection automatique vers /login après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur inscription:', err);
        this.loading = false;

        // Gestion des erreurs HTTP spécifiques
        if (err.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors de la création du compte. Veuillez réessayer.';
        }

        this.cdr.markForCheck();
      },
    });
  }
}
