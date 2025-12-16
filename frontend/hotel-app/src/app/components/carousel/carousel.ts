import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss'
})
export class Carousel implements OnInit, OnDestroy {
  
  currentSlide = 0;
  autoSlideInterval: any;
  
  slides = [
    {
      image: 'images/slide-1.jpg',
      alt: 'Hotel de luxe 1'
    },
    {
      image: 'images/slide-2.jpg',
      alt: 'Hotel de luxe 2'
    },
    {
      image: 'images/slide-3.jpg',
      alt: 'Hotel de luxe 3'
    }
  ];
  
  // Injection du ChangeDetectorRef (CDR)
  constructor(private cdr: ChangeDetectorRef) {} 
  
  ngOnInit() {
    this.startAutoSlide();
  }
  
  ngOnDestroy() {
    this.stopAutoSlide();
  }
  
  // Défilement automatique
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change toutes les 5 secondes
  }
  
  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }
  
  // Navigation
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    // Forcer la détection de changement après la mise à jour de la variable
    this.cdr.detectChanges(); 
  }
  
  previousSlide() {
    this.currentSlide = this.currentSlide === 0 
      ? this.slides.length - 1 
      : this.currentSlide - 1;
    // Forcer la détection de changement
    this.cdr.detectChanges(); 
  }
  
  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoSlide();
    this.startAutoSlide(); // Redémarre l'auto-slide
    // Forcer la détection de changement
    this.cdr.detectChanges(); 
  }
}