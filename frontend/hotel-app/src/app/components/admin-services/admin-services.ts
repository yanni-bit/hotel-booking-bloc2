import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServiceService } from '../../services/service';

@Component({
  selector: 'app-admin-services',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminServices implements OnInit {
  
  services: any[] = [];
  loading: boolean = true;
  error: string = '';
  successMessage: string = '';
  
  // Modal
  showModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  currentService: any = {};
  
  // Modal suppression
  showDeleteModal: boolean = false;
  serviceToDelete: any = null;
  
  // Types de services
  typeServices = [
    { value: 'journalier', label: 'Par jour' },
    { value: 'sejour', label: 'Par séjour' },
    { value: 'unitaire', label: 'Unitaire' },
    { value: 'par_personne', label: 'Par personne/jour' }
  ];
  
  // Icônes disponibles
  icones = [
    { value: 'bi-p-circle', label: 'Parking' },
    { value: 'bi-cup-hot', label: 'Petit-déjeuner' },
    { value: 'bi-droplet', label: 'Spa' },
    { value: 'bi-taxi-front', label: 'Taxi/Transfert' },
    { value: 'bi-clock-history', label: 'Horloge' },
    { value: 'bi-wifi', label: 'WiFi' },
    { value: 'bi-tv', label: 'TV' },
    { value: 'bi-snow', label: 'Climatisation' },
    { value: 'bi-bicycle', label: 'Vélo' },
    { value: 'bi-basket', label: 'Panier' },
    { value: 'bi-star', label: 'Étoile' },
    { value: 'bi-heart', label: 'Cœur' }
  ];
  
  constructor(
    private serviceService: ServiceService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadServices();
  }
  
  loadServices() {
    this.loading = true;
    
    this.serviceService.getAllServices().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.services = response.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement services:', err);
        this.error = 'Erreur lors du chargement des services';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  // ========================================
  // MODAL CRÉATION/ÉDITION
  // ========================================
  
  openCreateModal() {
    this.modalMode = 'create';
    this.currentService = {
      nom_service: '',
      description_service: '',
      type_service: 'unitaire',
      icone_service: 'bi-star',
      actif: 1
    };
    this.showModal = true;
    this.cdr.markForCheck();
  }
  
  openEditModal(service: any) {
    this.modalMode = 'edit';
    this.currentService = { ...service };
    this.showModal = true;
    this.cdr.markForCheck();
  }
  
  closeModal() {
    this.showModal = false;
    this.currentService = {};
    this.cdr.markForCheck();
  }
  
  saveService() {
    if (!this.currentService.nom_service) {
      this.error = 'Le nom du service est requis';
      setTimeout(() => { this.error = ''; this.cdr.markForCheck(); }, 3000);
      return;
    }
    
    if (this.modalMode === 'create') {
      this.serviceService.createService(this.currentService).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Service créé avec succès';
            this.loadServices();
            this.closeModal();
            
            setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.error = 'Erreur lors de la création';
          setTimeout(() => { this.error = ''; this.cdr.markForCheck(); }, 3000);
        }
      });
    } else {
      this.serviceService.updateService(this.currentService.id_service, this.currentService).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.successMessage = 'Service modifié avec succès';
            this.loadServices();
            this.closeModal();
            
            setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur modification:', err);
          this.error = 'Erreur lors de la modification';
          setTimeout(() => { this.error = ''; this.cdr.markForCheck(); }, 3000);
        }
      });
    }
  }
  
  // ========================================
  // TOGGLE STATUT
  // ========================================
  
  toggleStatus(service: any) {
    const newStatus = service.actif ? 0 : 1;
    
    this.serviceService.toggleServiceStatus(service.id_service, newStatus).subscribe({
      next: (response: any) => {
        if (response.success) {
          service.actif = newStatus;
          this.successMessage = newStatus ? 'Service activé' : 'Service désactivé';
          
          setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur toggle:', err);
        this.error = 'Erreur lors de la modification du statut';
        setTimeout(() => { this.error = ''; this.cdr.markForCheck(); }, 3000);
      }
    });
  }
  
  // ========================================
  // SUPPRESSION
  // ========================================
  
  openDeleteModal(service: any) {
    this.serviceToDelete = service;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.serviceToDelete = null;
    this.cdr.markForCheck();
  }
  
  confirmDelete() {
    if (!this.serviceToDelete) return;
    
    this.serviceService.deleteService(this.serviceToDelete.id_service).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage = 'Service supprimé avec succès';
          this.loadServices();
          this.closeDeleteModal();
          
          setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 3000);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.error = 'Erreur lors de la suppression';
        this.closeDeleteModal();
        setTimeout(() => { this.error = ''; this.cdr.markForCheck(); }, 3000);
      }
    });
  }
  
  // ========================================
  // UTILITAIRES
  // ========================================
  
  getTypeLabel(type: string): string {
    const found = this.typeServices.find(t => t.value === type);
    return found ? found.label : type;
  }
}