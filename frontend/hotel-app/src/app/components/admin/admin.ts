import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ContactService } from '../../services/contact.service';
import { AvisService } from '../../services/avis';

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
    services: 0,
    messages: 0,
    messagesUnread: 0,
    avis: 0,
    avisNew: 0
  };
  
  loading: boolean = true;
  
  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private contactService: ContactService,
    private avisService: AvisService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadStats();
  }
  
  loadStats() {
    // Charger les stats de messages
    this.contactService.getAllMessages().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.messages = response.data.length;
          this.stats.messagesUnread = response.data.filter((m: any) => m.lu === 0).length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement messages:', err)
    });
    
    // Charger les stats des avis
    this.avisService.getAllAvis().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.avis = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement avis:', err)
    });
    
    // Charger le nombre de nouveaux avis
    this.avisService.countNewAvis().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.avisNew = response.data.newCount;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur comptage avis:', err)
    });
    
    // Pour l'instant, on simule les autres stats
    // On créera les vraies routes API plus tard
    setTimeout(() => {
      this.stats.hotels = 101;
      this.stats.reservations = 0;
      this.stats.users = 4;
      this.stats.services = 505;
      this.loading = false;
      this.cdr.markForCheck();
    }, 500);
  }
}