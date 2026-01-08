import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  
  // État du menu (ouvert/fermé)
  menuOpen = false;
  
  // Recherche
  searchQuery: string = '';
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  
  // Toggle du menu hamburger
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  // Recherche avec Enter ou clic loupe
  onSearch() {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.searchQuery = ''; // Reset après recherche
      this.cdr.markForCheck();
    }
  }
  
  // Recherche sur touche Enter
  onSearchKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
  
  // Déconnexion
  logout() {
    this.authService.logout();
  }
}