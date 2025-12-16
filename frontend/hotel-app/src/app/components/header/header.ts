import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  
  // État du menu (ouvert/fermé)
  menuOpen = false;
  
  // Toggle du menu hamburger
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}