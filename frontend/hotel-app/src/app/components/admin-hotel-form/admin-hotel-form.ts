import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HotelAdminService } from '../../services/admin-hotels';

@Component({
  selector: 'app-admin-hotel-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-hotel-form.html',
  styleUrl: './admin-hotel-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHotelForm implements OnInit {

  isEditMode: boolean = false;
  hotelId: number | null = null;

  // Formulaire
  hotel = {
    nom_hotel: '',
    description_hotel: '',
    rue_hotel: '',
    code_postal_hotel: '',
    ville_hotel: '',
    pays_hotel: '',
    tel_hotel: '',
    email_hotel: '',
    site_web_hotel: '',
    img_hotel: '',
    nbre_etoile_hotel: 3,
    latitude: null as number | null,
    longitude: null as number | null
  };

  loading: boolean = false;
  submitting: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelAdminService: HotelAdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.hotelId = parseInt(id);
      this.loadHotel();
    }
  }

  loadHotel() {
    if (!this.hotelId) return;

    this.loading = true;

    this.hotelAdminService.getById(this.hotelId).subscribe({
      next: (response) => {
        console.log('✅ Hôtel chargé:', response);
        const hotelData = response.data;

        // Pré-remplir le formulaire
        this.hotel = {
          nom_hotel: hotelData.nom_hotel || '',
          description_hotel: hotelData.description_hotel || '',
          rue_hotel: hotelData.rue_hotel || '',
          code_postal_hotel: hotelData.code_postal_hotel || '',
          ville_hotel: hotelData.ville_hotel || '',
          pays_hotel: hotelData.pays_hotel || '',
          tel_hotel: hotelData.tel_hotel || '',
          email_hotel: hotelData.email_hotel || '',
          site_web_hotel: hotelData.site_web_hotel || '',
          img_hotel: hotelData.img_hotel || '',
          nbre_etoile_hotel: hotelData.nbre_etoile_hotel || 3,
          latitude: hotelData.latitude || null,
          longitude: hotelData.longitude || null
        };

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Erreur chargement hôtel:', err);
        this.error = 'Erreur lors du chargement de l\'hôtel';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit() {
    // Validation
    if (!this.hotel.nom_hotel || !this.hotel.ville_hotel || !this.hotel.pays_hotel) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Nettoyer les données
    const hotelData = {
      ...this.hotel,
      nbre_etoile_hotel: Number(this.hotel.nbre_etoile_hotel),
      latitude: this.hotel.latitude || null,
      longitude: this.hotel.longitude || null,
      tel_hotel: this.hotel.tel_hotel || null,
      email_hotel: this.hotel.email_hotel || null,
      site_web_hotel: this.hotel.site_web_hotel || null,
      img_hotel: this.hotel.img_hotel || null
    };

    this.submitting = true;

    if (this.isEditMode && this.hotelId) {
      // MODE ÉDITION
      this.hotelAdminService.update(this.hotelId, hotelData).subscribe({
        next: () => {
          alert('Hôtel modifié avec succès');
          this.router.navigate(['/admin/hotels']);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de la modification');
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      // MODE CRÉATION
      this.hotelAdminService.create(hotelData).subscribe({
        next: () => {
          alert('Hôtel créé avec succès');
          this.router.navigate(['/admin/hotels']);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          alert('Erreur lors de la création');
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}