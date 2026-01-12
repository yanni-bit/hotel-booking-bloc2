import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ContactService } from '../../services/contact.service';
import { AvisService } from '../../services/avis';
import { ReservationService } from '../../services/reservation';
import { ServiceService } from '../../services/service';

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
    private reservationService: ReservationService,
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) { }

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

    // Charger les réservations
    this.reservationService.getAllReservations().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.reservations = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement réservations:', err)
    });

    // Charger les utilisateurs
    this.authService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.users = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement utilisateurs:', err)
    });

    // Charger les hôtels
    this.http.get<any>('http://localhost:3000/api/hotels').subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.hotels = response.data.length;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur chargement hôtels:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    // Charger les services
    this.serviceService.getAllServices().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.stats.services = response.data.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur chargement services:', err)
    });
  }
}