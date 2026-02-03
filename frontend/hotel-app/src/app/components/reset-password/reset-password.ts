/**
 * ============================================================
 * FICHIER     : reset-password.ts
 * COMPOSANT   : ResetPassword
 * DESCRIPTION : Page de réinitialisation du mot de passe. Accessible
 *               via un lien email contenant un token en queryParam.
 *               Formulaire : nouveau mot de passe + confirmation
 *               avec toggle visibilité (œil). Validations : champs
 *               requis, longueur ≥6, correspondance, token présent.
 *               Après succès, redirection vers /login après 3 secondes.
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (resetPassword avec token)
 *               Router (redirection vers /login)
 *               ActivatedRoute (récupération queryParam token)
 *               ChangeDetectorRef (détection manuelle OnPush)
 * FONCTIONNALITÉS :
 *   - Récupération du token depuis l'URL (?token=xxx)
 *   - Toggle visibilité mot de passe (nouveau + confirmation)
 *   - Validation : champs requis, ≥6 caractères, correspondance
 *   - Appel AuthService.resetPassword(token, newPassword)
 *   - Message de succès + redirection automatique (3s)
 *   - Si token absent : message d'erreur + lien forgot-password
 * ============================================================
 */

import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  /** Token de réinitialisation récupéré depuis l'URL */
  token: string = '';

  /** Nouveau mot de passe saisi */
  newPassword: string = '';

  /** Confirmation du nouveau mot de passe */
  confirmPassword: string = '';

  /** Indicateur de chargement pendant l'appel API */
  loading: boolean = false;

  /** Message de succès après réinitialisation réussie */
  successMessage: string = '';

  /** Message d'erreur (validation ou API) */
  errorMessage: string = '';

  /** Toggle affichage du champ nouveau mot de passe */
  showNewPassword: boolean = false;

  /** Toggle affichage du champ confirmation */
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialisation : récupère le token depuis les queryParams de l'URL
   * Si absent, affiche un message d'erreur invitant à utiliser le lien email
   */
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';

      if (!this.token) {
        this.errorMessage = 'Token manquant. Veuillez utiliser le lien envoyé par email.';
        this.cdr.markForCheck();
      }
    });
  }

  /** Bascule la visibilité du champ nouveau mot de passe */
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  /** Bascule la visibilité du champ confirmation mot de passe */
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Soumission du formulaire de réinitialisation
   * Validations séquentielles :
   *   1. Champs obligatoires renseignés
   *   2. Mot de passe ≥ 6 caractères
   *   3. Correspondance nouveau / confirmation
   *   4. Token présent
   * En cas de succès : message + redirection vers /login après 3s
   */
  onSubmit() {
    // Validation des champs obligatoires
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.cdr.markForCheck();
      return;
    }

    // Validation longueur mot de passe (minimum 6 caractères)
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.cdr.markForCheck();
      return;
    }

    // Vérification correspondance nouveau / confirmation
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.cdr.markForCheck();
      return;
    }

    // Vérification présence du token
    if (!this.token) {
      this.errorMessage = 'Token manquant';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Appel API de réinitialisation avec le token et le nouveau mot de passe
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe réinitialisé:', response);
        this.loading = false;
        this.successMessage = response.message;
        this.cdr.markForCheck();

        // Redirection automatique vers /login après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.cdr.markForCheck();
      },
    });
  }
}
