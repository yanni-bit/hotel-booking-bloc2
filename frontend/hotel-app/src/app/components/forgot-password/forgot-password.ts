import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPassword {
  
  email: string = '';
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  
  onSubmit() {
    // Validation
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email';
      this.cdr.markForCheck();
      return;
    }
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      this.cdr.markForCheck();
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('✅ Demande envoyée:', response);
        this.loading = false;
        this.successMessage = response.message;
        this.email = ''; // Vider le champ
        this.cdr.markForCheck();
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