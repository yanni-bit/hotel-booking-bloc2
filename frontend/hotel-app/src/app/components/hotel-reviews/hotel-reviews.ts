import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AvisService } from '../../services/avis';

@Component({
  selector: 'app-hotel-reviews',
  imports: [CommonModule],
  templateUrl: './hotel-reviews.html',
  styleUrl: './hotel-reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelReviews implements OnInit {
  
  avis: any[] = [];
  loading: boolean = true;
  error: string = '';
  hotelId: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private avisService: AvisService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.hotelId = +this.route.parent?.snapshot.params['hotelId'];
    
    if (this.hotelId) {
      this.loadAvis();
    }
  }
  
  loadAvis() {
    this.loading = true;
    
    this.avisService.getAvisByHotelId(this.hotelId).subscribe({
      next: (response) => {
        console.log('💬 Avis:', response);
        this.avis = response.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur avis:', err);
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  // Calculer la note moyenne
get noteMoyenne(): string {
  if (this.avis.length === 0) return '0.0';
  
  const sum = this.avis.reduce((acc, a) => {
    // Convertir explicitement en nombre
    const note = parseFloat(a.note) || 0;
    return acc + note;
  }, 0);
  
  const moyenne = sum / this.avis.length;
  return moyenne.toFixed(1); // Format: "8.8"
}
  
  // Créer un tableau pour afficher les étoiles (5 étoiles max)
getStarsArray(note: number): boolean[] {
  const stars = Math.round(note / 2); // Convertir note /10 en note /5
  return Array(5).fill(false).map((_, i) => i < stars);
}
}