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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
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
      }
    });
  }
}