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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  prenom: string = '';
  nom: string = '';
  telephone: string = '';
  
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validation
    if (!this.email || !this.password || !this.prenom || !this.nom) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      this.cdr.markForCheck();
      return;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer un email valide';
      this.cdr.markForCheck();
      return;
    }
    
    // Validation mot de passe
    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.cdr.markForCheck();
      return;
    }
    
    // Confirmation mot de passe
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.cdr.markForCheck();
      return;
    }
    
    this.loading = true;
    
    const registerData = {
      email: this.email,
      password: this.password,
      prenom: this.prenom,
      nom: this.nom,
      telephone: this.telephone || undefined
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie:', response);
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection vers la connexion...';
        this.cdr.markForCheck();
        
        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur inscription:', err);
        this.loading = false;
        
        if (err.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Erreur lors de la création du compte. Veuillez réessayer.';
        }
        
        this.cdr.markForCheck();
      }
    });
  }
}