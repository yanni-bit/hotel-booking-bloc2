import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvisService, AvisResponse } from '../../services/avis';

@Component({
  selector: 'app-admin-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-avis.html',
  styleUrl: './admin-avis.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAvis implements OnInit {
  
  avis: AvisResponse[] = [];
  filteredAvis: AvisResponse[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Filtres
  filterPeriod: string = 'all';
  filterNote: string = 'all';
  searchTerm: string = '';
  
  // Avis sélectionné pour le modal
  selectedAvis: AvisResponse | null = null;
  
  // Stats
  newAvisCount: number = 0;
  
  // Types de voyageurs
  typesVoyageur = [
    { value: 'couple', label: 'Couple' },
    { value: 'famille', label: 'Famille' },
    { value: 'solo', label: 'Solo' },
    { value: 'business', label: 'Business' },
    { value: 'groupe', label: 'Groupe' },
    { value: 'autre', label: 'Autre' }
  ];
  
  constructor(
    private avisService: AvisService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadAvis();
    this.loadNewCount();
  }
  
  loadAvis() {
    this.loading = true;
    
    this.avisService.getAllAvis().subscribe({
      next: (response: any) => {
        console.log('✅ Avis:', response);
        this.avis = response.data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des avis';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  loadNewCount() {
    this.avisService.countNewAvis().subscribe({
      next: (response: any) => {
        this.newAvisCount = response.data?.newCount || 0;
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Erreur comptage:', err)
    });
  }
  
  applyFilters() {
    let filtered = [...this.avis];
    
    // Filtre par période
    if (this.filterPeriod === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(a => new Date(a.date_avis) >= sevenDaysAgo);
    } else if (this.filterPeriod === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(a => new Date(a.date_avis) >= thirtyDaysAgo);
    }
    
    // Filtre par note
    if (this.filterNote === 'high') {
      filtered = filtered.filter(a => Number(a.note) >= 8);
    } else if (this.filterNote === 'medium') {
      filtered = filtered.filter(a => Number(a.note) >= 5 && Number(a.note) < 8);
    } else if (this.filterNote === 'low') {
      filtered = filtered.filter(a => Number(a.note) < 5);
    }
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.pseudo_user.toLowerCase().includes(term) ||
        (a.nom_hotel && a.nom_hotel.toLowerCase().includes(term)) ||
        (a.commentaire && a.commentaire.toLowerCase().includes(term)) ||
        (a.titre_avis && a.titre_avis.toLowerCase().includes(term))
      );
    }
    
    this.filteredAvis = filtered;
    this.cdr.markForCheck();
  }
  
  onFilterChange() {
    this.applyFilters();
  }
  
  viewAvis(avis: AvisResponse) {
    this.selectedAvis = avis;
  }
  
  closeModal() {
    this.selectedAvis = null;
  }
  
  deleteAvis(avis: AvisResponse) {
    if (!confirm(`Voulez-vous vraiment supprimer cet avis de "${avis.pseudo_user}" ?`)) {
      return;
    }
    
    this.avisService.deleteAvis(avis.id_avis).subscribe({
      next: () => {
        alert('Avis supprimé');
        this.selectedAvis = null;
        this.loadAvis();
        this.loadNewCount();
      },
      error: (err: any) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }
  
  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  getTypeVoyageurLabel(type: string): string {
    const found = this.typesVoyageur.find(t => t.value === type);
    return found ? found.label : type;
  }
  
  getNoteClass(note: number): string {
    if (note >= 8) return 'bg-success';
    if (note >= 5) return 'bg-warning text-dark';
    return 'bg-danger';
  }
  
  getNewCount(): number {
    return this.newAvisCount;
  }
  
  isUserAvis(avis: AvisResponse): boolean {
    return avis.id_user !== null && avis.id_user !== undefined;
  }
}