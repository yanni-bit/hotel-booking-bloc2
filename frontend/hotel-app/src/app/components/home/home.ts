import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel';
import { ChangeDetectorRef } from '@angular/core';
import { Carousel } from '../carousel/carousel';
import { Offres } from '../offres/offres';
import { Destinations } from '../destinations/destinations';
import { Criteres } from '../criteres/criteres';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Carousel, Offres, Destinations, Criteres],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  
  hotels: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  constructor(
  private hotelService: HotelService,
  private cdr: ChangeDetectorRef
) {}
  
  ngOnInit() {
    this.loadHotels();
  }
  
  loadHotels() {
    this.hotelService.getAllHotels().subscribe({
      next: (response) => {
        console.log('Données reçues:', response);
        this.hotels = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des hôtels';
        this.loading = false;
      }
    });
  }
}