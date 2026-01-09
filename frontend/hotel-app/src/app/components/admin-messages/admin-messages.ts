import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, ContactMessageResponse } from '../../services/contact.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-messages.html',
  styleUrl: './admin-messages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMessages implements OnInit {
  
  messages: ContactMessageResponse[] = [];
  filteredMessages: ContactMessageResponse[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Filtres
  filterStatus: string = 'all';
  filterSubject: string = 'all';
  searchTerm: string = '';
  
  // Message sélectionné pour le modal
  selectedMessage: ContactMessageResponse | null = null;
  
  // Liste des sujets
  sujets = [
    { value: 'reservation', label: 'Réservation' },
    { value: 'information', label: 'Demande d\'information' },
    { value: 'reclamation', label: 'Réclamation' },
    { value: 'autre', label: 'Autre' }
  ];
  
  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.loadMessages();
  }
  
  loadMessages() {
    this.loading = true;
    
    this.contactService.getAllMessages().subscribe({
      next: (response) => {
        console.log('✅ Messages:', response);
        this.messages = response.data || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error = 'Erreur lors du chargement des messages';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  applyFilters() {
    let filtered = [...this.messages];
    
    // Filtre par statut (lu/non lu)
    if (this.filterStatus === 'unread') {
      filtered = filtered.filter(m => m.lu === 0);
    } else if (this.filterStatus === 'read') {
      filtered = filtered.filter(m => m.lu === 1);
    } else if (this.filterStatus === 'treated') {
      filtered = filtered.filter(m => m.traite === 1);
    } else if (this.filterStatus === 'untreated') {
      filtered = filtered.filter(m => m.traite === 0);
    }
    
    // Filtre par sujet
    if (this.filterSubject !== 'all') {
      filtered = filtered.filter(m => m.sujet === this.filterSubject);
    }
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.nom.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term) ||
        (m.telephone && m.telephone.toLowerCase().includes(term))
      );
    }
    
    this.filteredMessages = filtered;
    this.cdr.markForCheck();
  }
  
  onFilterChange() {
    this.applyFilters();
  }
  
  viewMessage(message: ContactMessageResponse) {
    this.selectedMessage = message;
    
    // Marquer comme lu si non lu
    if (message.lu === 0) {
      this.contactService.markAsRead(message.id_message).subscribe({
        next: () => {
          message.lu = 1;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erreur marquage lu:', err)
      });
    }
  }
  
  closeModal() {
    this.selectedMessage = null;
  }
  
  markAsTreated(message: ContactMessageResponse) {
    this.contactService.markAsTreated(message.id_message).subscribe({
      next: () => {
        message.traite = 1;
        alert('Message marqué comme traité');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        alert('Erreur lors de la mise à jour');
      }
    });
  }
  
  deleteMessage(message: ContactMessageResponse) {
    if (!confirm(`Voulez-vous vraiment supprimer ce message de "${message.nom}" ?`)) {
      return;
    }
    
    this.contactService.deleteMessage(message.id_message).subscribe({
      next: () => {
        alert('Message supprimé');
        this.selectedMessage = null;
        this.loadMessages();
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getSujetLabel(sujet: string): string {
    const found = this.sujets.find(s => s.value === sujet);
    return found ? found.label : sujet;
  }
  
  getSujetBadgeClass(sujet: string): string {
    const colorMap: any = {
      'reservation': 'bg-primary',
      'information': 'bg-info',
      'reclamation': 'bg-danger',
      'autre': 'bg-secondary'
    };
    return colorMap[sujet] || 'bg-secondary';
  }
  
  getUnreadCount(): number {
    return this.messages.filter(m => m.lu === 0).length;
  }
}