import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChambreService } from '../../services/chambre';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomDetail implements OnInit {
  
  chambre: any = null;
  offres: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  chambreId: number = 0;
  hotelId: number = 0;
  ville: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private chambreService: ChambreService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.chambreId = +params['chambreId'];
      this.hotelId = +params['hotelId'];
      this.ville = params['ville'];
      
      this.loadChambreDetails();
    });
  }
  
  loadChambreDetails() {
    this.loading = true;
    
    this.chambreService.getChambreWithOffers(this.chambreId).subscribe({
      next: (response) => {
        this.chambre = response.data;
        this.offres = response.data.offres || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement de la chambre';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  /**
   * Calculer le prix minimum parmi toutes les offres
   */
  getPrixMinimum(): string {
    if (this.offres.length === 0) {
      return '0';
    }
    
    const prix = this.offres.map(o => parseFloat(o.prix_nuit) || 0);
    const min = Math.min(...prix);
    
    return min.toFixed(0);
  }
}