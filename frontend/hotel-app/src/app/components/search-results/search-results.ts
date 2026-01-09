import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HotelService } from '../../services/hotel';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss'
})
export class SearchResults implements OnInit {
  
  query: string = '';
  results: any[] = [];
  loading: boolean = false;
  error: string = '';
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalResults: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.currentPage = 1;
        this.search();
      }
    });
  }
  
  search() {
    this.loading = true;
    this.error = '';
    
    this.hotelService.searchHotels(this.query, this.currentPage).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          if (response.success) {
            this.results = response.data;
            this.currentPage = response.pagination.currentPage;
            this.totalPages = response.pagination.totalPages;
            this.totalResults = response.pagination.totalResults;
          } else {
            this.error = 'Erreur lors de la recherche';
          }
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Erreur recherche:', err);
          this.error = 'Erreur lors de la recherche';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
  
  // Navigation pagination
goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
    this.ngZone.run(() => {
      this.currentPage = page;
      this.search();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

previousPage() {
  this.goToPage(this.currentPage - 1);
}

nextPage() {
  this.goToPage(this.currentPage + 1);
}
}