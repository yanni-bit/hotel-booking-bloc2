import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  contactForm: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  showError = false;

  constructor(private fb: FormBuilder) {
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

    // Simuler l'envoi du formulaire (pas de backend pour contact)
    // En production, tu pourrais appeler un service pour envoyer un email
    setTimeout(() => {
      console.log('Formulaire soumis:', this.contactForm.value);
      
      this.isSubmitting = false;
      this.showSuccess = true;
      
      // Réinitialiser le formulaire après succès
      this.contactForm.reset();
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => {
        this.showSuccess = false;
      }, 5000);
    }, 1000);
  }
}