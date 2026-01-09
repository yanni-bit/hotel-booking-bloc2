import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService, ContactMessage } from '../../services/contact.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  contactForm: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.showSuccess = false;
    this.showError = false;

    // Préparer les données pour l'API
    const messageData: ContactMessage = {
      nom: this.contactForm.value.name,
      email: this.contactForm.value.email,
      telephone: this.contactForm.value.phone || undefined,
      sujet: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    // Appeler le service pour envoyer le message
    this.contactService.sendMessage(messageData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (response.success) {
          this.showSuccess = true;
          this.contactForm.reset();
          
          // Masquer le message de succès après 5 secondes
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        } else {
          this.showError = true;
          this.errorMessage = response.message || 'Une erreur est survenue';
        }
      },
      error: (error) => {
        console.error('Erreur envoi message:', error);
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Une erreur est survenue. Veuillez réessayer plus tard.';
        
        // Masquer le message d'erreur après 5 secondes
        setTimeout(() => {
          this.showError = false;
        }, 5000);
      }
    });
  }
}