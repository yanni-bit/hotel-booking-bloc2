import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin implements OnInit {
  
  stats = {
    hotels: 0,
    reservations: 0,
    users: 0,
    services: 0
  };
  
  loading: boolean = true;
  
  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadStats();
  }
  
  loadStats() {
    // Pour l'instant, on simule les stats
    // On créera les vraies routes API plus tard
    
    setTimeout(() => {
      this.stats = {
        hotels: 101,
        reservations: 0,
        users: 4,
        services: 505
      };
      this.loading = false;
      this.cdr.markForCheck();
    }, 500);
  }
}