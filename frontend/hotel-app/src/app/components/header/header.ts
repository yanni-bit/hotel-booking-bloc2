import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  
  // État du menu (ouvert/fermé)
  menuOpen = false;
  
  constructor(
    public authService: AuthService, // ← PUBLIC pour l'utiliser dans le template
    private router: Router
  ) {}
  
  // Toggle du menu hamburger
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  // Déconnexion
  logout() {
    this.authService.logout();
  }
}