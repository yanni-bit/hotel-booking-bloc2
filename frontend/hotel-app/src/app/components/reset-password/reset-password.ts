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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPassword implements OnInit {
  
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Toggle affichage mot de passe
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (!this.token) {
        this.errorMessage = 'Token manquant. Veuillez utiliser le lien envoyé par email.';
        this.cdr.markForCheck();
      }
    });
  }
  
  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }
  
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  onSubmit() {
    // Validation
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      this.cdr.markForCheck();
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.cdr.markForCheck();
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.cdr.markForCheck();
      return;
    }
    
    if (!this.token) {
      this.errorMessage = 'Token manquant';
      this.cdr.markForCheck();
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe réinitialisé:', response);
        this.loading = false;
        this.successMessage = response.message;
        this.cdr.markForCheck();
        
        // Redirection vers login après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.cdr.markForCheck();
      }
    });
  }
}