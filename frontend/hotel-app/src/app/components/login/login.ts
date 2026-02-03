/**
 * ============================================================
 * FICHIER     : login.ts
 * COMPOSANT   : Login
 * DESCRIPTION : Page de connexion de l'application. Permet aux
 *               utilisateurs de s'authentifier via email et mot de
 *               passe. Gère la validation basique des champs, l'appel
 *               API d'authentification et la redirection vers l'accueil
 *               après connexion réussie. Affiche des messages d'erreur
 *               contextuels selon le code HTTP retourné (401, 403).
 * AUTEUR      : Yannick
 * DATE        : 2025
 * SERVICES    : AuthService (authentification utilisateur)
 *               Router (redirection après connexion)
 *               ChangeDetectorRef (détection manuelle des changements OnPush)
 * FONCTIONNALITÉS :
 *   - Formulaire de connexion (email + mot de passe)
 *   - Validation basique des champs obligatoires
 *   - Appel API d'authentification via AuthService
 *   - Gestion des erreurs HTTP (401, 403, autre)
 *   - Redirection vers l'accueil après connexion réussie
 *   - Liens vers inscription et mot de passe oublié
 * ============================================================
 */

import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  /** Adresse email saisie par l'utilisateur */
  email: string = '';

  /** Mot de passe saisi par l'utilisateur */
  password: string = '';

  /** Message d'erreur affiché en cas d'échec de connexion */
  errorMessage: string = '';

  /** Indicateur d'état de chargement pendant l'appel API */
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Soumission du formulaire de connexion
   * Valide les champs, appelle AuthService.login() puis redirige
   * vers l'accueil en cas de succès ou affiche un message d'erreur
   * contextuel selon le code HTTP (401 = identifiants, 403 = désactivé)
   */
  onSubmit() {
    // Validation basique
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie:', response);
        this.loading = false;

        // Rediriger vers l'accueil
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('❌ Erreur de connexion:', err);
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (err.status === 403) {
          this.errorMessage = 'Compte désactivé';
        } else {
          this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        }

        this.cdr.markForCheck();
      },
    });
  }
}
